import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../../assets/constants/constants';
import imgFlecha from '../../assets/imagenes/flechaAtras.png';
import styles from './EditarEscena.module.css';
import Formulario from '../Formulario/Formulario';
import { useTitulo } from '../../hooks/useTitulo';
import ModalExito from '../Modal/ModalExito/ModalExito';
import Botones from '../BotonesGenerales/Botones/Botones';

const EditarEscena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useTitulo("Editar Escena");

  const { data: escenaDatos, isLoading: isLoadingEscena, isError: isErrorEscena } = useQuery({
    queryKey: ['escena', id],
    queryFn: () => fetch(`${URL_BASE}/escenas/${id}.json`).then(res => res.json())
  });

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
          days: (escenaDatos.schedule?.days || []).map(dayKey => {
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

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/');
  };

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

  const handleUpdate = () => mutation.mutate(formData);

  if (isLoadingEscena) return <div style={{ textAlign: 'center', marginTop: 50, color: 'white' }}>Cargando...</div>;
  if (isErrorEscena) return <div style={{ textAlign: 'center', marginTop: 50, color: 'red' }}>Error al cargar.</div>;

  return (
    <>
      <ModalExito
        isOpen={showModal}
        onClose={handleCloseModal}
        mensaje="¡La escena se ha actualizado correctamente!"
      />

      <div className={styles.flecha}>

        <Botones
          onClick={() => navigate(-1)}
          variant="nav-icon"
        >
          <img src={imgFlecha} alt="Atrás" />
        </Botones>
      </div>

      <h1 className={styles['edit-title']}>{formData.name || "Cargando..."}</h1>

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