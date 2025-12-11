import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import imgFlecha from '../assets/imagenes/flechaAtras.png';
import styles from './EditarEscena.module.css'; // Solo estilos de contenedor y navegación
import Formulario from './Formulario/Formulario';
import { useTitulo } from '../hooks/useTitulo';
import ModalExito from './ModalExito';
import Botones from './BotonesGenerales/Botones/Botones'; // 💡 Importamos el componente Botones


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

  // --- EFECTO RELLENO DE DATOS (Añadimos limpieza de claves de días) ---
  useEffect(() => {
    if (escenaDatos && escenaDatos.name) {

      const defaultActions = {
        chorrosAgua: false,
        luces: { estado: false, color: { r: 255, g: 255, b: 255 } },
        musica: false,
        temperatura: { estado: false, grados: 25 },
        limpieza: false
      };

      const initialData = {
        ...escenaDatos,

        actions: {
          ...defaultActions,
          ...(escenaDatos.actions || {}),

          luces: {
            ...defaultActions.luces,
            ...(escenaDatos.actions?.luces || {})
          },
          temperatura: {
            ...defaultActions.temperatura,
            ...(escenaDatos.actions?.temperatura || {}),
          },
        },

        schedule: {
          enabled: escenaDatos.schedule?.enabled ?? false,
          // 💡 LIMPIEZA DE CLAVES DE DÍAS: Convertir posibles errores de guardado ('th', 'thu') a 'ju'
          days: (escenaDatos.schedule?.days || []).map(dayKey => {
            // Manejar 'th' o 'thu' (abreviaturas en inglés) y convertir a 'ju' (Jueves en español)
            if (dayKey === 'th' || dayKey === 'thu') {
              return 'ju';
            }
            return dayKey;
          }),
          time: escenaDatos.schedule?.time || "19:00"
        }
      };

      if (formData.name === "" || formData.name !== initialData.name) {
        setFormData(initialData);
      }
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
      setShowModal(true);
    },
    onError: (error) => alert(`Error al editar: ${error.message}`)
  });

  // FUNCIÓN PARA CERRAR MODAL Y NAVEGAR
  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/');
  };

  // --- HANDLERS DE FORMULARIO Y PASOS ---
  const handleChange = (e) => {
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

  // --- HANDLER DE TOGGLE UNIFICADO (Lógica Inmutable CLAVE) ---
  const handleToggle = (device) => {
    setFormData(prev => {
      const newActions = { ...prev.actions };

      switch (device) {
        case 'chorros':
          newActions.chorrosAgua = !newActions.chorrosAgua;
          break;
        case 'luces':
          newActions.luces = { ...newActions.luces, estado: !newActions.luces.estado };
          break;
        case 'temperatura':
          newActions.temperatura = { ...newActions.temperatura, estado: !newActions.temperatura.estado };
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

  // --- FUNCIÓN DE ACCIÓN FINAL ---
  const handleUpdate = () => mutation.mutate(formData);

  // --- CONDICIONALES DE CARGA/ERROR ---
  if (isLoadingEscena) return <div style={{ textAlign: 'center', marginTop: 50, color: 'white' }}>Cargando...</div>;
  if (isErrorEscena) return <div style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>Error al cargar.</div>;

  return (
    <>
      <ModalExito
        isOpen={showModal}
        onClose={handleCloseModal}
        mensaje="¡La escena se ha actualizado correctamente!"
      />

      {/* Botón de navegación (fuera del Formulario) */}
      <div className={styles.flecha}>
        {/* 💡 REEMPLAZADO: Usamos el componente Botones para que herede el estilo glassy y cuadrado */}
        <Botones 
            onClick={() => navigate(-1)} 
            isIconOnly={true} // Aplica el estilo compacto y cuadrado definido en Botones.module.css
        >
          {/* El CSS de Botones.module.css se encarga de que esta imagen se vea blanca */}
          <img src={imgFlecha} alt="Atrás" />
        </Botones>
      </div>

      {/* Título de la página */}
      <h1 className={styles['edit-title']}>{formData.name || "Cargando..."}</h1>


      {/* COMPONENTE DINÁMICO */}
      <Formulario
        formData={formData}
        step={step}
        errorLocal={errorLocal}
        mutation={mutation}
        mode="edit"

        containerClassName={styles['edit-container']}

        handleChange={handleChange}
        handleScheduleChange={handleScheduleChange}
        handleDayToggle={handleDayToggle}
        handleToggle={handleToggle}
        handleColorPickerChange={handleColorPickerChange}
        handleTempChange={handleTempChange}
        handleNext={handleNext}
        handleBack={handleBack}
        handleAction={handleUpdate}
      />
    </>
  );
};

export default EditarEscena;