import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import imgFlecha from '../assets/imagenes/flechaAtras.png';
// IMPORTANTE: Usar el CSS Module
import styles from './EditarEscena.module.css'; 

// Días de la semana para el formulario
const DAYS_OF_WEEK = [
    { key: 'mon', label: 'Lunes' },
    { key: 'tue', label: 'Martes' },
    { key: 'wed', label: 'Miércoles' },
    { key: 'thu', label: 'Jueves' },
    { key: 'fri', label: 'Viernes' },
    { key: 'sat', label: 'Sábado' },
    { key: 'sun', label: 'Domingo' },
];

// ==========================================================
// 🏆 1. DEFINICIÓN DE SVGS
// ==========================================================

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

// ==========================================================
// 2. COMPONENTE PRINCIPAL (EditarEscena)
// ==========================================================

const EditarEscena = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- 1. CARGAR DATOS EXISTENTES (GET) ---
  const { data: escenaDatos, isLoading, isError } = useQuery({
    queryKey: ['escena', id],
    queryFn: () => {
      return fetch(`${URL_BASE}/escenas/${id}.json`)
        .then(res => res.json());
    }
  });

  // --- 2. ESTADOS DEL FORMULARIO ---
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
    // 🏆 NUEVO CAMPO: Programación
    schedule: {
      enabled: false,
      days: [], // e.g., ['mon', 'wed', 'fri']
      time: "19:00"
    }
  });

