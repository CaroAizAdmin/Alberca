import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CardEscenaModern.css'; // Asegúrate que el nombre del CSS sea correcto

// AHORA RECIBIMOS "id" y "escena" POR SEPARADO
const CardEscena = ({ id, escena }) => {
  const navigate = useNavigate();

  // Protecciones por si los datos vienen vacíos de Firebase
  const luces = escena.actions?.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  const color = luces.color || { r: 255, g: 255, b: 255 }; // Fallback a blanco
  
  // Manejo de color RGB o Hexadecimal si ya tienes el sistema nuevo
  // Si guardaste como Hex string, tendrás que convertirlo o usarlo directo.
  // Asumiendo estructura original RGB:
  const { r, g, b } = color;
  const colorRGB = `rgb(${r}, ${g}, ${b})`;

  const lucesOn = luces.estado;
  const aguaOn = escena.actions?.chorrosAgua;

  return (
    <div 
      className="modern-card"
      style={{ 
        '--scene-color': colorRGB,
        '--scene-glow': lucesOn ? colorRGB : 'transparent' 
      }}
      // AL HACER CLICK, USAMOS LA "KEY" QUE RECIBIMOS COMO "ID"
      onClick={() => navigate(`/escenas/${id}`)}
    >
      <div className="bg-glow"></div>

      <div className="card-content">
        <div className="card-titles">
          <h3>{escena.name}</h3>
          <p>{escena.descripcion}</p>
        </div>

        {/* ... resto de tu grid de estado (Chorros/Luces) ... */}
        <div className="status-grid">
             {/* ... tus widgets de agua y luz ... */}
             {/* (El código visual que ya tenías) */}
        </div>

        <button 
            className="btn-modern-action"
            onClick={(e) => {
                e.stopPropagation(); // Para que no navegue al detalle al dar click aquí
                navigate(`/editar-escena/${id}`); // USAMOS LA KEY AQUÍ TAMBIÉN
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