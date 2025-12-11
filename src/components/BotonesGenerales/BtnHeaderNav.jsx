// src/components/BtnHeaderNav.jsx

import React from 'react';

const ICON_DEFAULT_STYLE = { width: '20px', height: '20px' };

const BtnHeaderNav = ({ styles, navigate, imgFlecha, iconNavStyle, handleEdit }) => {
  return (
    <div className={styles.detalleNavWrapper}>
      <div className={styles.detalleHeader}>
        <button className={styles.btnBackNav} onClick={() => navigate('/escenas')}>
          <img src={imgFlecha} alt="Atrás" style={iconNavStyle || ICON_DEFAULT_STYLE} />
        </button>
        <button className={styles.btnEdit} onClick={handleEdit}>
          Editar
        </button>
      </div>
    </div>
  );
};

export default BtnHeaderNav;