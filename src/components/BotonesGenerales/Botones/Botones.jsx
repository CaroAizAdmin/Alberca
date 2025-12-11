// src/components/BotonesGenerales/Botones/Botones.jsx

import React from 'react';
import styles from './Botones.module.css'; 

const Botones = ({ 
  variant = 'default', 
  isActive = false, 
  children, 
  className, 
  isIconOnly = false, // 💡 Nuevo: Para botón de ícono
  ...props 
}) => {
  
  let variantClass = '';
  
  switch (variant) {
    case 'play':
      variantClass = styles.btnPlay;
      if (isActive) {
        variantClass += ` ${styles.active}`;
      }
      break;
      
    case 'delete':
      variantClass = styles.btnDelete;
      break;
      
    case 'default':
    default:
      variantClass = styles.btnDefault;
      break;
  }

  // Clases base y de variante
  let finalClassName = `${styles.btnBase} ${variantClass} ${className || ''}`;

  // 💡 APLICAR ESTILO DE ÍCONO SOLAMENTE
  if (isIconOnly) {
    finalClassName += ` ${styles.btnIconOnly}`;
  }

  return (
    <button 
      className={finalClassName} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Botones;