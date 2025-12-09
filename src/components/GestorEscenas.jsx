import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import styles from './GestorEscenas.module.css';

// ==========================================================
// CONFIGURACIÓN GLOBAL (SIN CAMBIOS)
// ==========================================================

const DAYS_OF_WEEK = [
    { key: 'mon', label: 'Lun' },
    { key: 'tue', label: 'Mar' },
    { key: 'wed', label: 'Mié' },
    { key: 'thu', label: 'Jue' },
    { key: 'fri', label: 'Vie' },
    { key: 'sat', label: 'Sáb' },
    { key: 'sun', label: 'Dom' },
];

// SVG para Chorros de Agua
const CHORROS_SVG = (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ width: '24px', height: '24px' }} 
    >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
);

// SVG para Luces
const LUCES_SVG = (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ width: '24px', height: '24px' }} 
    >
        <line x1="12" y1="1" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"></line><line x1="16.95" y1="16.95" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"></line><line x1="16.95" y1="7.05" x2="19.78" y2="4.22"></line>
    </svg>
);


const GestorEscenas = ({ escena, setEscenas }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- LÓGICA DE MUTACIÓN (POST) ---
  const mutation = useMutation({
    mutationFn: (nuevaEscena) => {
      return fetch(`${URL_BASE}/escenas.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaEscena),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al guardar la escena');
        }
        return response.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      alert("¡Escena guardada en la nube!");
      navigate('/escenas'); 
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    }
  });


  // --- ESTADOS DEL FORMULARIO ---
  const [step, setStep] = useState(1);
  const [errorLocal, setErrorLocal] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    descripcion: "",
    actions: {
      chorrosAgua: false,
      luces: {
        estado: false,
        color: { r: 255, g: 255, b: 255 }
      }
    },
    schedule: {
      enabled: false,
      days: [], 
      time: "19:00" 
    }
  });

  // --- FUNCIONES DE AYUDA Y HANDLERS (SIN CAMBIOS) ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorLocal("");
  };

  const handleScheduleChange = (key, value) => {
      setFormData(prev => ({
          ...prev,
          schedule: {
              ...prev.schedule,
              [key]: value
          }
      }));
      setErrorLocal("");
  };

  const handleDayToggle = (dayKey) => {
      setFormData(prev => {
          const { days } = prev.schedule;
          const newDays = days.includes(dayKey)
              ? days.filter(d => d !== dayKey) 
              : [...days, dayKey]; 
              
          return {
              ...prev,
              schedule: {
                  ...prev.schedule,
                  days: newDays
              }
          };
      });
      setErrorLocal("");
  };


  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.name.trim()) {
        setErrorLocal("El nombre de la escena es obligatorio.");
        return;
      }
    }
    if (step === 3) {
      if (formData.schedule.enabled && formData.schedule.days.length === 0) {
        setErrorLocal("Debes seleccionar al menos un día para la programación automática.");
        return;
      }
    }
    setErrorLocal("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorLocal("");
    setStep(step - 1);
  };

  const handleToggle = (device) => {
    if (device === 'chorros') {
      setFormData(prev => ({
        ...prev,
        actions: { ...prev.actions, chorrosAgua: !prev.actions.chorrosAgua }
      }));
    } else if (device === 'luces') {
      setFormData(prev => ({
        ...prev,
        actions: { 
            ...prev.actions, 
            luces: { ...prev.actions.luces, estado: !prev.actions.luces.estado } 
        }
      }));
    }
  };


  const rgbToHex = (r, g, b) => {
    if (r === undefined || g === undefined || b === undefined) return "#ffffff";
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const handleColorPickerChange = (e) => {
    const hexColor = e.target.value;
    const { r, g, b } = hexToRgb(hexColor);
    
    setFormData(prev => ({
      ...prev,
      actions: { 
          ...prev.actions, 
          luces: { ...prev.actions.luces, color: { r, g, b } } 
      }
    }));
  };


  const handleSave = () => {
    mutation.mutate(formData);
  };

  // Clases condicionales para los SVGs
  const chorrosIconClass = `${formData.actions.chorrosAgua ? styles.svgActive : styles.svgInactive}`;
  const lucesIconClass = `${formData.actions.luces.estado ? styles.svgActive : styles.svgInactive}`;

  // Para el resumen
  const selectedDaysLabels = formData.schedule.days.map(key => 
      DAYS_OF_WEEK.find(day => day.key === key)?.label || key
  ).join(', ');

  // Cálculo del progreso (4 pasos)
  const progressWidth = step === 1 ? '0%' : 
                        step === 2 ? '33%' : 
                        step === 3 ? '66%' : '100%';


  return (
    // 🏆 CLASE CORREGIDA: styles.editContainer
    <div className={styles.editContainer}>

      {/* BARRA DE PROGRESO (4 puntos) */}
      <div className={styles.progressBarContainer}>
        <div className={styles.progressLine}></div>
        <div className={styles.progressFill} style={{ width: progressWidth }}></div>
        
        <div className={`${styles.stepIndicator} ${step >= 1 ? styles.active : ''}`}>1</div>
        <div className={`${styles.stepIndicator} ${step >= 2 ? styles.active : ''}`}>2</div>
        <div className={`${styles.stepIndicator} ${step >= 3 ? styles.active : ''}`}>3</div>
        <div className={`${styles.stepIndicator} ${step >= 4 ? styles.active : ''}`}>4</div>
      </div>

      {/* 🏆 CLASE CORREGIDA: styles.formCard */}
      <div className={styles.formCard}>
        
        {/* PASO 1: Identidad */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.formTitle}>1. Identidad</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre</label>
              <input 
                type="text" name="name" className={styles.formInput} 
                placeholder="Ej. Fiesta Acuática"
                value={formData.name} onChange={handleChange}
              />
              {errorLocal && <p className={styles.errorMsg}>{errorLocal}</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Descripción</label>
              <textarea 
                name="descripcion" className={styles.formTextarea} rows="3"
                placeholder="Descripción opcional"
                value={formData.descripcion} onChange={handleChange}
              ></textarea>
            </div>
          </div>
        )}

        {/* PASO 2: Dispositivos (Con SVGs y estilos) */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.formTitle}>2. Dispositivos</h2>
            
            {/* Fila Chorros */}
            <div className={styles.deviceRow}>
              <span className={styles.formLabel} style={{margin:0}}>
                <span className={chorrosIconClass} style={{marginRight: '8px', verticalAlign: 'middle', display: 'inline-block'}}>
                    {CHORROS_SVG}
                </span>
                Chorros
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.chorrosAgua} onChange={() => handleToggle('chorros')} />
                <span className={styles.slider}></span>
              </label>
            </div>
            
            {/* Fila Luces */}
            <div className={styles.deviceRow}>
              <span className={styles.formLabel} style={{margin:0}}>
                <span className={lucesIconClass} style={{marginRight: '8px', verticalAlign: 'middle', display: 'inline-block'}}>
                    {LUCES_SVG}
                </span>
                Luces
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.luces.estado} onChange={() => handleToggle('luces')} />
                <span className={styles.slider}></span>
              </label>
            </div>

            {formData.actions.luces.estado && (
                <div className={styles.formGroup} style={{marginTop: 20}}>
                    <div className={styles.colorPickerWrapper}>
                        <label className={styles.formLabel}>Color:</label>
                        <div className={styles.modernColorInputContainer}>
                            {/* Input de color nativo */}
                            <input 
                                type="color" 
                                className={styles.modernColorInput}
                                value={rgbToHex(
                                    formData.actions.luces.color.r, 
                                    formData.actions.luces.color.g, 
                                    formData.actions.luces.color.b
                                )}
                                onChange={handleColorPickerChange}
                            />
                            
                            {/* Texto que muestra el código Hex al lado */}
                            <span className={styles.colorCode}>
                                {rgbToHex(
                                    formData.actions.luces.color.r, 
                                    formData.actions.luces.color.g, 
                                    formData.actions.luces.color.b
                                ).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* 🏆 PASO 3: PROGRAMACIÓN */}
        {step === 3 && (
            <div className={styles.stepContent}>
                <h2 className={styles.formTitle}>3. Programación</h2>
                
                {/* Toggle de Programación */}
                <div className={styles.deviceRow}>
                    <span className={styles.formLabel} style={{margin:0}}>
                        Activación Automática
                    </span>
                    <label className={styles.switch}>
                        <input 
                            type="checkbox" 
                            checked={formData.schedule.enabled} 
                            onChange={() => handleScheduleChange('enabled', !formData.schedule.enabled)} 
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                
                {formData.schedule.enabled && (
                    <>
                        {errorLocal && <p className={styles.errorMsg}>{errorLocal}</p>}

                        {/* Selección de Días */}
                        <div className={styles.formGroup} style={{marginTop: 25}}>
                            <label className={styles.formLabel}>Días de la semana:</label>
                            <div className={styles.daySelectorContainer}>
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day.key}
                                        // 🏆 CLASES CORREGIDAS
                                        className={`${styles.dayButton} ${formData.schedule.days.includes(day.key) ? styles.selected : ''}`}
                                        onClick={() => handleDayToggle(day.key)}
                                    >
                                        {day.label} 
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selección de Hora */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Hora de inicio:</label>
                            <input
                                type="time"
                                className={styles.formInput}
                                value={formData.schedule.time}
                                onChange={(e) => handleScheduleChange('time', e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>
        )}


        {/* PASO 4: Resumen y Revisar */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <h2 className={styles.formTitle}>4. Resumen</h2>
            <div className={styles.summaryList}>
                <p><strong>Nombre:</strong> {formData.name}</p>
                <p><strong>Descripción:</strong> {formData.descripcion || "-"}</p>
                <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}/>
                <p><strong>Chorros:</strong> {formData.actions.chorrosAgua ? "ON" : "OFF"}</p>
                <p><strong>Luces:</strong> {formData.actions.luces.estado ? `ON (${rgbToHex(formData.actions.luces.color.r, formData.actions.luces.color.g, formData.actions.luces.color.b)})` : "OFF"}</p>
                <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}/>
                <p><strong>Auto ON:</strong> {formData.schedule.enabled ? "Sí" : "No"}</p>
                {formData.schedule.enabled && (
                    <>
                        <p><strong>Días:</strong> {selectedDaysLabels || "Ninguno"}</p>
                        <p><strong>Hora:</strong> {formData.schedule.time}</p>
                    </>
                )}
            </div>
          </div>
        )}


        {/* BOTONES */}
        <div className={styles.buttonsContainer}>
          {step > 1 && (
            <button className={`${styles.btnNav} ${styles.btnPrev}`} onClick={handleBack}>
              Atrás
            </button>
          )}
          
          {step < 4 ? (
            <button className={`${styles.btnNav} ${styles.btnNext}`} onClick={handleNext}>
              Siguiente
            </button>
          ) : (
            <button 
              className={`${styles.btnNav} ${styles.btnNext}`} 
              onClick={handleSave} 
              // Usamos el estilo en línea para activar la clase Glassy Verde
              style={{backgroundColor: 'var(--color-success)'}} 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Guardando..." : "Confirmar y Guardar"}
            </button>
          )}
        </div>
        
        {/* Mensaje de error si falla */}
        {mutation.isError && <p className={styles.errorMsg} style={{textAlign:'center', marginTop:10}}>Error: {mutation.error.message}</p>}

      </div>
    </div>
  );
};

export default GestorEscenas;