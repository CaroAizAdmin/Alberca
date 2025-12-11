

import React from 'react';

const Botones = ({ 
    styles, 
    isLastStep, 
    handleNext, 
    handleUpdate, 
    errorLocal, 
    mutation 
}) => {
    
  if (!isLastStep) {
    // Caso: Siguiente (no es el último paso)
    return (
      <button 
        className={`${styles['btn-nav']} ${styles['btn-next']}`} 
        onClick={handleNext} 
        disabled={!!errorLocal}
      >
        Siguiente
      </button>
    );
  }

  // Caso: Guardar Cambios (es el último paso)
  return (
    <button
      className={`${styles['btn-nav']} ${styles['btn-next']}`}
      onClick={handleUpdate}
      style={{ backgroundColor: 'var(--color-success)' }}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Actualizando..." : "Guardar Cambios"}
    </button>
  );
};

export default Botones;