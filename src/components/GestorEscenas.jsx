// src/components/GestorEscenas.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import styles from './GestorEscenas.module.css'; // Solo estilos de contenedor
import Formulario from './Formulario/Formulario';
import { useTitulo } from '../hooks/useTitulo';
import ModalExito from './ModalExito';


const GestorEscenas = () => {
  useTitulo("Crear Nueva Escena");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ESTADOS
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [errorLocal, setErrorLocal] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    descripcion: "",
    actions: {
      chorrosAgua: false,
      luces: { estado: false, color: { r: 255, g: 255, b: 255 } },
      musica: false,
      temperatura: { estado: false, grados: 25 },
      limpieza: false
    },
    schedule: { enabled: false, days: [], time: "19:00" }
  });

  // --- LÓGICA DE MUTACIÓN (POST) ---
  const mutation = useMutation({
    mutationFn: (nuevaEscena) => {
      // Nota: Si usa Firebase o similar, .json es necesario
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

  // --- HANDLERS DE FORMULARIO Y PASOS ---
  const handleChange = (e) => {
    // Usamos ?? "" para asegurar que el valor nunca sea null/undefined en el estado si el evento es inconsistente
    setFormData({ ...formData, [e.target.name]: e.target.value ?? "" });
    setErrorLocal("");
  };

  const handleScheduleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, [key]: value ?? "" }
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
    // Validación del paso 1
    if (step === 1 && (!formData.name || !formData.name.trim())) {
        setErrorLocal("El nombre de la escena es obligatorio.");
        return;
    }
    // Validación (Advertencia) del paso 2
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
    // Validación del paso 3
    if (step === 3 && formData.schedule.enabled && formData.schedule.days.length === 0) {
        setErrorLocal("Debes seleccionar al menos un día para la programación automática.");
        return;
    }
    setErrorLocal("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorLocal("");
    setStep(step - 1);
  };

  // --- HANDLER DE TOGGLE UNIFICADO (Lógica Inmutable CLAVE) ---
  const handleToggle = (device) => {
    setFormData(prev => {
      const newActions = { ...prev.actions };

      switch (device) {
        case 'chorros':
          newActions.chorrosAgua = !newActions.chorrosAgua;
          break;
        case 'luces':
          // Copia inmutable correcta del objeto anidado 'luces'
          newActions.luces = { 
            ...newActions.luces, 
            estado: !newActions.luces.estado 
          };
          break;
        case 'temperatura': 
          newActions.temperatura = { 
            ...newActions.temperatura, 
            estado: !newActions.temperatura.estado 
          };
          break;
        case 'musica':
        case 'limpieza':
          newActions[device] = !prev.actions[device];
          break;
        default:
          return prev;
      }
      return { ...prev, actions: newActions };
    });
  };

  // --- HANDLERS DE COLOR Y TEMPERATURA ---
  // Recibe {r, g, b} del Formulario.jsx
  const handleColorPickerChange = ({ r, g, b }) => {
    setFormData(prev => ({
      ...prev,
      actions: {
        ...prev.actions,
        luces: { ...prev.actions.luces, color: { r, g, b } }
      }
    }));
  };

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

  // FUNCIÓN DE ACCIÓN FINAL
  const handleSave = () => mutation.mutate(formData);

  return (
    <div className={styles.editContainer}>

      {/* MODAL */}
      <ModalExito
        isOpen={showModal}
        onClose={handleCloseModal}
        mensaje="¡La escena se ha creado y guardado en la nube correctamente!"
      />
      
  


      {/* COMPONENTE DINÁMICO */}
     <Formulario
        formData={formData}
        step={step}
        errorLocal={errorLocal}
        mutation={mutation}
        mode="create" // Añadir el modo para diferenciar la acción final
        
        containerClassName={styles.editContainer} 
        
        handleChange={handleChange}
        handleScheduleChange={handleScheduleChange}
        handleDayToggle={handleDayToggle}
        handleToggle={handleToggle}
        handleColorPickerChange={handleColorPickerChange}
        handleTempChange={handleTempChange}
        handleNext={handleNext}
        handleBack={handleBack}
        handleAction={handleSave} 
      />

    </div>
  );
};

export default GestorEscenas;