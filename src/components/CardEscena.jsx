import React, { useState } from 'react'; // 1. Importar useState
import { useNavigate } from 'react-router-dom';
import styles from './CardEscena.module.css';
import imgChorros from '../assets/imagenes/chorros.png';
import imgLuces from '../assets/imagenes/luces.png';
import ModalExito from './ModalExito'; // 2. Importar Modal

const CardEscena = ({ id, escena }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // 3. Estado del Modal

  // Acceso seguro a las acciones
  const luces = escena.actions?.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  const aguaOn = escena.actions?.chorrosAgua;
  const lucesOn = luces.estado;
  
  // Normalización del color
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

  // 🏆 EJECUCIÓN RÁPIDA CON MODAL
  const handleQuickRun = (e) => {
    e.stopPropagation(); // Evita entrar al detalle
    
    // Aquí iría tu lógica real de activación (fetch/mutation)
    
    // Mostramos el modal de éxito
    setShowModal(true);
  };
  
  return (
    <>
      {/* 4. Renderizar Modal */}
      <ModalExito 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        mensaje={`La escena "${escena.name}" se ha activado correctamente.`}
      />

      <div 
        className={styles.modernCardLine} 
        onClick={navigateToDetail}
        style={{ '--scene-color': colorRGB }}
      >
        
        {/* 1. INFORMACIÓN */}
        <div className={styles.infoWrapper}>
          <h3 className={styles.sceneTitle}>{escena.name}</h3>
          <p className={styles.sceneDescription}>{escena.descripcion || "Sin descripción"}</p>
          
          {escena.schedule?.enabled && (
               <span className={styles.autoBadge}>
                  ⏰ {escena.schedule.time}
               </span>
           )}
        </div>

        {/* 2. ÍCONOS Y CONTROLES */}
        <div className={styles.iconosWrapper}>
          
          <div className={`${styles.iconItem} ${lucesOn ? styles.activeLight : ''}`}>
             <img src={imgLuces} alt="Luces" className={styles.deviceImage} />
          </div>
          
          <div className={`${styles.iconItem} ${aguaOn ? styles.activeWater : ''}`}>
             <img src={imgChorros} alt="Chorros" className={styles.deviceImage} />
          </div>

          {/* BOTÓN PLAY RÁPIDO */}
          <button className={styles.quickPlayBtn} onClick={handleQuickRun}>
              ▶
          </button>
          
        
          
        </div>
      </div>
    </>
  )
}

export default CardEscena;