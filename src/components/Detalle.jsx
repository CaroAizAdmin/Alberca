import React, { useState } from 'react'; // 1. Importar useState
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import styles from './Detalle.module.css'; 
import imgFlecha from '../assets/imagenes/flechaAtras.png';
import imgChorros from '../assets/imagenes/chorros.png'; 
import imgLuces from '../assets/imagenes/luces.png';
import { useTitulo } from '../hooks/useTitulo'; 
import ModalExito from './ModalExito'; // 2. Importar Modal

const Detalle = () => { 
  const { id } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false); // 3. Estado del Modal

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

  // TÍTULO DINÁMICO
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
      // Aquí podrías usar otro modal si quisieras, pero el alert nativo está bien para avisar antes de redirigir
      alert("Escena eliminada correctamente"); 
      navigate('/escenas'); 
    },
    onError: () => alert("Hubo un error al intentar eliminar.")
  });

  const handleEdit = () => navigate(`/editar-escena/${id}`);
  
  const handleDelete = () => {
    if (window.confirm("¿Eliminar escena?")) deleteMutation.mutate();
  };

  // 🏆 EJECUCIÓN CON MODAL
  const handleExecute = () => {
      // Aquí iría tu lógica real
      setShowModal(true);
  };

  if (isLoading) return <div className={`${styles.loadingMsg} ${styles.appBackground}`}>Cargando...</div>;
  if (error) return <div className={`${styles.errorMsg} ${styles.appBackground}`}>Error: {error.message}</div>;

  // Lógica de estilos
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
  
  const imgIconStyle = { width: '100%', height: '100%', objectFit: 'contain' };
  const iconNavStyle = { width: '24px', height: '24px', objectFit: 'contain' };

  return (
    <div className={`${styles.detalleContainer} ${styles.appBackground}`}>
      
      {/* 4. RENDERIZAR MODAL */}
      <ModalExito 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        mensaje={`La escena "${escena.name}" se está ejecutando.`}
      />

      {/* 1. NAVEGACIÓN */}
      <div className={styles.detalleNavWrapper}>
        <div className={styles.detalleHeader}>
          <button className={styles.btnBackNav} onClick={() => navigate('/escenas')}>
            <img src={imgFlecha} alt="Atrás" style={iconNavStyle} />
          </button>
          <button className={styles.btnEdit} onClick={handleEdit}>
             Editar
          </button>
        </div>
      </div>
      
      {/* 2. CONTENEDOR CENTRAL */}
      <div className={styles.centerWrapper}>

        <div className={styles.detalleHero}>
          <p className={styles.detalleDesc}>{escena.descripcion || "Sin descripción."}</p>
          <button className={styles.btnBigPlay} onClick={handleExecute}>
            <div className={styles.playIcon}>&#x25B6;</div>
            <span>ACTIVAR AHORA</span>
          </button>
        </div>

        {/* TARJETAS DE DISPOSITIVOS */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Dispositivos Configurados</h3>
          
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
                <div className={chorrosIconClass}>
                    <img src={imgChorros} alt="Chorros" style={imgIconStyle} />
                </div>
                <span className={styles.deviceLabel}>Chorros de agua</span>
            </div>
            <span className={`${styles.statusBadge} ${actions.chorrosAgua ? styles.on : styles.off}`}>
              {actions.chorrosAgua ? 'ENCENDIDOS' : 'APAGADOS'}
            </span>
          </div>

          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
                <div className={lucesIconClass} style={lightStyle}>
                    <img src={imgLuces} alt="Luces" style={imgIconStyle} />
                </div>
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