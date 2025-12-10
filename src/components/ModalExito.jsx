import React from 'react';
import styles from './ModalExito.module.css';

const ModalExito = ({ isOpen, onClose, mensaje }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <div className={styles.iconCircle}>
          ✔
        </div>
        <h3 className={styles.title}>¡Éxito!</h3>
        <p className={styles.message}>{mensaje}</p>
        <button className={styles.btnCerrar} onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default ModalExito;