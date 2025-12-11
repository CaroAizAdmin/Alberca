import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import imgFlecha from '../assets/imagenes/flechaAtras.png';
import styles from './EditarEscena.module.css'; 
import { useTitulo } from '../hooks/useTitulo'; 
import imgChorros from '../assets/imagenes/chorros.png'; 
import imgLuces from '../assets/imagenes/luces.png';
// 1. IMPORTAR MODAL
import ModalExito from './ModalExito';

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
  const { data: escenaDatos, isLoading, isError } = useQuery({
    queryKey: ['escena', id],
    queryFn: () => fetch(`${URL_BASE}/escenas/${id}.json`).then(res => res.json())
  });

  // --- ESTADOS ---
  const [step, setStep] = useState(1);
  const [errorLocal, setErrorLocal] = useState("");
  // 2. ESTADO DEL MODAL
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    descripcion: "",
    actions: {
      chorrosAgua: false,
      luces: { estado: false, color: { r: 255, g: 255, b: 255 } }
    },
    schedule: { enabled: false, days: [], time: "19:00" }
  });

  // --- EFECTO RELLENO ---
  useEffect(() => {
    if (escenaDatos) {
        const initialData = {
            ...escenaDatos,
            actions: escenaDatos.actions || { chorrosAgua: false, luces: { estado: false, color: { r: 255, g: 255, b: 255 } } },
            schedule: {
                enabled: escenaDatos.schedule?.enabled || false,
                days: escenaDatos.schedule?.days || [], 
                time: escenaDatos.schedule?.time || "19:00"
            }
        };
        setFormData(initialData);
    }
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
      
      // 3. EN LUGAR DE NAVEGAR, MOSTRAMOS EL MODAL
      setShowModal(true);
    },
    onError: (error) => alert(`Error al editar: ${error.message}`)
  });

  // 4. FUNCIÓN PARA CERRAR MODAL Y NAVEGAR
  const handleCloseModal = () => {
      setShowModal(false);
      navigate('/escenas'); // Navegamos recién cuando el usuario acepta
  };

  // --- HANDLERS ---
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
    if (step === 3 && formData.schedule.enabled && formData.schedule.days.length === 0) {
        setErrorLocal("Selecciona al menos un día.");
        return;
    }
    setErrorLocal("");
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

  const rgbToHex = (r, g, b) => {
    if (r === undefined) return "#ffffff";
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

  const handleUpdate = () => mutation.mutate(formData);

  if (isLoading) return <div style={{textAlign: 'center', marginTop: 50, color: 'white'}}>Cargando...</div>;
  if (isError) return <div style={{textAlign: 'center', marginTop: 50, color: 'red'}}>Error al cargar.</div>;

  const chorrosIconClass = `${formData.actions.chorrosAgua ? styles.svgActive : styles.svgInactive}`;
  const lucesIconClass = `${formData.actions.luces.estado ? styles.svgActive : styles.svgInactive}`;

  const selectedDaysLabels = formData.schedule.days?.map(key => 
      DAYS_OF_WEEK.find(day => day.key === key)?.label || key
  ).join(', ') || "Ninguno";
  
  const progressWidth = step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%';

  return (
    <>
    {/* 5. INSERTAR MODAL */}
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

        {/* PASO 2 */}
        {step === 2 && (
          <div className={styles['step-content']}>
            <h2 className={styles['form-title']}>2. Dispositivos</h2>
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{margin:0}}>
                <img src={imgChorros} alt="Chorros" style={imgStyle} />
                <span className={chorrosIconClass}>Chorros</span>
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.chorrosAgua} onChange={() => handleToggle('chorros')} />
                <span className={styles.slider}></span>
              </label>
            </div>
            
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{margin:0}}>
                <img src={imgLuces} alt="Luces" style={imgStyle} />
                <span className={lucesIconClass}>Luces</span>
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
            
            {/* 🏆 MÚSICA + DESPLEGABLE DE API */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{margin:0}}>
                <img src={imgChorros} alt="Música" style={imgStyle} /> 
                <span className={musicaIconClass}>Música Ambiente</span>
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.musica.estado} onChange={() => handleToggle('musica')} />
                <span className={styles.slider}></span>
              </label>
            </div>
            {formData.actions.musica.estado && (
                <div className={styles.formGroup} style={{marginTop: 10, paddingLeft: 35}}>
                    <label className={styles.formLabel}>URL de Playlist (API):</label>
                    <input type="url" name="apiURL" className={styles.formInput} 
                        value={formData.actions.musica.apiURL} 
                        onChange={handleMusicApiChange} 
                        placeholder="Ej: https://api.music.com/playlist/fiesta"
                    />
                </div>
            )}

            {/* 🏆 TEMPERATURA + DESPLEGABLE DE SLIDER */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{margin:0}}>
                <img src={imgChorros} alt="Temperatura" style={imgStyle} />
                <span className={tempIconClass}>Control de Temperatura</span>
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.temperatura.estado} onChange={() => handleToggle('temperatura')} />
                <span className={styles.slider}></span>
              </label>
            </div>
            {formData.actions.temperatura.estado && (
                <div className={styles.formGroup} style={{marginTop: 10, paddingLeft: 35}}>
                    <label className={styles.formLabel}>Temperatura Deseada: <strong>{formData.actions.temperatura.grados}°C</strong></label>
                    <input type="range" 
                        min={MIN_TEMP} 
                        max={MAX_TEMP} 
                        step="1" 
                        value={formData.actions.temperatura.grados} 
                        onChange={handleTempChange}
                        className={styles.rangeSlider} // Asumiendo que tienes una clase de estilo para sliders
                    />
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: 'var(--color-text-secondary)'}}>
                        <span>{MIN_TEMP}°C</span>
                        <span>{MAX_TEMP}°C</span>
                    </div>
                </div>
            )}

            {/* LIMPIEZA (Simple ON/OFF) */}
            <div className={styles['device-row']}>
              <span className={styles['form-label']} style={{margin:0}}>
                <img src={imgChorros} alt="Limpieza" style={imgStyle} /> 
                <span className={limpiezaIconClass}>Limpieza Programada</span>
              </span>
              <label className={styles.switch}>
                <input type="checkbox" checked={formData.actions.limpieza.estado} onChange={() => handleToggle('limpieza')} />
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
                    <span className={styles['form-label']} style={{margin:0}}>Activación Automática</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={formData.schedule.enabled} onChange={() => handleScheduleChange('enabled', !formData.schedule.enabled)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                
                {formData.schedule.enabled && (
                    <>
                        {errorLocal && <p className={styles['error-msg']}>{errorLocal}</p>}
                        <div className={styles['form-group']} style={{marginTop: 25}}>
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

        {/* PASO 4 */}
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
            <button className={`${styles['btn-nav']} ${styles['btn-next']}`} onClick={handleNext}>Siguiente</button>
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