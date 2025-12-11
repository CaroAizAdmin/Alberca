import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import styles from './GestorEscenas.module.css';
import { useTitulo } from '../hooks/useTitulo';
import imgChorros from '../assets/imagenes/chorros.png';
import imgLuces from '../assets/imagenes/luces.png';
import ModalExito from './ModalExito';

// CONSTANTES DE TEMPERATURA
const MIN_TEMP = 10;
const MAX_TEMP = 40;

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
];

const imgStyle = { width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' };

const GestorEscenas = () => {
  useTitulo("Crear Nueva Escena");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ESTADOS DEL MODAL Y FORMULARIO
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [errorLocal, setErrorLocal] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    descripcion: "",
    actions: {
      chorrosAgua: false,
      luces: { estado: false, color: { r: 255, g: 255, b: 255 } },
      // 🟢 MÚSICA Y LIMPIEZA: De vuelta a booleano simple
      musica: false,
      // 🟢 TEMPERATURA: Objeto con estado y grados
      temperatura: { estado: false, grados: 25 },
      limpieza: false
    },
    schedule: { enabled: false, days: [], time: "19:00" }
  });

  // --- LÓGICA DE MUTACIÓN (POST) ---
  const mutation = useMutation({
    mutationFn: (nuevaEscena) => {
      // Nota: Al usar POST con Firebase Realtime Database, la respuesta incluye el ID generado.
      return fetch(`${URL_BASE}/escenas.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaEscena),
      }).then((response) => {
        if (!response.ok) throw new Error('Error al guardar la escena');
        return response.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      setShowModal(true);
    },
    onError: (error) => alert(`Error: ${error.message}`)
  });

  // FUNCIÓN PARA CERRAR Y NAVEGAR
  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/');
  };

  // --- HANDLERS DE FORMULARIO Y NAVEGACIÓN ---
  const handleChange = (e) => {
    // 🚨 Defensa para input controlado
    const value = e.target.value ?? "";
    setFormData({ ...formData, [e.target.name]: value });
    setErrorLocal("");
  };

  const handleScheduleChange = (key, value) => {
    // 🚨 Defensa para input controlado
    const safeValue = value ?? "";
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [key]: safeValue }
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
        schedule: { ...prev.schedule, days: newDays }
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

  // 🟢 FUNCIÓN DE TOGGLE UNIFICADA (Ajustada a las estructuras del formData)
  const handleToggle = (device) => {
    setFormData(prev => {
      const currentActions = prev.actions;

      switch (device) {
        case 'chorros':
          return { ...prev, actions: { ...currentActions, chorrosAgua: !currentActions.chorrosAgua } };
        case 'luces':
          return { ...prev, actions: { ...currentActions, luces: { ...currentActions.luces, estado: !currentActions.luces.estado } } };
        case 'musica':
          // 🟢 Booleano simple
          return { ...prev, actions: { ...currentActions, musica: !currentActions.musica } };
        case 'temperatura':
          // 🟢 Objeto con estado
          return { ...prev, actions: { ...currentActions, temperatura: { ...currentActions.temperatura, estado: !currentActions.temperatura.estado } } };
        case 'limpieza':
          // 🟢 Booleano simple
          return { ...prev, actions: { ...currentActions, limpieza: !currentActions.limpieza } };
        default:
          return prev;
      }
    });
  };

  const rgbToHex = (r, g, b) => {
    if (r === undefined) return "#ffffff";
    const toHex = (c) => {
      const hex = Math.round(c).toString(16);
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

  // 🟢 HANDLER PARA EL SLIDER DE TEMPERATURA
  const handleTempChange = (e) => {
    const newGrados = parseInt(e.target.value, 10);
    setFormData(prev => ({
      ...prev,
      actions: {
        ...prev.actions,
        temperatura: { ...prev.actions.temperatura, grados: newGrados }
      }
    }));
  };

  const handleSave = () => mutation.mutate(formData);

  // Clases condicionales
  const chorrosIconClass = `${formData.actions.chorrosAgua ? styles.svgActive : styles.svgInactive}`;
  const lucesIconClass = `${formData.actions.luces.estado ? styles.svgActive : styles.svgInactive}`;
  // 🟢 CLASES DINÁMICAS (Booleano simple para música y limpieza)
  const musicaIconClass = `${formData.actions.musica ? styles.svgActive : styles.svgInactive}`;
  const tempIconClass = `${formData.actions.temperatura.estado ? styles.svgActive : styles.svgInactive}`;
  const limpiezaIconClass = `${formData.actions.limpieza ? styles.svgActive : styles.svgInactive}`;

  const selectedDaysLabels = formData.schedule.days.map(key =>
    DAYS_OF_WEEK.find(day => day.key === key)?.label || key
  ).join(', ');

  const progressWidth = step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%';

  return (
    <div className={styles.editContainer}>

      {/* INSERTAR EL MODAL */}
      <ModalExito
        isOpen={showModal}
        onClose={handleCloseModal}
        mensaje="¡La escena se ha creado y guardado en la nube correctamente!"
      />

      {/* BARRA DE PROGRESO */}
      <div className={styles.progressBarContainer}>
        <div className={styles.progressLine}></div>
        <div className={styles.progressFill} style={{ width: progressWidth }}></div>
        <div className={`${styles.stepIndicator} ${step >= 1 ? styles.active : ''}`}>1</div>
        <div className={`${styles.stepIndicator} ${step >= 2 ? styles.active : ''}`}>2</div>
        <div className={`${styles.stepIndicator} ${step >= 3 ? styles.active : ''}`}>3</div>
        <div className={`${styles.stepIndicator} ${step >= 4 ? styles.active : ''}`}>4</div>
      </div>

      <div className={styles.formCard}>

        {/* PASO 1 */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.formTitle}>1. Identidad</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre</label>
              <input type="text" name="name" className={styles.formInput} placeholder="Ej. Fiesta Acuática" value={formData.name || ""} onChange={handleChange} />
              {errorLocal && <p className={styles.errorMsg}>{errorLocal}</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Descripción</label>
              <textarea name="descripcion" className={styles.formTextarea} rows="3" placeholder="Descripción opcional" value={formData.descripcion || ""} onChange={handleChange}></textarea>
            </div>
          </div>
        )}

        {/* PASO 2: DISPOSITIVOS */}
        {step === 2 && (
          <div className={styles['step-content']}>
            <h2 className={styles['form-title']}>2. Dispositivos</h2>
            {errorLocal && <p className={styles['error-msg']}>{errorLocal}</p>}

            {/* CHORROS */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{ margin: 0 }}>
                <img src={imgChorros} alt="Chorros" style={imgStyle} />
                <span className={chorrosIconClass}>Chorros de Agua</span>
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.chorrosAgua} onChange={() => handleToggle('chorros')} />
                <span className={styles.slider}></span>
              </label>
            </div>

            {/* LUCES + COLOR */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{ margin: 0 }}>
                <img src={imgLuces} alt="Luces" style={imgStyle} />
                <span className={lucesIconClass}>Luces</span>
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.luces.estado} onChange={() => handleToggle('luces')} />
                <span className={styles.slider}></span>
              </label>
            </div>
            {formData.actions.luces.estado && (
              <div className={styles['form-group']} style={{ marginTop: 20, paddingLeft: 35 }}>
                <div className={styles['color-picker-wrapper']}>
                  <label className={styles['form-label']}>Color:</label>
                  <div className={styles['modern-color-input-container']}>
                    <input type="color" className={styles['modern-color-input']}
                      value={rgbToHex(formData.actions.luces.color.r, formData.actions.luces.color.g, formData.actions.luces.color.b)}
                      onChange={handleColorPickerChange}
                    />
                    <span className={styles['color-code']}>
                      {rgbToHex(formData.actions.luces.color.r, formData.actions.luces.color.g, formData.actions.luces.color.b).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 🟢 MÚSICA (Booleano simple) */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{ margin: 0 }}>
                <img src={imgChorros} alt="Música" style={imgStyle} />
                <span className={musicaIconClass}>Música Ambiente</span>
              </span>
              <label className={styles.switch}>
                {/* 🟢 Lee directamente el booleano */}
                <input type="checkbox" checked={formData.actions.musica} onChange={() => handleToggle('musica')} />
                <span className={styles.slider}></span>
              </label>
            </div>

            {/* 🟢 TEMPERATURA + SLIDER */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{ margin: 0 }}>
                <img src={imgLuces} alt="Temperatura" style={imgStyle} />
                <span className={tempIconClass}>Control de Temperatura</span>
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.temperatura.estado} onChange={() => handleToggle('temperatura')} />
                <span className={styles.slider}></span>
              </label>
            </div>
            {formData.actions.temperatura.estado && (
              <div className={styles['form-group']} style={{ marginTop: 10, paddingLeft: 35 }}>
                <label className={styles['form-label']}>Temperatura Deseada: <strong>{formData.actions.temperatura.grados}°C</strong></label>
                <input type="range"
                  min={MIN_TEMP}
                  max={MAX_TEMP}
                  step="1"
                  value={formData.actions.temperatura.grados ?? 25}
                  onChange={handleTempChange}
                  className={styles.rangeSlider}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: 'var(--color-text-faded)' }}>
                  <span>{MIN_TEMP}°C</span>
                  <span>{MAX_TEMP}°C</span>
                </div>
              </div>
            )}

            {/* 🟢 LIMPIEZA (Booleano simple) */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{ margin: 0 }}>
                <img src={imgLuces} alt="Limpieza" style={imgStyle} />
                <span className={limpiezaIconClass}>Limpieza Programada</span>
              </span>
              <label className={styles.switch}>
                {/* 🟢 Lee directamente el booleano */}
                <input type="checkbox" checked={formData.actions.limpieza} onChange={() => handleToggle('limpieza')} />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.formTitle}>3. Programación</h2>
            <div className={styles.deviceRow}>
              <span className={styles.formLabel} style={{ margin: 0 }}>Activación Automática</span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.schedule.enabled} onChange={() => handleScheduleChange('enabled', !formData.schedule.enabled)} />
                <span className={styles.slider}></span>
              </label>
            </div>

            {formData.schedule.enabled && (
              <>
                {errorLocal && <p className={styles.errorMsg}>{errorLocal}</p>}
                <div className={styles.formGroup} style={{ marginTop: 25 }}>
                  <label className={styles.formLabel}>Días de la semana:</label>
                  <div className={styles.daySelectorContainer}>
                    {DAYS_OF_WEEK.map(day => (
                      <button key={day.key}
                        className={`${styles.dayButton} ${formData.schedule.days.includes(day.key) ? styles.selected : ''}`}
                        onClick={() => handleDayToggle(day.key)}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hora de inicio:</label>
                  <input type="time" className={styles.formInput} value={formData.schedule.time || "19:00"} onChange={(e) => handleScheduleChange('time', e.target.value)} />
                </div>
              </>
            )}
          </div>
        )}

        {/* PASO 4 */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <h2 className={styles.formTitle}>4. Resumen</h2>
            <div className={styles.summaryList}>
              <p><strong>Nombre:</strong> {formData.name}</p>
              <p><strong>Descripción:</strong> {formData.descripcion || "-"}</p>
              <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
              <p><strong>Chorros:</strong> {formData.actions.chorrosAgua ? "ON" : "OFF"}</p>
              <p><strong>Luces:</strong> {formData.actions.luces.estado ? `ON (${rgbToHex(formData.actions.luces.color.r, formData.actions.luces.color.g, formData.actions.luces.color.b)})` : "OFF"}</p>

              {/* 🟢 RESUMEN DE MÚSICA Y TEMPERATURA CORREGIDO */}
              <p><strong>Música:</strong> {formData.actions.musica ? "ON" : "OFF"}</p>
              <p><strong>Temperatura:</strong> {formData.actions.temperatura.estado ? `ON (${formData.actions.temperatura.grados}°C)` : "OFF"}</p>

              <p><strong>Limpieza:</strong> {formData.actions.limpieza ? "ON" : "OFF"}</p>

              <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
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
            <button className={`${styles.btnNav} ${styles.btnPrev}`} onClick={handleBack}>Atrás</button>
          )}
          {step < 4 ? (
            <button className={`${styles.btnNav} ${styles.btnNext}`} onClick={handleNext} disabled={!!errorLocal}>Siguiente</button>
          ) : (
            <button className={`${styles.btnNav} ${styles.btnNext}`} onClick={handleSave} style={{ backgroundColor: 'var(--color-success)' }} disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : "Confirmar y Guardar"}
            </button>
          )}
        </div>

        {mutation.isError && <p className={styles.errorMsg} style={{ textAlign: 'center', marginTop: 10 }}>Error: {mutation.error.message}</p>}

      </div>
    </div>
  );
};

export default GestorEscenas;