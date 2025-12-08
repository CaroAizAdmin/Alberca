import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
// REUTILIZAMOS LOS ESTILOS DEL GESTOR PARA MANTENER LA COHERENCIA
import './GestorEscenas.css';

const EditarEscena = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
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
  
  // Estado inicial vacío (se llenará cuando llegue escenaDatos)
  const [formData, setFormData] = useState({
    name: "",
    descripcion: "",
    actions: {
      chorrosAgua: false,
      luces: {
        estado: false,
        color: { r: 255, g: 255, b: 255 }
      }
    }
  });

  // --- 3. EFECTO PARA RELLENAR EL FORMULARIO ---
  useEffect(() => {
    if (escenaDatos) {
      // Si ya llegaron los datos, actualizamos el formulario
      setFormData(escenaDatos);
    }
  }, [escenaDatos]);

  // --- 4. MUTACIÓN PARA ACTUALIZAR (PUT) ---
  const mutation = useMutation({
    mutationFn: (datosActualizados) => {
      // Usamos PUT para reemplazar los datos en ese ID específico
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
      // Invalidamos la lista y el detalle específico para que se recarguen
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      queryClient.invalidateQueries({ queryKey: ['escena', id] });
      
      alert("¡Cambios guardados correctamente!");
      navigate('/escenas'); // Volver al listado
    },
    onError: (error) => {
      alert(`Error al editar: ${error.message}`);
    }
  });

  // --- FUNCIONES DE AYUDA Y HANDLERS (Igual que en Crear) ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorLocal("");
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.name.trim()) {
        setErrorLocal("El nombre de la escena es obligatorio.");
        return;
      }
    }
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

  // Convertidores de Color
  const rgbToHex = (r, g, b) => {
    // Protección por si los datos vienen corruptos o undefined
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
  if (isLoading) return <div style={{textAlign: 'center', marginTop: 50}}>Cargando datos de la escena...</div>;
  if (isError) return <div style={{textAlign: 'center', marginTop: 50, color: 'red'}}>Error al cargar la escena.</div>;

  return (
    <div className="gestor-container">
      {/* Título de la página de edición */}
      <h2 style={{textAlign: 'center', marginBottom: 20, color: '#1c1c1e'}}>
        Editando: {escenaDatos?.name}
      </h2>

      {/* BARRA DE PROGRESO */}
      <div className="progress-bar-container">
        <div className="progress-line"></div>
        <div className="progress-fill" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
        <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>

      <div className="form-card">
        
        {/* PASO 1 */}
        {step === 1 && (
          <div className="step-content">
            <h2 className="form-title">Identidad</h2>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input 
                type="text" name="name" className="form-input" 
                value={formData.name} onChange={handleChange}
              />
              {errorLocal && <p className="error-msg">{errorLocal}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea 
                name="descripcion" className="form-textarea" rows="3"
                value={formData.descripcion} onChange={handleChange}
              ></textarea>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div className="step-content">
            <h2 className="form-title">Dispositivos</h2>
            <div className="device-row">
              <span className="form-label" style={{margin:0}}>🌊 Chorros</span>
              <label className="switch">
                <input type="checkbox" checked={formData.actions.chorrosAgua} onChange={() => handleToggle('chorros')} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="device-row">
              <span className="form-label" style={{margin:0}}>💡 Luces</span>
              <label className="switch">
                <input type="checkbox" checked={formData.actions.luces.estado} onChange={() => handleToggle('luces')} />
                <span className="slider"></span>
              </label>
            </div>
            
            {formData.actions.luces.estado && (
                <div className="form-group" style={{marginTop: 20}}>
                    <div className="color-picker-wrapper">
                        <label className="form-label">Color:</label>
                        <div className="modern-color-input-container">
                            <input 
                                type="color" className="modern-color-input"
                                value={rgbToHex(
                                    formData.actions.luces.color.r, 
                                    formData.actions.luces.color.g, 
                                    formData.actions.luces.color.b
                                )}
                                onChange={handleColorPickerChange}
                            />
                            <span className="color-code">
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

        {/* PASO 3 */}
        {step === 3 && (
          <div className="step-content">
            <h2 className="form-title">Revisar Cambios</h2>
            <div className="summary-list">
                <p><strong>Nombre:</strong> {formData.name}</p>
                <p><strong>Descripción:</strong> {formData.descripcion || "-"}</p>
                <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid #eee'}}/>
                <p><strong>Chorros:</strong> {formData.actions.chorrosAgua ? "ON" : "OFF"}</p>
                <p><strong>Luces:</strong> {formData.actions.luces.estado ? "ON" : "OFF"}</p>
            </div>
          </div>
        )}

        {/* BOTONES */}
        <div className="buttons-container">
          {step > 1 && (
            <button className="btn-nav btn-prev" onClick={handleBack}>
              Atrás
            </button>
          )}
          
          {step < 3 ? (
            <button className="btn-nav btn-next" onClick={handleNext}>
              Siguiente
            </button>
          ) : (
            <button 
              className="btn-nav btn-next" 
              onClick={handleUpdate} 
              style={{backgroundColor: '#34c759'}}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Actualizando..." : "Guardar Cambios"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarEscena;