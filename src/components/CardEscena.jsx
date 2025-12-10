import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CardEscena.module.css';
// 👇 IMPORTANTE: Importa tus imágenes aquí.
import imgChorros from '../assets/imagenes/chorros.png';
import imgLuces from '../assets/imagenes/luces.png';

const CardEscena = ({ id, escena }) => {
  const navigate = useNavigate();

  // Acceso seguro a las acciones
  const luces = escena.actions?.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  const aguaOn = escena.actions?.chorrosAgua;
  const lucesOn = luces.estado;
  
  // Normalización del color (Crucial para el borde dinámico)
  let colorRGB = "rgb(255, 255, 255)";
  if (luces.color) {
    if (typeof luces.color === 'string') {
        colorRGB = luces.color;
    } else {
        const { r, g, b } = luces.color;
        colorRGB = `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
    }
  }

  // Navegación al detalle
  const navigateToDetail = () => {
    navigate(`/escenas/${id}`); 
  };

  // 🏆 EJECUCIÓN RÁPIDA (Sin navegar)
  const handleQuickRun = (e) => {
    e.stopPropagation(); // 🛑 Evita entrar al detalle
    alert(`🚀 Ejecutando escena: ${escena.name}`);
    // Aquí iría tu lógica real de activación (mutación)
  };
  
  return (
    <div 
      className={styles.modernCardLine} 
      onClick={navigateToDetail}
      // Pasamos el color como variable CSS para usarlo en los bordes
      style={{ '--scene-color': colorRGB }}
    >
      
      {/* 1. INFORMACIÓN (Izquierda) */}
      <div className={styles.infoWrapper}>
        <h3 className={styles.sceneTitle}>{escena.name}</h3>
        <p className={styles.sceneDescription}>{escena.descripcion || "Sin descripción"}</p>
        
        {/* Badge de Horario (Si es automático) */}
        {escena.schedule?.enabled && (
             <span className={styles.autoBadge}>
                ⏰ {escena.schedule.time}
             </span>
         )}
      </div>

      {/* 2. ÍCONOS Y CONTROLES (Derecha) */}
      <div className={styles.iconosWrapper}>
        
        {/* Ícono de Luces (PNG) */}
        <div className={`${styles.iconItem} ${lucesOn ? styles.activeLight : ''}`}>
           <img src={imgLuces} alt="Luces" className={styles.deviceImage} />
        </div>
        
        {/* Ícono de Agua/Chorros (PNG) */}
        <div className={`${styles.iconItem} ${aguaOn ? styles.activeWater : ''}`}>
           <img src={imgChorros} alt="Chorros" className={styles.deviceImage} />
        </div>

        {/* 🏆 BOTÓN PLAY RÁPIDO */}
        <button className={styles.quickPlayBtn} onClick={handleQuickRun}>
            ▶
        </button>
        

        
      </div>
    </div>
  )
}

export default CardEscena;