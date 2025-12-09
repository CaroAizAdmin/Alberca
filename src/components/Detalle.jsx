import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import styles from './Detalle.module.css'; // Asegúrate que la ruta sea correcta
import Header from '../components/Header'; // Asegúrate que la ruta sea correcta
import imgFlecha from '../assets/imagenes/flechaAtras.png';

// ==========================================================
// 🏆 1. DEFINICIÓN DE SVGS CORREGIDA: Sin div envolvente ni comentarios externos.
// ==========================================================

// SVG para Chorros de Agua
const CHORROS_SVG = (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        {/* SVG de Agua (Corazón estilizado o Gota) */}
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
);

// SVG para Luces
const LUCES_SVG = (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        {/* SVG de Luz (Sol o Brillo) */}
        <line x1="12" y1="1" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"></line><line x1="16.95" y1="16.95" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"></line><line x1="16.95" y1="7.05" x2="19.78" y2="4.22"></line>
    </svg>
);

// ==========================================================
// 2. COMPONENTE PRINCIPAL (Detalle)
// ==========================================================
const Detalle = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- OBTENER DATOS (GET) ---
  const { data: escena, isLoading, error } = useQuery({
    queryKey: ["escena", id],
    queryFn: async () => {
      const response = await fetch(`${URL_BASE}/escenas/${id}.json`);
      if (!response.ok) {
          throw new Error('Error de conexión con el servidor.');
      }
      const data = await response.json();
      if (!data) {
          throw new Error('La escena no existe o fue eliminada.');
      }
      return data;
    },
  });

  // --- MUTACIÓN PARA ELIMINAR (DELETE) ---
  const deleteMutation = useMutation({
    mutationFn: () => {
      return fetch(`${URL_BASE}/escenas/${id}.json`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) { return Promise.reject("No se pudo eliminar la escena"); }
        return response.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      alert("Escena eliminada correctamente");
      navigate('/escenas'); 
    },
    onError: () => {
      alert("Hubo un error al intentar eliminar.");
    }
  });

  // --- HANDLERS y LÓGICA DE DATOS ---
  const handleEdit = () => navigate(`/editar-escena/${id}`);
  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta escena? No se puede deshacer.")) {
      deleteMutation.mutate();
    }
  };
  const handleExecute = () => alert(`¡Ejecutando escena: ${escena?.name}!`);

  if (isLoading) return <div className={`${styles.loadingMsg} ${styles.appBackground}`}>Cargando detalle...</div>;
  if (error) return <div className={`${styles.errorMsg} ${styles.appBackground}`}>Error: {error.message}</div>;

  const actions = escena.actions || {};
  const luces = actions.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  
  // Normalización y cálculo del color RGB para el neón dinámico
  let colorRGB = "rgb(255, 255, 255)";
  if (luces.color) {
      if (typeof luces.color === 'string') {
          colorRGB = luces.color;
      } else {
          const { r, g, b } = luces.color;
          colorRGB = `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
      }
  }

  // Objeto de estilo para inyectar la variable CSS --scene-color
  const lightStyle = {
    // Solo inyectamos el color si las luces están ENCENDIDAS
    ...(luces.estado && {'--scene-color': colorRGB}),
  };

  // Clases condicionales
  const chorrosIconClass = `${styles.deviceIcon} ${actions.chorrosAgua ? styles.activeWater : ''}`;
  const lucesIconClass = `${styles.deviceIcon} ${luces.estado ? styles.activeLight : ''}`;
  
  // Estilo del ícono
  const iconStyle = {
    width: '24px',
    height: '24px',
    objectFit: 'contain' 
  };


  return (
    <div className={`${styles.detalleContainer} ${styles.appBackground}`}>
      
      {/* 1. WRAPPER DE NAVEGACIÓN (Botones Volver/Editar) */}
      <div className={styles.detalleNavWrapper}>
        <div className={styles.detalleHeader}>
        
          {/* 🏆 BOTÓN DE VOLVER (Flecha Glassy, reemplaza el div.flecha anterior) */}
          <button className={styles.btnBackNav} onClick={() => navigate('/escenas')}>
            <img src={imgFlecha} alt="Flecha atras" style={iconStyle} />
          </button>
             
          <button className={styles.btnEdit} onClick={handleEdit}>
             Editar
          </button>
        </div>
      </div>
      
      {/* 2. HEADER DINÁMICO (Título de la Escena) */}
      <div className={styles.headerTitleWrapper}>
        <Header nombre={escena.name} />
      </div>

      {/* 3. CONTENEDOR CENTRAL LIMITADO: Contenido principal */}
      <div className={styles.centerWrapper}>

        {/* HERO (Descripción y Botón Activar) */}
        <div className={styles.detalleHero}>
          <p className={styles.detalleDesc}>{escena.descripcion || "Sin descripción disponible."}</p>
          
          <button className={styles.btnBigPlay} onClick={handleExecute}>
            <div className={styles.playIcon}>&#x25B6;</div>
            <span>ACTIVAR AHORA</span>
          </button>
        </div>

        {/* SECCIÓN 1: DISPOSITIVOS (CON SVG y NEÓN CONDICIONAL) */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Dispositivos Configurados</h3>
          
          {/* Fila Chorros */}
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
                {/* 🏆 Aplicamos la clase condicional para Chorros */}
                <div className={chorrosIconClass}>
                    {CHORROS_SVG}
                </div>
                <span className={styles.deviceLabel}>Chorros de agua</span>
            </div>
            
            <span className={`${styles.statusBadge} ${actions.chorrosAgua ? styles.on : styles.off}`}>
              {actions.chorrosAgua ? 'ENCENDIDOS' : 'APAGADOS'}
            </span>
          </div>

          {/* Fila Luces */}
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
                {/* 🏆 Aplicamos la clase condicional y el estilo dinámico para Luces */}
                <div className={lucesIconClass} style={lightStyle}>
                    {LUCES_SVG}
                </div>
                <span className={styles.deviceLabel}>Luces Piscina</span>
            </div>
            
            <div className={styles.lightStatus}>
              {luces.estado && (
                  <div className={styles.colorPreviewDot} style={{backgroundColor: colorRGB}}></div>
              )}
              <span className={`${styles.statusBadge} ${luces.estado ? styles.on : styles.off}`}>
                  {luces.estado ? 'ENCENDIDAS' : 'APAGADAS'}
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DÍAS Y HORARIOS */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Días y Horarios</h3>
          <div className={styles.scheduleRow}>
             
              <div className={styles.scheduleContent}>
                  <strong className={styles.scheduleTitle}>Lunes, Miércoles y Viernes</strong>
                  <p className={styles.scheduleText}>Inicio automático: 19:00 hs</p>
              </div>
          </div>
        </div>

        {/* SECCIÓN 3: HISTORIAL */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Historial de Ejecución</h3>
          <ul className={styles.historyList}>
              <li>
                  <span className={styles.historyDate}>Hoy, 10:30 AM</span>
                  <span className={`${styles.historyType} ${styles.manual}`}>Manual</span>
              </li>
              <li>
                  <span className={`${styles.historyType} ${styles.auto}`}>Automático</span>
              </li>
          </ul>
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