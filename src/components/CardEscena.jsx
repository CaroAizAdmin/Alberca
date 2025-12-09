import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CardEscena.module.css";

import iconoMusica from '../assets/imagenes/mas.png'; 
import iconoChorros from '../assets/imagenes/mas.png';
import iconoLuces from '../assets/imagenes/mas.png';

const CardEscena = ({ id, escena }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/escenas/${id}`);
  };

  const lucesActivas = escena.actions?.luces?.estado || false;
  const chorrosActivos = escena.actions?.chorrosAgua || false;
  const musicaActiva = escena.actions?.musica || false; 

  return (
    <div
      className={styles.cardEscena} 
      onClick={handleCardClick}
    >
      
      <div className={styles.infoWrapper}>
        <h3 className={styles.escenaTitle}>{escena.name}</h3>
        <p className={styles.escenaDesc}>{escena.descripcion || "Sin descripción"}</p>
      </div>

      <div className={styles.iconosWrapper}>
        
        <div className={styles.iconItem}>
          <img 
            src={iconoLuces} 
            alt="Luces" 
            className={styles.deviceIcon} 
            style={{ opacity: lucesActivas ? 1 : 0.3 }}
          />
        </div>

        <div className={styles.iconItem}>
          <img 
            src={iconoChorros} 
            alt="Chorros" 
            className={styles.deviceIcon}
            style={{ opacity: chorrosActivos ? 1 : 0.3 }}
          />
        </div>

        <div className={styles.iconItem}>
          <img 
            src={iconoMusica} 
            alt="Música" 
            className={styles.deviceIcon} 
            style={{ opacity: musicaActiva ? 1 : 0.3 }}
          />
        </div>
      </div>
      
      <div className={styles.arrow}>
        <span>&gt;</span>
      </div>
      
    </div>
  );
};

export default CardEscena;