import localStyles from './BotonPlay.module.css';

import React from 'react';

// No necesitamos la prop 'styles' porque usamos localStyles
const BotonPlay = ({ isSceneActive, handleQuickRun, activateMutation }) => {
  return (
    <button 
        // 2. Usamos el import local 'localStyles'
        className={`${localStyles.quickPlayBtn} ${isSceneActive ? localStyles.btnActive : ''}`} 
        onClick={handleQuickRun}
        disabled={activateMutation.isPending}
    >
        {activateMutation.isPending ? "..." : (isSceneActive ? "■" : "▶")}
    </button>
  );
};

export default BotonPlay