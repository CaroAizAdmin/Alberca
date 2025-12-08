import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SinEscenas.css';

const SinEscenas = () => {
  const navigate = useNavigate();

  return (
    <div className="empty-state-container">
      {/* Círculo con icono */}
      <div className="empty-icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h20"></path>
          <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"></path>
          <path d="M12 5v.01"></path>
          <path d="M12 12V5"></path>
          <path d="M8 8.5a4 4 0 0 1 8 0"></path>
        </svg>
      </div>

      <div className="empty-text-content">
        <h3>No hay ningún modo/escena</h3>
        <p>
          Aún no tienes escenas configuradas. 
          <br />
          Crea la primera para controlar chorros, luces y más.
        </p>
      </div>

      <button 
        className="btn-create-first" 
        onClick={() => navigate('/crearEscena')}
      >
        <span className="plus-icon">+</span>
        Crear mi primera escena
      </button>
    </div>
  );
};

export default SinEscenas;