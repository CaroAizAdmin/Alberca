import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import imgFlecha from '../assets/imagenes/flechaAtras.png';
import styles from './EditarEscena.module.css';
import { useTitulo } from '../hooks/useTitulo';
import imgChorros from '../assets/imagenes/chorros.png';
import imgLuces from '../assets/imagenes/luces.png';
// 🏆 IMPORTACIONES COMENTADAS YA NO SON NECESARIAS
/* import { useMusicaPlaylists } from '../hooks/useMusicaPlaylists'; 
import imgMusica from '../assets/imagenes/musica.png'; 
import imgTemperatura from '../assets/imagenes/temperatura.png';
import imgLimpieza from '../assets/imagenes/limpieza.png'; */
import ModalExito from './ModalExito';

// CONSTANTES DE TEMPERATURA
const MIN_TEMP = 10;
const MAX_TEMP = 40;

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' },
];

const imgStyle = { width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' };

const EditarEscena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useTitulo("Editar Escena");

  // --- OBTENER DATOS (GET) ---
  const { data: escenaDatos, isLoading: isLoadingEscena, isError: isErrorEscena } = useQuery({
    queryKey: ['escena', id],
    queryFn: () => fetch(`${URL_BASE}/escenas/${id}.json`).then(res => res.json())
  });

  // --- ESTADOS ---
  const [step, setStep] = useState(1);
  const [errorLocal, setErrorLocal] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 🏆 ESTADO INICIAL AJUSTADO: Temperatura ahora es un objeto para almacenar 'grados'
  const [formData, setFormData] = useState({
    name: "",
    descripcion: "",
    actions: {
      chorrosAgua: false,
      luces: { estado: false, color: { r: 255, g: 255, b: 255 } },
      musica: false,
      temperatura: { estado: false, grados: 25 }, // 🚨 CORRECCIÓN: Estructura para slider
      limpieza: false
    },
    schedule: { enabled: false, days: [], time: "19:00" }
  });

  // --- EFECTO RELLENO (CORREGIDO EL LOOP y la inicialización de Temperatura) ---
  useEffect(() => {
    if (escenaDatos) {
      // 🚨 CORRECCIÓN DEL LOOP: Evitar setFormData si ya está inicializado
      if (formData.name !== "" && formData.name === escenaDatos.name) {
        return;
      }

      // Definir valores por defecto para asegurar la estructura
      const defaultActions = {
        chorrosAgua: false,
        luces: { estado: false, color: { r: 255, g: 255, b: 255 } },
        musica: false,
        temperatura: { estado: false, grados: 25 }, // Valor por defecto
        limpieza: false
      };

      const initialData = {
        ...escenaDatos,
        actions: {
          ...defaultActions,
          ...escenaDatos.actions,
          luces: { ...defaultActions.luces, ...escenaDatos.actions?.luces },
          musica: escenaDatos.actions?.musica === true,

          // 🚨 CORRECCIÓN: Inicialización de Temperatura
          temperatura: {
            ...defaultActions.temperatura,
            ...escenaDatos.actions?.temperatura,
            estado: escenaDatos.actions?.temperatura?.estado === true,
            grados: escenaDatos.actions?.temperatura?.grados || 25,
          },

          limpieza: escenaDatos.actions?.limpieza === true,
        },
        schedule: {
          enabled: escenaDatos.schedule?.enabled || false,
          days: escenaDatos.schedule?.days || [],
          time: escenaDatos.schedule?.time || "19:00"
        }
      };

      setFormData(initialData);
    }
    // No incluir formData en las dependencias para evitar el loop al usarlo como bandera de inicialización
  }, [escenaDatos]);

  // --- MUTACIÓN (PUT) ---
  const mutation = useMutation({
    mutationFn: (datosActualizados) => {
      return fetch(`${URL_BASE}/escenas/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados),
      }).then((response) => {
        if (!response.ok) throw new Error('Error al actualizar la escena');
        return response.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      queryClient.invalidateQueries({ queryKey: ['escena', id] });
      setShowModal(true);
    },
    onError: (error) => alert(`Error al editar: ${error.message}`)
  });

  // FUNCIÓN PARA CERRAR MODAL Y NAVEGAR
  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/escenas');
  };

  // --- HANDLERS GENERALES ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorLocal("");
  };

  const handleScheduleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [key]: value }
    }));
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
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.name.trim())) {
      setErrorLocal("El nombre de la escena es obligatorio.");
      return;
    }
    if (step === 2) {
      const activeActions = Object.keys(formData.actions).some(key => {
        const action = formData.actions[key];
        if (typeof action === 'object' && action !== null) {
          return action.estado;
        }
        return action;
      });
      if (!activeActions) {
        setErrorLocal("Advertencia: No ha activado ningún dispositivo.");
      } else {
        setErrorLocal("");
      }
    }
    if (step === 3 && formData.schedule.enabled && formData.schedule.days.length === 0) {
      setErrorLocal("Selecciona al menos un día.");
      return;
    }
    setErrorLocal("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorLocal("");
    setStep(step - 1);
  }

  // --- HANDLER DE TOGGLE UNIFICADO (Ajustado para Temperatura) ---
  const handleToggle = (device) => {
    setFormData(prev => {
      const newActions = { ...prev.actions };

      switch (device) {
        case 'chorros':
          newActions.chorrosAgua = !newActions.chorrosAgua;
          break;
        case 'luces':
          newActions.luces.estado = !newActions.luces.estado;
          break;
        case 'temperatura': // 🚨 CORRECCIÓN
          newActions.temperatura = { ...newActions.temperatura, estado: !newActions.temperatura.estado };
          break;
        case 'musica':
        case 'limpieza':
          // Para los dispositivos booleanos simples
          newActions[device] = !prev.actions[device];
          break;
        default:
          break;
      }
      return { ...prev, actions: newActions };
    });
  };

  // --- UTILIDADES DE COLOR (Se mantienen para Luces) ---
  const rgbToHex = (r, g, b) => {
    if (r === undefined || g === undefined || b === undefined) return "#ffffff";
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

  // 🏆 NUEVO HANDLER PARA EL SLIDER DE TEMPERATURA
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

  const handleUpdate = () => mutation.mutate(formData);

  const isDataLoading = isLoadingEscena;

  if (isDataLoading) return <div style={{ textAlign: 'center', marginTop: 50, color: 'white' }}>Cargando...</div>;
  if (isErrorEscena) return <div style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>Error al cargar.</div>;

  // --- CLASES DE ESTILO CONDICIONALES (Ajustado para Temperatura) ---
  const chorrosIconClass = `${formData.actions.chorrosAgua ? styles.svgActive : styles.svgInactive}`;
  const lucesIconClass = `${formData.actions.luces.estado ? styles.svgActive : styles.svgInactive}`;
  const musicaIconClass = `${formData.actions.musica ? styles.svgActive : styles.svgInactive}`;
  const tempIconClass = `${formData.actions.temperatura.estado ? styles.svgActive : styles.svgInactive}`; // 🚨 CORRECCIÓN: Lee el estado del objeto
  const limpiezaIconClass = `${formData.actions.limpieza ? styles.svgActive : styles.svgInactive}`;

  const selectedDaysLabels = formData.schedule.days?.map(key =>
    DAYS_OF_WEEK.find(day => day.key === key)?.label || key
  ).join(', ') || "Ninguno";

  const progressWidth = step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%';

  return (
    <>
      <ModalExito
        isOpen={showModal}
        onClose={handleCloseModal}
        mensaje="¡La escena se ha actualizado correctamente!"
      />

      <div className={styles.flecha}>
        <button className={styles.btnBackNav} onClick={() => navigate(-1)}>
          <img src={imgFlecha} alt="Atrás" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        </button>
      </div>

      <div className={styles['edit-container']}>

        <div className={styles['progress-bar-container']}>
          <div className={styles['progress-line']}></div>
          <div className={styles['progress-fill']} style={{ width: progressWidth }}></div>
          <div className={`${styles['step-indicator']} ${step >= 1 ? styles.active : ''}`}>1</div>
          <div className={`${styles['step-indicator']} ${step >= 2 ? styles.active : ''}`}>2</div>
          <div className={`${styles['step-indicator']} ${step >= 3 ? styles.active : ''}`}>3</div>
          <div className={`${styles['step-indicator']} ${step >= 4 ? styles.active : ''}`}>4</div>
        </div>

        <div className={styles['form-card']}>

          {/* PASO 1 */}
          {step === 1 && (
            <div className={styles['step-content']}>
              <h2 className={styles['form-title']}>1. Identidad</h2>
              <div className={styles['form-group']}>
                <label className={styles['form-label']}>Nombre</label>
                <input type="text" name="name" className={styles['form-input']} value={formData.name} onChange={handleChange} />
                {errorLocal && <p className={styles['error-msg']}>{errorLocal}</p>}
              </div>
              <div className={styles['form-group']}>
                <label className={styles['form-label']}>Descripción</label>
                <textarea name="descripcion" className={styles['form-textarea']} rows="3" value={formData.descripcion} onChange={handleChange}></textarea>
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

              {/* MÚSICA (ON/OFF Simple) */}
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

              {/* TEMPERATURA + SLIDER (Corregido) */}
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
                    onChange={handleTempChange} // 🏆 Handler definido
                    className={styles.rangeSlider}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: 'var(--color-text-faded)' }}>
                    <span>{MIN_TEMP}°C</span>
                    <span>{MAX_TEMP}°C</span>
                  </div>
                </div>
              )}

              {/* LIMPIEZA (ON/OFF Simple) */}
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

          {/* PASO 3 */}
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

          {/* PASO 4: Revisar Cambios */}
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
                {/* Resumen de Temperatura (Corregido) */}
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

          {/* BOTONES */}
          <div className={styles['buttons-container']}>
            {step > 1 && (
              <button className={`${styles['btn-nav']} ${styles['btn-prev']}`} onClick={handleBack}>Atrás</button>
            )}

            {step < 4 ? (
              <button className={`${styles['btn-nav']} ${styles['btn-next']}`} onClick={handleNext} disabled={!!errorLocal}>Siguiente</button>
            ) : (
              <button
                className={`${styles['btn-nav']} ${styles['btn-next']}`}
                onClick={handleUpdate}
                style={{ backgroundColor: 'var(--color-success)' }}
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