import React from 'react';
import styles from './ModalExito.module.css'; // Reutilizamos los estilos base

const ModalError = ({ isOpen, onClose, mensaje }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard} style={{ 
          // Opcional: Si quieres darle un toque extra de rojo al borde
          borderColor: 'rgba(246, 89, 89, 0.5)' 
      }}>
        {/* Círculo Rojo con X */}
        <div className={styles.iconCircle} style={{ 
            backgroundColor: 'rgba(246, 89, 89, 0.2)', 
            color: '#F65959', // Color de peligro (rojo)
            boxShadow: '0 0 15px rgba(246, 89, 89, 0.3)'
        }}>
          ✕
        </div>
        <h3 className={styles.title}>¡Error!</h3>
        <p className={styles.message}>{mensaje || "Ocurrió un error inesperado al conectar."}</p>
        
        <button 
            className={styles.btnCerrar} 
            onClick={onClose}
            style={{ backgroundColor: '#F65959' }} // Botón Rojo
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default ModalError;