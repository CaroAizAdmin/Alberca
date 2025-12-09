import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import styles from './Detalle.module.css';

const Detalle = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- 1. OBTENER DATOS (GET) ---
  const { data: escena, isLoading, error } = useQuery({
    queryKey: ["escena", id],
    queryFn: () =>
      fetch(`${URL_BASE}/escenas/${id}.json`)
        .then((res) => res.json()),
  });

  // --- 2. MUTACIÓN PARA ELIMINAR (DELETE) ---
  const deleteMutation = useMutation({
    mutationFn: () => {
      return fetch(`${URL_BASE}/escenas/${id}.json`, {
        method: 'DELETE',
      })
      .then((response) => {
        if (!response.ok) {
           return Promise.reject("No se pudo eliminar la escena");
        }
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

  // --- HANDLERS ---
  const handleEdit = () => {
    navigate(`/editar-escena/${id}`);
  };
  
  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta escena? No se puede deshacer.")) {
      deleteMutation.mutate();
    }
  };

  const handleExecute = () => {
    alert(`¡Ejecutando escena: ${escena?.name}!`);
  };

  // --- PROTECCIÓN DE DATOS ---
  if (isLoading) return <div className={styles.loadingMsg}>Cargando detalle...</div>;
  if (error || !escena) return <div className={styles.errorMsg}>No se encontró la escena o hubo un error de conexión.</div>;

  // Acceso seguro a los datos
  const actions = escena.actions || {};
  const luces = actions.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  
  // Normalización del color
  let colorRGB = "rgb(255, 255, 255)";
  if (luces.color) {
      if (typeof luces.color === 'string') {
          colorRGB = luces.color;
      } else {
          const { r, g, b } = luces.color;
          colorRGB = `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
      }
  }

  return (
    <div className={styles.detalleContainer}>
      
      {/* HEADER */}
      <div className={styles.detalleHeader}>
        <button className={styles.btnBack} onClick={() => navigate('/escenas')}>
          ← Volver
        </button>
        <button className={styles.btnEdit} onClick={handleEdit}>
          Editar
        </button>
      </div>

      {/* HERO (NOMBRE Y DESCRIPCIÓN) */}
      <div className={styles.detalleHero}>
        <h1>{escena.name}</h1>
        <p className={styles.detalleDesc}>{escena.descripcion || "Sin descripción disponible."}</p>
        
        {/* BOTÓN ACTIVAR */}
        <button className={styles.btnBigPlay} onClick={handleExecute}>
          <div className={styles.playIcon}>▶</div>
          <span>ACTIVAR AHORA</span>
        </button>
      </div>

      {/* SECCIÓN 1: DISPOSITIVOS */}
      <div className={styles.detalleCard}>
        <h3>Dispositivos Configurados</h3>
        
        {/* Fila Chorros */}
        <div className={styles.deviceListItem}>
          <span>🌊 Chorros de agua</span>
          <span className={`${styles.statusBadge} ${actions.chorrosAgua ? styles.on : styles.off}`}>
            {actions.chorrosAgua ? 'ENCENDIDOS' : 'APAGADOS'}
          </span>
        </div>

        {/* Fila Luces */}
        <div className={styles.deviceListItem}>
          <span>💡 Luces Piscina</span>
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
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
        <h3>📅 Días y Horarios</h3>
        <div className={styles.mockDataRow}>
            <span className={styles.icon}>⏰</span>
            <div>
                <strong>Lunes, Miércoles y Viernes</strong>
                <p>Inicio automático: 19:00 hs</p>
            </div>
        </div>
      </div>

      {/* SECCIÓN 3: HISTORIAL */}
      <div className={styles.detalleCard}>
        <h3>📜 Historial de Ejecución</h3>
        <ul className={styles.historyList}>
            <li>
                <span className={styles.historyDate}>Hoy, 10:30 AM</span>
                <span className={`${styles.historyType} ${styles.manual}`}>Manual</span>
            </li>
            <li>
                <span className={styles.historyDate}>Ayer, 07:00 PM</span>
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
  );
};

export default Detalle;