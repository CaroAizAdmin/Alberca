import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import styles from './CardEscena.module.css';
import imgChorros from '../assets/imagenes/chorros.png';
import imgLuces from '../assets/imagenes/luces.png';
import ModalExito from './ModalExito';

// Función auxiliar para formatear días
const formatDays = (days) => {
  if (!days || days.length === 0) return "Sin días";
  const dayMap = {
    mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", 
    fri: "Vie", sat: "Sáb", sun: "Dom"
  };
  return days.map(d => dayMap[d] || d).join(", ");
};

const CardEscena = ({ id, escena }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // --- 1. LÓGICA DE ACTIVACIÓN (CON HISTORIAL) ---
  const activateMutation = useMutation({
    mutationFn: () => {
      return fetch(`${URL_BASE}/escenas.json`)
        .then((response) => response.json())
        .then((allScenes) => {
          const updates = {};
          
          // Datos del historial
          const newHistoryEntry = { date: new Date().toISOString(), type: 'MANUAL' };
          const historyId = Date.now().toString();

          if (allScenes) {
            Object.keys(allScenes).forEach((key) => {
              if (key === id) {
                 // Activar + Guardar Historial
                 const prevHistory = allScenes[key].history || {};
                 updates[key] = {
                    ...allScenes[key],
                    active: true,
                    history: { ...prevHistory, [historyId]: newHistoryEntry }
                 };
              } else {
                 // Solo desactivar
                 updates[key] = { ...allScenes[key], active: false };
              }
            });
          }
          return fetch(`${URL_BASE}/escenas.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
        })
        .then((updateResponse) => updateResponse.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      setShowModal(true);
    },
    onError: (err) => {
      console.error(err);
      alert("No se pudo activar la escena.");
    }
  });

  // --- 2. DATOS VISUALES ---
  const luces = escena.actions?.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  const aguaOn = escena.actions?.chorrosAgua;
  const lucesConfiguradas = luces.estado;
  const isSceneActive = escena.active === true;
  const diasTexto = formatDays(escena.schedule?.days);

  let colorRGB = "rgb(255, 255, 255)";
  if (luces.color) {
    if (typeof luces.color === 'string') {
        colorRGB = luces.color;
    } else {
        const { r, g, b } = luces.color;
        colorRGB = `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
    }
  }

  const navigateToDetail = () => {
    navigate(`/escenas/${id}`); 
  };

  const handleQuickRun = (e) => {
    e.stopPropagation();
    activateMutation.mutate();
  };
  
  return (
    <>
      <ModalExito 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        mensaje={`¡La escena "${escena.name}" activada y registrada!`}
      />

      <div 
        className={styles.modernCardLine} 
        onClick={navigateToDetail}
        style={{ '--scene-color': colorRGB }}
      >
        <div className={styles.infoWrapper}>
          <h3 className={styles.sceneTitle}>{escena.name}</h3>
          <p className={styles.sceneDescription}>{escena.descripcion || "Sin descripción"}</p>
          {escena.schedule?.enabled && (
               <span className={styles.autoBadge}>
                  📅 {diasTexto} — ⏰ {escena.schedule.time}
               </span>
           )}
        </div>

        <div className={styles.iconosWrapper}>
          <div className={`${styles.iconItem} ${lucesConfiguradas ? styles.activeLight : ''}`}>
             <img src={imgLuces} alt="Luces" className={styles.deviceImage} />
          </div>
          <div className={`${styles.iconItem} ${aguaOn ? styles.activeWater : ''}`}>
             <img src={imgChorros} alt="Chorros" className={styles.deviceImage} />
          </div>
          <button 
              className={`${styles.quickPlayBtn} ${isSceneActive ? styles.btnActive : ''}`} 
              onClick={handleQuickRun}
              disabled={activateMutation.isPending}
          >
              {activateMutation.isPending ? "..." : (isSceneActive ? "■" : "▶")}
          </button>
        </div>
      </div>
    </>
  )
}

export default CardEscena;