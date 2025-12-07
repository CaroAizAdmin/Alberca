import React from 'react';
import './CardEscenaModern.css';

const CardEscena = ({ escena }) => {
  const { r, g, b } = escena.actions.luces.color;
  const colorRGB = `rgb(${r}, ${g}, ${b})`;
  const lucesOn = escena.actions.luces.estado;
  const aguaOn = escena.actions.chorrosAgua;

  return (
    <div 
      className="modern-card"
      style={{ 
        '--scene-color': colorRGB, // Variable CSS dinámica
        '--scene-glow': lucesOn ? colorRGB : 'transparent' 
      }}
    >
      {/* Círculo de color decorativo de fondo */}
      <div className="bg-glow"></div>

      <div className="card-content">
        <div className="card-titles">
          <h3>{escena.name}</h3>
          <p>{escena.descripcion}</p>
        </div>

        {/* Grid de Estado (Estilo Dashboard) */}
        <div className="status-grid">
          
          {/* Widget de Agua */}
          <div className={`status-box ${aguaOn ? 'active-water' : ''}`}>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
            </div>
            <span>Chorros</span>
            <span className="status-text">{aguaOn ? 'ON' : 'OFF'}</span>
          </div>

          {/* Widget de Luces */}
          <div className={`status-box ${lucesOn ? 'active-light' : ''}`}>
            <div className="icon-wrapper">
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
              className="color-dot" 
              style={{ backgroundColor: colorRGB, boxShadow: `0 0 10px ${colorRGB}` }}
            ></div>
          </div>

        </div>

        <button className="btn-modern-action">
          Activar Escena
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CardEscena;