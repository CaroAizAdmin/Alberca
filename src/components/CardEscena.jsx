import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CardEscena.module.css";

const CardEscena = ({ id, escena }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/escenas/${id}`);
  };

  const lucesActivas = escena.actions?.luces?.estado || false;
  const color = escena.actions?.luces?.color || { r: 255, g: 255, b: 255 };
  const colorRGB = `rgb(${color.r}, ${color.g}, ${color.b})`;
  const chorrosActivos = escena.actions?.chorrosAgua || false;


  return (
    <div
      className={styles.card}
      onClick={handleCardClick}
      style={{
        "--glow-color": lucesActivas ? colorRGB : "rgba(255,255,255,0.1)"
      }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{escena.name}</h3>
        <p className={styles.desc}>{escena.descripcion}</p>
      </div>

      <div className={styles.indicatorRow}>
        <div className={styles.indicatorItem}>
          <span className={styles.indicatorLabel}>Luces:</span>
          {lucesActivas ? (
            <div className={styles.colorDot} style={{ backgroundColor: colorRGB }}></div>
          ) : (
            <span className={styles.indicatorStatus}>OFF</span>
          )}
        </div>
        <div className={styles.indicatorItem}>
          <span className={styles.indicatorLabel}>Chorros:</span>
          <span className={`${styles.indicatorStatus} ${chorrosActivos ? styles.on : styles.off}`}>
            {chorrosActivos ? "ON" : "OFF"}
          </span>
        </div>
      </div>
      
    </div>
  );
};

export default CardEscena;