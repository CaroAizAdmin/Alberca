import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import './GestorEscenas.css';

const GestorEscenas = ({ escena, setEscenas }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- LÓGICA DE MUTACIÓN (POST) SIN ASYNC/AWAIT ---
  const mutation = useMutation({
    mutationFn: (nuevaEscena) => {
      // Retornamos directamente el fetch
      return fetch(`${URL_BASE}/escenas.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaEscena),
      })
      .then((response) => {
        // Verificamos si la respuesta es correcta
        if (!response.ok) {
          throw new Error('Error al guardar la escena');
        }
        return response.json();
      });
    },
    onSuccess: () => {
      // Si todo sale bien:
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      alert("¡Escena guardada en la nube!");
      navigate('/escenas'); 
    },
    onError: (error) => {
      // Si falla:
      alert(`Error: ${error.message}`);
    }
  });


  // --- RESTO DEL COMPONENTE (Mismo código de UI y Pasos) ---
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setError("El nombre de la escena es obligatorio.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
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


// 1. Convierte el objeto RGB {r,g,b} a string Hex "#RRGGBB" para el input
  const rgbToHex = (r, g, b) => {
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
  };

  // 2. Convierte string Hex "#RRGGBB" a objeto {r,g,b} para guardar en tu estado
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  // --- NUEVO MANEJADOR DEL INPUT COLOR ---
  const handleColorPickerChange = (e) => {
    const hexColor = e.target.value;
    const { r, g, b } = hexToRgb(hexColor);
    
    // Actualizamos el estado igual que antes
    setFormData(prev => ({
      ...prev,
      actions: { 
          ...prev.actions, 
          luces: { ...prev.actions.luces, color: { r, g, b } } 
      }
    }));
  };





  // Guardar usando la mutación
  const handleSave = () => {
    mutation.mutate(formData);
  };

  return (
    <div className="gestor-container">
      
      {/* BARRA DE PROGRESO */}
      <div className="progress-bar-container">
        <div className="progress-line"></div>
        <div className="progress-fill" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
        
        <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>

      <div className="form-card">
        
        {/* PASO 1: Identidad */}
        {step === 1 && (
          <div className="step-content">
            <h2 className="form-title">Nombra tu Escena</h2>
            <div className="form-group">
              <label className="form-label">Nombre de la escena</label>
              <input 
                type="text" name="name" className="form-input" 
                placeholder="Ej. Relax Nocturno"
                value={formData.name} onChange={handleChange}
              />
              {error && <p className="error-msg">{error}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Descripción (Opcional)</label>
              <textarea 
                name="descripcion" className="form-textarea" rows="3"
                placeholder="¿Qué hace esta escena?"
                value={formData.descripcion} onChange={handleChange}
              ></textarea>
            </div>
          </div>
        )}

        {/* PASO 2: Dispositivos */}
        {step === 2 && (
          <div className="step-content">
            <h2 className="form-title">Configura Dispositivos</h2>
            <div className="device-row">
              <span className="form-label" style={{margin:0}}>🌊 Chorros de Agua</span>
              <label className="switch">
                <input type="checkbox" checked={formData.actions.chorrosAgua} onChange={() => handleToggle('chorros')} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="device-row">
              <span className="form-label" style={{margin:0}}>💡 Luces Piscina</span>
              <label className="switch">
                <input type="checkbox" checked={formData.actions.luces.estado} onChange={() => handleToggle('luces')} />
                <span className="slider"></span>
              </label>
            </div>
            {formData.actions.luces.estado && (
                <div className="form-group" style={{marginTop: 20}}>
                    <div className="color-picker-wrapper">
                        <label className="form-label">Elige un color exacto:</label>
                        
                        <div className="modern-color-input-container">
                            {/* Input de color nativo */}
                            <input 
                                type="color" 
                                className="modern-color-input"
                                value={rgbToHex(
                                    formData.actions.luces.color.r, 
                                    formData.actions.luces.color.g, 
                                    formData.actions.luces.color.b
                                )}
                                onChange={handleColorPickerChange}
                            />
                            
                            {/* Texto que muestra el código Hex al lado (opcional) */}
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

        {/* PASO 3: Resumen */}
        {step === 3 && (
          <div className="step-content">
            <h2 className="form-title">Resumen</h2>
            <div className="summary-list">
                <p><strong>Nombre:</strong> {formData.name}</p>
                <p><strong>Descripción:</strong> {formData.descripcion || "Sin descripción"}</p>
                <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid #eee'}}/>
                <p><strong>Chorros:</strong> {formData.actions.chorrosAgua ? "✅ Encendidos" : "❌ Apagados"}</p>
                <p><strong>Luces:</strong> {formData.actions.luces.estado ? "✅ Encendidas" : "❌ Apagadas"}</p>
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
              onClick={handleSave} 
              style={{backgroundColor: '#34c759'}}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Guardando..." : "Confirmar y Guardar"}
            </button>
          )}
        </div>
        
        {/* Mensaje de error si falla */}
        {mutation.isError && <p className="error-msg" style={{textAlign:'center', marginTop:10}}>Error: {mutation.error.message}</p>}

      </div>
    </div>
  );
};

export default GestorEscenas;