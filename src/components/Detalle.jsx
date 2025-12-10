import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import styles from './Detalle.module.css'; 
// 🗑️ BORRAMOS: import Header from '../components/Header'; (Ya no se necesita)
import imgFlecha from '../assets/imagenes/flechaAtras.png';
import { useTitulo } from '../hooks/useTitulo'; // ✅ IMPORTANTE: El hook

// ... (Mantenemos tus SVGs CHORROS_SVG y LUCES_SVG igual que antes) ...
const CHORROS_SVG = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
);

const LUCES_SVG = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"></line><line x1="16.95" y1="16.95" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"></line><line x1="16.95" y1="7.05" x2="19.78" y2="4.22"></line>
    </svg>
);

// ==========================================================
// 2. COMPONENTE PRINCIPAL (Detalle)
// ==========================================================
const Detalle = () => { // Ya no necesitamos props aquí porque usamos useQuery
  const { id } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- OBTENER DATOS (GET) ---
  const { data: escena, isLoading, error } = useQuery({
    queryKey: ["escena", id],
    queryFn: async () => {
      const response = await fetch(`${URL_BASE}/escenas/${id}.json`);
      if (!response.ok) throw new Error('Error de conexión.');
      const data = await response.json();
      if (!data) throw new Error('La escena no existe.');
      return data;
    },
  });

  // 🏆 AQUI ESTA LA MAGIA (Implementación de Zustand)
  // Si 'escena' tiene datos, ponemos su nombre. Si no, mostramos cargando.
  useTitulo(escena ? escena.name : "Cargando escena...");

  // --- MUTACIÓN PARA ELIMINAR (DELETE) ---
  const deleteMutation = useMutation({
    mutationFn: () => {
      return fetch(`${URL_BASE}/escenas/${id}.json`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) return Promise.reject("Error al eliminar");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      alert("Escena eliminada correctamente");
      navigate('/escenas'); 
    },
    onError: () => alert("Hubo un error al intentar eliminar.")
  });

  const handleEdit = () => navigate(`/editar-escena/${id}`);
  const handleDelete = () => {
    if (window.confirm("¿Eliminar escena?")) deleteMutation.mutate();
  };
  const handleExecute = () => alert(`¡Ejecutando escena: ${escena?.name}!`);

  if (isLoading) return <div className={`${styles.loadingMsg} ${styles.appBackground}`}>Cargando...</div>;
  if (error) return <div className={`${styles.errorMsg} ${styles.appBackground}`}>Error: {error.message}</div>;

  // Lógica de estilos (sin cambios)
  const actions = escena.actions || {};
  const luces = actions.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  
  let colorRGB = "rgb(255, 255, 255)";
  if (luces.color) {
      if (typeof luces.color === 'string') colorRGB = luces.color;
      else {
          const { r, g, b } = luces.color;
          colorRGB = `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
      }
  }

  const lightStyle = { ...(luces.estado && {'--scene-color': colorRGB}) };
  const chorrosIconClass = `${styles.deviceIcon} ${actions.chorrosAgua ? styles.activeWater : ''}`;
  const lucesIconClass = `${styles.deviceIcon} ${luces.estado ? styles.activeLight : ''}`;
  
  const iconStyle = { width: '24px', height: '24px', objectFit: 'contain' };

  return (
    <div className={`${styles.detalleContainer} ${styles.appBackground}`}>
      
      {/* 1. WRAPPER DE NAVEGACIÓN */}
      <div className={styles.detalleNavWrapper}>
        <div className={styles.detalleHeader}>
          <button className={styles.btnBackNav} onClick={() => navigate('/escenas')}>
            <img src={imgFlecha} alt="Atrás" style={iconStyle} />
          </button>
          <button className={styles.btnEdit} onClick={handleEdit}>
             Editar
          </button>
        </div>
      </div>
      
      {/* 🗑️ HEMOS ELIMINADO EL DIV 'headerTitleWrapper' Y EL COMPONENTE <Header> 
          PORQUE AHORA ESTÁ EN EL LAYOUT */}

      {/* 2. CONTENEDOR CENTRAL */}
      <div className={styles.centerWrapper}>

        <div className={styles.detalleHero}>
          <p className={styles.detalleDesc}>{escena.descripcion || "Sin descripción."}</p>
          <button className={styles.btnBigPlay} onClick={handleExecute}>
            <div className={styles.playIcon}>&#x25B6;</div>
            <span>ACTIVAR AHORA</span>
          </button>
        </div>

        {/* TARJETAS DE DISPOSITIVOS (Sin cambios) */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Dispositivos Configurados</h3>
          
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
                <div className={chorrosIconClass}>{CHORROS_SVG}</div>
                <span className={styles.deviceLabel}>Chorros de agua</span>
            </div>
            <span className={`${styles.statusBadge} ${actions.chorrosAgua ? styles.on : styles.off}`}>
              {actions.chorrosAgua ? 'ENCENDIDOS' : 'APAGADOS'}
            </span>
          </div>

          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
                <div className={lucesIconClass} style={lightStyle}>{LUCES_SVG}</div>
                <span className={styles.deviceLabel}>Luces Piscina</span>
            </div>
            <div className={styles.lightStatus}>
              {luces.estado && <div className={styles.colorPreviewDot} style={{backgroundColor: colorRGB}}></div>}
              <span className={`${styles.statusBadge} ${luces.estado ? styles.on : styles.off}`}>
                  {luces.estado ? 'ENCENDIDAS' : 'APAGADAS'}
              </span>
            </div>
          </div>
        </div>

        {/* HORARIOS */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Días y Horarios</h3>
          <div className={styles.scheduleRow}>
              <div className={styles.scheduleContent}>
                  <strong className={styles.scheduleTitle}>Programación</strong>
                  {/* Pequeña mejora: Mostrar los días reales si existen */}
                  <p className={styles.scheduleText}>
                    {escena.schedule?.enabled 
                        ? `Días: ${escena.schedule.days?.join(', ') || 'N/A'} - ${escena.schedule.time}` 
                        : "Apagado automático desactivado"}
                  </p>
              </div>
          </div>
        </div>

        {/* ZONA DE PELIGRO */}
        <div className={styles.dangerZone}>
          <button 
              className={styles.btnDelete} 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
          >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar Escena"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Detalle;