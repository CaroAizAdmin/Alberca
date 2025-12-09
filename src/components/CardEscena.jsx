import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CardEscena.module.css';

const CardEscena = ({ id, escena }) => {
  const navigate = useNavigate();

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

  // 🏆 HANDLER DE NAVEGACIÓN
  const navigateToDetail = () => {
    // Usamos el ID (clave de Firebase) para ir al detalle
    navigate(`/escenas/${id}`); 
  };
  
  // --- ESTRUCTURA DE LÍNEA SIMPLE ---
  return (
    <div 
      className={styles.modernCardLine} 
      onClick={navigateToDetail} // 🏆 CLAVE: El clic en toda la tarjeta navega
      style={{ 
        '--scene-color': colorRGB, // Necesario para los estilos neón
      }}
    >
      
      {/* 1. INFORMACIÓN (Izquierda) */}
      <div className={styles.infoWrapper}>
        <h3 className={styles.sceneTitle}>{escena.name}</h3>
        <p className={styles.sceneDescription}>{escena.descripcion}</p>
      </div>

      {/* 2. ÍCONOS Y FLECHA (Derecha) */}
      <div className={styles.iconosWrapper}>
        
        {/* Ícono de Luces */}
        <div 
          // Añadimos la clase 'activeLight' si está encendido
          className={`${styles.iconItem} ${lucesOn ? styles.activeLight : ''}`}
        >
          {/* SVG de Luz */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"></line><line x1="16.95" y1="16.95" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"></line><line x1="16.95" y1="7.05" x2="19.78" y2="4.22"></line>
          </svg>
        </div>
        
        {/* Ícono de Agua/Chorros */}
        <div 
          className={`${styles.iconItem} ${aguaOn ? styles.activeWater : ''}`}
        >
          {/* SVG de Agua */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        </div>
        
        {/* Flecha de Detalle */}
        <div className={styles.arrow}>
          &gt;
        </div>
        
      </div>
    </div>
  )
}

export default CardEscena;