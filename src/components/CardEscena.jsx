import React from 'react';
import { useNavigate } from 'react-router-dom';
// 1. IMPORTACIÓN COMO OBJETO 'styles'
import styles from './CardEscena.module.css'; 

const CardEscena = ({ id, escena }) => {
  const navigate = useNavigate();

  const luces = escena.actions?.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  
  let colorRGB = "rgb(255, 255, 255)";
  if (luces.color) {
    if (typeof luces.color === 'string') {
        colorRGB = luces.color;
    } else {
        const { r, g, b } = luces.color;
        colorRGB = `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
    }
  }

  const lucesOn = luces.estado;
  const aguaOn = escena.actions?.chorrosAgua;

  return (
    <div 
      // 2. USO: styles.modernCard
      className={styles.modernCard} 
      style={{ 
        '--scene-color': colorRGB,
        '--scene-glow': lucesOn ? colorRGB : 'transparent' 
      }}
      onClick={() => navigate(`/escenas/${id}`)}
    >
      <div className={styles.bgGlow}></div>

      <div className={styles.cardContent}>
        <div className={styles.cardTitles}>
          <h3>{escena.name}</h3>
          <p>{escena.descripcion}</p>
        </div>

        <div className={styles.statusGrid}>
          
          {/* Lógica condicional con Template Literals */}
          {/* Antes: className={`status-box ${aguaOn ? 'active-water' : ''}`} */}
          {/* Ahora: Accedemos a las propiedades del objeto styles */}
          <div className={`${styles.statusBox} ${aguaOn ? styles.activeWater : ''}`}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
            </div>
            <span>Chorros</span>
            <span className={styles.statusText}>{aguaOn ? 'ON' : 'OFF'}</span>
          </div>

          <div className={`${styles.statusBox} ${lucesOn ? styles.activeLight : ''}`}>
            <div className={styles.iconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="5"></line>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"></line>
                <line x1="16.95" y1="16.95" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="5" y2="12"></line>
                <line x1="19" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"></line>
                <line x1="16.95" y1="7.05" x2="19.78" y2="4.22"></line>
              </svg>
            </div>
            <span>Luces</span>
            <div 
              className={styles.colorDot} 
              style={{ backgroundColor: colorRGB, boxShadow: `0 0 10px ${colorRGB}` }}
            ></div>
          </div>
        </div>

        <button 
            className={styles.btnModernAction}
            onClick={(e) => {
                e.stopPropagation();
                navigate(`/editar-escena/${id}`);
            }}
        >
          Editar Escena
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
             <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CardEscena;