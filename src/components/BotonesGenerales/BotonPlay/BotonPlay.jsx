import React from 'react';
import localStyles from './BotonPlay.module.css';

const BotonPlay = ({ isSceneActive, handleQuickRun, activateMutation }) => {
  return (
    <button
      className={`${localStyles.quickPlayBtn} ${isSceneActive ? localStyles.btnActive : ''}`}
      onClick={handleQuickRun}
      disabled={activateMutation.isPending}
    >
      {activateMutation.isPending ? "..." : (isSceneActive ? "■" : "▶")}
    </button>
  );
};

export default BotonPlay