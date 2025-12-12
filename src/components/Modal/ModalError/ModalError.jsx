// src/components/ModalError/ModalError.jsx (CORREGIDO PARA USAR MODALEXITO.MODULE.CSS)

import React from 'react';
// CORRECCIÓN: Usar el CSS de ModalExito.module.css
import styles from '../ModalExito/ModalExito.module.css';
//       ^ Sube de /ModalError/ a /components/

const ModalError = ({ isOpen, onClose, mensaje }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard} style={{
        borderColor: 'rgba(246, 89, 89, 0.5)'
      }}>
        {/* ... (el resto del código HTML se mantiene) ... */}
        <div className={styles.iconCircle} style={{
          backgroundColor: 'rgba(246, 89, 89, 0.2)',
          color: '#F65959',
          boxShadow: '0 0 15px rgba(246, 89, 89, 0.3)'
        }}>
          
        </div>
        <h3 className={styles.title}>¡Error!</h3>
        <p className={styles.message}>{mensaje || "Ocurrió un error inesperado al conectar."}</p>

        <button
          className={styles.btnCerrar}
          onClick={onClose}
          style={{ backgroundColor: '#F65959' }}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default ModalError;