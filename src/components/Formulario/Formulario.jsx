import React from 'react';
import styles from './Formulario.module.css';
import imgChorros from '../../assets/imagenes/chorros.png';
import imgLuces from '../../assets/imagenes/luces.png';
// 💡 Importar las constantes centralizadas
import { DAYS_OF_WEEK, MIN_TEMP, MAX_TEMP } from '../../assets/constants/constants';


// ==========================================================
// CONSTANTES Y UTILIDADES LOCALES
// ==========================================================

// Estilo para los iconos SVG/PNG en las filas de dispositivos
const imgStyle = {
  width: '24px',
  height: '24px',
  marginRight: '10px',
  objectFit: 'contain'
};

// UTILITY FUNCTIONS para manejar el color Picker (RGB <-> HEX)
const rgbToHex = (r, g, b) => {
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 }; // Default white
};
// ==========================================================


const Formulario = ({
  formData,
  step,
  errorLocal,
  mutation,
  mode,
  // Handlers
  handleChange,
  handleScheduleChange,
  handleDayToggle,
  handleToggle,
  handleColorPickerChange,
  handleTempChange,
  handleNext,
  handleBack,
  handleAction,
  // 🏆 CLAVE: Recibimos la clase del contenedor padre
  containerClassName
}) => {

  const progressWidth = step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%';
  const actionLabel = mode === 'edit' ? "Guardar Cambios" : "Crear Escena";

  // Clases dinámicas para los iconos de dispositivo
  const chorrosIconClass = formData.actions.chorrosAgua ? styles.svgActive : styles.svgInactive;
  const lucesIconClass = formData.actions.luces.estado ? styles.svgActive : styles.svgInactive;
  const musicaIconClass = formData.actions.musica ? styles.svgActive : styles.svgInactive;
  const tempIconClass = formData.actions.temperatura.estado ? styles.svgActive : styles.svgInactive;
  const limpiezaIconClass = formData.actions.limpieza ? styles.svgActive : styles.svgInactive;

  // Resumen de días seleccionados
  const selectedDaysLabels = formData.schedule.days?.map(key =>
    DAYS_OF_WEEK.find(day => day.key === key)?.label || key
  ).join(', ') || "Ninguno";


  return (
    // 🏆 Aplicamos la clase del contenedor principal que viene del componente padre
    <div className={containerClassName}>

      {/* BARRA DE PROGRESO */}
      <div className={styles['progress-bar-container']}>
        <div className={styles['progress-line']}></div>
        <div className={styles['progress-fill']} style={{ width: progressWidth }}></div>
        <div className={`${styles['step-indicator']} ${step >= 1 ? styles.active : ''}`}>1</div>
        <div className={`${styles['step-indicator']} ${step >= 2 ? styles.active : ''}`}>2</div>
        <div className={`${styles['step-indicator']} ${step >= 3 ? styles.active : ''}`}>3</div>
        <div className={`${styles['step-indicator']} ${step >= 4 ? styles.active : ''}`}>4</div>
      </div>

      {/* TARJETA PRINCIPAL DEL FORMULARIO */}
      <div className={styles['form-card']}>

        {/* PASO 1: IDENTIDAD */}
        {step === 1 && (
          <div className={styles['step-content']}>
            <h2 className={styles['form-title']}>1. Identidad</h2>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Nombre</label>
              <input
                type="text"
                name="name"
                className={styles['form-input']}
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Ej. Fiesta Acuática"
              />
              <p className={styles['error-msg']}>{errorLocal}</p>
            </div>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Descripción</label>
              <textarea
                name="descripcion"
                className={styles['form-textarea']}
                rows="3"
                value={formData.descripcion || ''}
                onChange={handleChange}
                placeholder="Descripción opcional"
              ></textarea>
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
                      onChange={(e) => {
                        const { r, g, b } = hexToRgb(e.target.value);
                        handleColorPickerChange({ r, g, b });
                      }}
                    />
                    <span className={styles['color-code']}>
                      {rgbToHex(formData.actions.luces.color.r, formData.actions.luces.color.g, formData.actions.luces.color.b).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* MÚSICA */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{ margin: 0 }}>
                <img src={imgChorros} alt="Música" style={imgStyle} />
                <span className={musicaIconClass}>Música Ambiente</span>
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.musica} onChange={() => handleToggle('musica')} />
                <span className={styles.slider}></span>
              </label>
            </div>

            {/* TEMPERATURA + SLIDER */}
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
                  value={formData.actions.temperatura.grados}
                  onChange={handleTempChange}
                  className={styles.rangeSlider} // Asumimos un estilo de slider en Formulario.module.css si es necesario
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: 'var(--color-text-faded)' }}>
                  <span>{MIN_TEMP}°C</span>
                  <span>{MAX_TEMP}°C</span>
                </div>
              </div>
            )}

            {/* LIMPIEZA */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{ margin: 0 }}>
                <img src={imgLuces} alt="Limpieza" style={imgStyle} />
                <span className={limpiezaIconClass}>Limpieza Programada</span>
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.limpieza} onChange={() => handleToggle('limpieza')} />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        )}

        {/* PASO 3: PROGRAMACIÓN */}
        {step === 3 && (
          <div className={styles['step-content']}>
            <h2 className={styles['form-title']}>3. Programación</h2>
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{ margin: 0 }}>Activación Automática</span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.schedule.enabled} onChange={() => handleScheduleChange('enabled', !formData.schedule.enabled)} />
                <span className={styles.slider}></span>
              </label>
            </div>

            {formData.schedule.enabled && (
              <>
                {errorLocal && <p className={styles['error-msg']}>{errorLocal}</p>}
                <div className={styles['form-group']} style={{ marginTop: 25 }}>
                  <label className={styles['form-label']}>Días de la semana:</label>
                  <div className={styles['day-selector-container']}>
                    {DAYS_OF_WEEK.map(day => (
                      <button key={day.key}
                        className={`${styles['day-button']} ${formData.schedule.days.includes(day.key) ? styles.selected : ''}`}
                        onClick={() => handleDayToggle(day.key)}
                      >
                        {day.label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles['form-group']}>
                  <label className={styles['form-label']}>Hora de inicio:</label>
                  <input type="time" className={styles['form-input']} value={formData.schedule.time} onChange={(e) => handleScheduleChange('time', e.target.value)} />
                </div>
              </>
            )}
          </div>
        )}

        {/* PASO 4: Revisar Cambios / Resumen */}
        {step === 4 && (
          <div className={styles['step-content']}>
            <h2 className={styles['form-title']}>4. Revisar Cambios</h2>
            <div className={styles['summary-list']}>
              <p><strong>Nombre:</strong> {formData.name}</p>
              <p><strong>Descripción:</strong> {formData.descripcion || "-"}</p>
              <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
              <p><strong>Chorros:</strong> {formData.actions.chorrosAgua ? "ON" : "OFF"}</p>
              <p><strong>Luces:</strong> {formData.actions.luces.estado ? `ON (${rgbToHex(formData.actions.luces.color.r, formData.actions.luces.color.g, formData.actions.luces.color.b)})` : "OFF"}</p>
              <p><strong>Música:</strong> {formData.actions.musica ? "ON" : "OFF"}</p>
              <p><strong>Temperatura:</strong> {formData.actions.temperatura.estado ? `ON (${formData.actions.temperatura.grados}°C)` : "OFF"}</p>
              <p><strong>Limpieza:</strong> {formData.actions.limpieza ? "ON" : "OFF"}</p>
              <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
              <p><strong>Auto ON:</strong> {formData.schedule.enabled ? "Sí" : "No"}</p>
              {formData.schedule.enabled && (
                <>
                  <p><strong>Días:</strong> {selectedDaysLabels}</p>
                  <p><strong>Hora:</strong> {formData.schedule.time}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* BOTONES DE NAVEGACIÓN */}
        <div className={styles['buttons-container']}>
          {step > 1 && (
            <button className={`${styles['btn-nav']} ${styles['btn-prev']}`} onClick={handleBack}>Atrás</button>
          )}

          {step < 4 ? (
            <button className={`${styles['btn-nav']} ${styles['btn-next']}`} onClick={handleNext} disabled={!!errorLocal}>Siguiente</button>
          ) : (
            <button
              className={`${styles['btn-nav']} ${styles['btn-next']}`}
              onClick={handleAction}
              // Usar estilo en línea para el color de fondo para la variante "Guardar"
              style={{ backgroundColor: mode === 'edit' ? 'var(--color-success)' : 'var(--color-primary-blue)' }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (mode === 'edit' ? "Actualizando..." : "Creando...") : actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Formulario;