// --- 3. EFECTO PARA RELLENAR EL FORMULARIO ---
  useEffect(() => {
    if (escenaDatos) {
        // Asegura que los campos schedule y actions existen
        const initialData = {
            ...escenaDatos,
            actions: escenaDatos.actions || { chorrosAgua: false, luces: { estado: false, color: { r: 255, g: 255, b: 255 } } },
            // 🛑 AQUÍ ESTÁ EL CAMBIO CLAVE:
            schedule: {
                enabled: escenaDatos.schedule?.enabled || false,
                // Si 'days' no existe en la BD, forzamos un array vacío []
                days: escenaDatos.schedule?.days || [], 
                time: escenaDatos.schedule?.time || "19:00"
            }
        };
        setFormData(initialData);
    }
  }, [escenaDatos]);

  // --- 4. MUTACIÓN PARA ACTUALIZAR (PUT) ---
  const mutation = useMutation({
    mutationFn: (datosActualizados) => {
      return fetch(`${URL_BASE}/escenas/${id}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizados),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al actualizar la escena');
        }
        return response.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      queryClient.invalidateQueries({ queryKey: ['escena', id] });
      
      alert("¡Cambios guardados correctamente!");
      navigate('/escenas'); 
    },
    onError: (error) => {
      alert(`Error al editar: ${error.message}`);
    }
  });

  // --- FUNCIONES DE AYUDA Y HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorLocal("");
  };

  // Handler para el nuevo campo de programación
  const handleScheduleChange = (key, value) => {
      setFormData(prev => ({
          ...prev,
          schedule: {
              ...prev.schedule,
              [key]: value
          }
      }));
  };
  
  // Handler para seleccionar días
  const handleDayToggle = (dayKey) => {
      setFormData(prev => {
          const { days } = prev.schedule;
          const newDays = days.includes(dayKey)
              ? days.filter(d => d !== dayKey) // Quitar día
              : [...days, dayKey]; // Añadir día
              
          return {
              ...prev,
              schedule: {
                  ...prev.schedule,
                  days: newDays
              }
          };
      });
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
    setErrorLocal(""); // Limpiar error si todo va bien
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

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

  // Convertidores de Color (sin cambios)
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
    const { r, g, b } = hexToRgb(e.target.value);
    setFormData(prev => ({
      ...prev,
      actions: { 
          ...prev.actions, 
          luces: { ...prev.actions.luces, color: { r, g, b } } 
      }
    }));
  };

  const handleUpdate = () => {
    mutation.mutate(formData);
  };

  // --- RENDERIZADO CONDICIONAL ---
  if (isLoading) return <div style={{textAlign: 'center', marginTop: 50, color: 'white'}}>Cargando datos de la escena...</div>;
  if (isError) return <div style={{textAlign: 'center', marginTop: 50, color: 'red'}}>Error al cargar la escena.</div>;


  const iconStyle = {
    width: '24px',
    height: '24px',
    objectFit: 'contain' 
  };
  
  // Clases condicionales para los SVGs
  const chorrosIconClass = `${formData.actions.chorrosAgua ? styles.svgActive : styles.svgInactive}`;
  const lucesIconClass = `${formData.actions.luces.estado ? styles.svgActive : styles.svgInactive}`;

  // Para el resumen
  const selectedDaysLabels = formData.schedule.days?.map(key => 
      DAYS_OF_WEEK.find(day => day.key === key)?.label || key
).join(', ') || "Ninguno";
  
  // Cálculo del progreso (4 pasos)
  const progressWidth = step === 1 ? '0%' : 
                        step === 2 ? '33%' : 
                        step === 3 ? '66%' : '100%';


  return (
    <>
    {/* Botón Volver (Navegación) */}
    <div className={styles.flecha}>
      <button className={styles.btnBackNav} onClick={() => navigate(-1)}>
        <img src={imgFlecha} alt="Flecha atras" style={iconStyle} />
      </button>
    </div>  

    {/* Contenedor principal */}
    <div className={styles['edit-container']}>
      
      {/* BARRA DE PROGRESO (4 pasos) */}
      <div className={styles['progress-bar-container']}>
        <div className={styles['progress-line']}></div>
        <div className={styles['progress-fill']} style={{ width: progressWidth }}></div>
        <div className={`${styles['step-indicator']} ${step >= 1 ? styles.active : ''}`}>1</div>
        <div className={`${styles['step-indicator']} ${step >= 2 ? styles.active : ''}`}>2</div>
        <div className={`${styles['step-indicator']} ${step >= 3 ? styles.active : ''}`}>3</div>
        <div className={`${styles['step-indicator']} ${step >= 4 ? styles.active : ''}`}>4</div> 
      </div>

      <div className={styles['form-card']}>
        
        {/* PASO 1: IDENTIDAD */}
        {step === 1 && (
          <div className={styles['step-content']}>
            <h2 className={styles['form-title']}>1. Identidad</h2>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Nombre</label>
              <input 
                type="text" name="name" className={styles['form-input']} 
                value={formData.name} onChange={handleChange}
              />
              {errorLocal && <p className={styles['error-msg']}>{errorLocal}</p>}
            </div>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Descripción</label>
              <textarea 
                name="descripcion" className={styles['form-textarea']} rows="3"
                value={formData.descripcion} onChange={handleChange}
              ></textarea>
            </div>
          </div>
        )}

        {/* PASO 2: DISPOSITIVOS */}
        {step === 2 && (
          <div className={styles['step-content']}>
            <h2 className={styles['form-title']}>2. Dispositivos</h2>
            
            {/* Fila Chorros */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{margin:0}}>
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
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{margin:0}}>
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
                <div className={styles['form-group']} style={{marginTop: 20}}>
                    <div className={styles['color-picker-wrapper']}>
                        <label className={styles['form-label']}>Color:</label>
                        <div className={styles['modern-color-input-container']}>
                            <input 
                                type="color" className={styles['modern-color-input']}
                                value={rgbToHex(
                                    formData.actions.luces.color.r, 
                                    formData.actions.luces.color.g, 
                                    formData.actions.luces.color.b
                                )}
                                onChange={handleColorPickerChange}
                            />
                            <span className={styles['color-code']}>
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
            <div className={styles['step-content']}>
                <h2 className={styles['form-title']}>3. Programación</h2>
                
                {/* Toggle de Programación */}
                <div className={styles['device-row']}>
                    <span className={styles['form-label']} style={{margin:0}}>
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
                        {errorLocal && <p className={styles['error-msg']}>{errorLocal}</p>}

                        {/* Selección de Días */}
                        <div className={styles['form-group']} style={{marginTop: 25}}>
                            <label className={styles['form-label']}>Días de la semana:</label>
                            <div className={styles['day-selector-container']}>
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day.key}
                                        className={`${styles['day-button']} ${formData.schedule.days.includes(day.key) ? styles.selected : ''}`}
                                        onClick={() => handleDayToggle(day.key)}
                                    >
                                        {day.label.slice(0, 3)} 
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selección de Hora */}
                        <div className={styles['form-group']}>
                            <label className={styles['form-label']}>Hora de inicio:</label>
                            <input
                                type="time"
                                className={styles['form-input']}
                                value={formData.schedule.time}
                                onChange={(e) => handleScheduleChange('time', e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>
        )}

        {/* PASO 4: REVISAR CAMBIOS */}
        {step === 4 && (
          <div className={styles['step-content']}>
            <h2 className={styles['form-title']}>4. Revisar Cambios</h2>
            <div className={styles['summary-list']}>
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
        <div className={styles['buttons-container']}>
          {step > 1 && (
            <button className={`${styles['btn-nav']} ${styles['btn-prev']}`} onClick={handleBack}>
              Atrás
            </button>
          )}
          
          {step < 4 ? (
            <button className={`${styles['btn-nav']} ${styles['btn-next']}`} onClick={handleNext}>
              Siguiente
            </button>
          ) : (
            <button 
              className={`${styles['btn-nav']} ${styles['btn-next']}`}
              onClick={handleUpdate} 
              style={{backgroundColor: 'var(--color-success)'}}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Actualizando..." : "Guardar Cambios"}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default EditarEscena;