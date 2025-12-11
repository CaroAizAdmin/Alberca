import React from 'react';
import styles from './Botones.module.css';

const Botones = ({ children, onClick, disabled, variant = 'default', className = '', type = 'button' }) => {

  const variantClass = styles[variant] || styles.default;
  const buttonClasses = `${styles.btn} ${variantClass} ${className}`;

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};

export default Botones;