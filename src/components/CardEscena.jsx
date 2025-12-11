import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { URL_BASE } from '../assets/constants/constants';
import styles from './CardEscena.module.css';

// 💡 IMPORTACIONES DE IMÁGENES
import imgChorros from '../assets/imagenes/chorros.png';
import imgLuces from '../assets/imagenes/luces.png';
// Sustituir imgLuces por estas cuando las rutas sean correctas:
// import imgMusica from '../assets/imagenes/musica.png'; 
// import imgTemperatura from '../assets/imagenes/temperatura.png';
// import imgLimpieza from '../assets/imagenes/limpieza.png'; 

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
      // 1. Obtener todas las escenas
      return fetch(`${URL_BASE}/escenas.json`)
        .then((response) => response.json())
        .then((allScenes) => {
          const updates = {};
          
          // Preparar datos del historial
          const newHistoryEntry = { date: new Date().toISOString(), type: 'MANUAL' };
          const historyId = Date.now().toString();

          if (allScenes) {
            // 2. Iterar y actualizar el estado
            Object.keys(allScenes).forEach((key) => {
              if (key === id) {
                 // Activar la escena actual + Guardar Historial
                 const prevHistory = allScenes[key].history || {};
                 updates[key] = {
                    ...allScenes[key],
                    active: true,
                    // Asegurarse de que history sea un objeto si es null
                    history: { ...(prevHistory || {}), [historyId]: newHistoryEntry }
                 };
              } else {
                 // Desactivar las demás escenas
                 updates[key] = { ...allScenes[key], active: false };
              }
            });
          }
          // 3. Enviar la actualización PUT con todas las escenas
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
      console.error("Error en activateMutation:", err);
      alert("No se pudo activar la escena. Verifica la estructura JSON de la escena.");
    }
  });

  // --- 2. DATOS VISUALES (Se asegura de usar el operador ?. para evitar fallos si actions es null) ---
  const luces = escena.actions?.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  const aguaOn = escena.actions?.chorrosAgua || false;
  const lucesConfiguradas = luces.estado;
  
  // LECTURA SEGURA DE LOS NUEVOS DISPOSITIVOS
  const musicaOn = escena.actions?.musica?.estado || false;
  const temperaturaOn = escena.actions?.temperatura?.estado || false;
  const limpiezaOn = escena.actions?.limpieza?.estado || false;
  
  const isSceneActive = escena.active === true;
  const diasTexto = formatDays(escena.schedule?.days);

  let colorRGB = "rgb(255, 255, 255)";
  if (luces.color) {
    if (typeof luces.color === 'string') {
        colorRGB = luces.color;
    } else {
        // Aseguramos que r, g, b no sean undefined o null antes de usarlos
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
        {/* 1. SECCIÓN IZQUIERDA: Texto y 5 Íconos Pequeños (infoWrapper) */}
        <div className={styles.infoWrapper}>
          <h3 className={styles.sceneTitle}>{escena.name}</h3>
          <p className={styles.sceneDescription}>{escena.descripcion || "Sin descripción"}</p>
          
          {/* Badge Automático (si existe) */}
          {escena.schedule?.enabled && (
               <span className={styles.autoBadge}>
                  📅 {diasTexto} — ⏰ {escena.schedule.time}
               </span>
           )}
           
           {/* 🏆 CONTENEDOR DE LOS 5 ÍCONOS DE RESUMEN */}
           <div className={styles.summaryIconsWrapper}>
               {/* 1. ÍCONO LUCES */}
               <div className={`${styles.summaryIconItem} ${lucesConfiguradas ? styles.activeLight : ''}`}>
                  <img src={imgLuces} alt="Luces" className={styles.deviceImage} />
               </div>
               {/* 2. ÍCONO CHORROS */}
               <div className={`${styles.summaryIconItem} ${aguaOn ? styles.activeWater : ''}`}>
                  <img src={imgChorros} alt="Chorros" className={styles.deviceImage} />
               </div>
               {/* 3. ÍCONO MÚSICA */}
               <div className={`${styles.summaryIconItem} ${musicaOn ? styles.activeMusic : ''}`}>
                  <img src={imgLuces} alt="Música" className={styles.deviceImage} /> 
               </div>
               {/* 4. ÍCONO TEMPERATURA */}
               <div className={`${styles.summaryIconItem} ${temperaturaOn ? styles.activeTemp : ''}`}>
                  <img src={imgLuces} alt="Temperatura" className={styles.deviceImage} />
               </div>
               {/* 5. ÍCONO LIMPIEZA */}
               <div className={`${styles.summaryIconItem} ${limpiezaOn ? styles.activeLimpieza : ''}`}>
                  <img src={imgLuces} alt="Limpieza" className={styles.deviceImage} />
               </div>
           </div>
        </div> {/* Cierre de infoWrapper */}

        {/* 2. SECCIÓN DERECHA: Solo Botón de Play (iconosWrapper) */}
        <div className={styles.iconosWrapper}>
          <button 
              className={`${styles.quickPlayBtn} ${isSceneActive ? styles.btnActive : ''}`} 
              onClick={handleQuickRun}
              disabled={activateMutation.isPending}
          >
              {activateMutation.isPending ? "..." : (isSceneActive ? "■" : "▶")}
          </button>
        </div> {/* Cierre de iconosWrapper */}
      </div> {/* Cierre de modernCardLine */}
    </>
  )
}

export default CardEscena;