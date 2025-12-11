import React, { useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import styles from './Detalle.module.css'; 
import imgFlecha from '../assets/imagenes/flechaAtras.png';
import imgChorros from '../assets/imagenes/chorros.png'; 
import imgLuces from '../assets/imagenes/luces.png';
import { useTitulo } from '../hooks/useTitulo'; 
import ModalExito from './ModalExito'; 

// Función para traducir días
const formatDaysFull = (days) => {
  if (!days || days.length === 0) return "No programado";
  const dayMap = {
    mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", 
    fri: "Viernes", sat: "Sábado", sun: "Domingo"
  };
  return days.map(d => dayMap[d] || d).join(', ');
};

// Función para formatear fecha y hora del historial
const formatHistoryDate = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

const Detalle = () => { 
  const { id } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // --- 1. GET DATA ---
  const { data: escena, isLoading, error } = useQuery({
    queryKey: ["escena", id],
    queryFn: () => {
      return fetch(`${URL_BASE}/escenas/${id}.json`)
        .then(res => {
          if (!res.ok) throw new Error('Error de conexión.');
          return res.json();
        })
        .then(data => {
          if (!data) throw new Error('La escena no existe.');
          return data;
        });
    },
  });

  useTitulo(escena ? escena.name : "Cargando escena...");

  // --- 2. ACTIVAR + REGISTRAR HISTORIAL (MANUAL) ---
  const activateMutation = useMutation({
    mutationFn: () => {
      return fetch(`${URL_BASE}/escenas.json`)
        .then(res => res.json())
        .then(allScenes => {
          const updates = {};
          
          // Creamos el registro de historial
          const newHistoryEntry = {
              date: new Date().toISOString(),
              type: 'MANUAL' // Marcamos que fue activado por el usuario
          };
          // ID único para el historial (timestamp)
          const historyId = Date.now().toString();

          if (allScenes) {
            Object.keys(allScenes).forEach(key => {
              if (key === id) {
                // Si es la escena elegida: ACTIVAR + AGREGAR HISTORIAL
                const prevHistory = allScenes[key].history || {};
                updates[key] = {
                  ...allScenes[key],
                  active: true,
                  history: {
                      ...prevHistory,
                      [historyId]: newHistoryEntry
                  }
                };
              } else {
                // Si no es la elegida: DESACTIVAR (sin tocar su historial)
                updates[key] = {
                  ...allScenes[key],
                  active: false
                };
              }
            });
          }
          
          return fetch(`${URL_BASE}/escenas.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
        })
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
      queryClient.invalidateQueries({ queryKey: ['escena', id] });
      setShowModal(true);
    },
    onError: (err) => alert("Error al activar: " + err)
  });

  // --- DELETE ---
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
  const handleDelete = () => { if (window.confirm("¿Eliminar escena?")) deleteMutation.mutate(); };
  const handleExecute = () => { activateMutation.mutate(); };

  if (isLoading) return <div className={`${styles.loadingMsg} ${styles.appBackground}`}>Cargando...</div>;
  if (error) return <div className={`${styles.errorMsg} ${styles.appBackground}`}>Error: {error.message}</div>;

  // --- PREPARACIÓN VISUAL ---
  const actions = escena.actions || {};
  const luces = actions.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  const isSceneActive = escena.active === true;
  const diasTexto = formatDaysFull(escena.schedule?.days);

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
  
  // 🏆 PROCESAR HISTORIAL PARA LA LISTA
  // Convertimos objeto { id: {data}, id2: {data} } a array ordenado (más reciente primero)
  const historyList = escena.history 
      ? Object.values(escena.history).sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

  return (
    <div className={`${styles.detalleContainer} ${styles.appBackground}`}>
      
      <ModalExito 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        mensaje={`La escena "${escena.name}" activada y registrada en historial.`}
      />

      <div className={styles.detalleNavWrapper}>
        <div className={styles.detalleHeader}>
          <button className={styles.btnBackNav} onClick={() => navigate('/escenas')}>
            <img src={imgFlecha} alt="Atrás" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          </button>
          <button className={styles.btnEdit} onClick={handleEdit}>Editar</button>
        </div>
      </div>
      
      <div className={styles.centerWrapper}>

        {/* HERO */}
        <div className={styles.detalleHero}>
          <p className={styles.detalleDesc}>{escena.descripcion || "Sin descripción."}</p>
          <button 
            className={`${styles.btnBigPlay} ${isSceneActive ? styles.btnBigPlayActive : ''}`} 
            onClick={handleExecute}
            disabled={activateMutation.isPending}
          >
            <div className={styles.playIcon}>{isSceneActive ? "■" : "\u25B6"}</div>
            <span>{isSceneActive ? "ESCENA ACTIVA" : "ACTIVAR AHORA"}</span>
          </button>
        </div>

        {/* DISPOSITIVOS */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Dispositivos Configurados</h3>
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
                <div className={chorrosIconClass}>
                    <img src={imgChorros} alt="Chorros" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                    <img src={imgLuces} alt="Luces" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                        ? `Días: ${diasTexto} - ${escena.schedule.time}` 
                        : "Apagado automático desactivado"}
                  </p>
              </div>
          </div>
        </div>

        {/* 🏆 NUEVA CARD: HISTORIAL DE EJECUCIONES */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Historial de Ejecuciones</h3>
          {historyList.length === 0 ? (
              <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', textAlign: 'center'}}>
                  Sin registros recientes.
              </p>
          ) : (
              <div className={styles.historyListContainer}>
                  {historyList.map((entry, index) => (
                      <div key={index} className={styles.historyItem}>
                          <span className={styles.historyDate}>
                              {formatHistoryDate(entry.date)}
                          </span>
                          {/* Detecta si es manual o auto para el color de la etiqueta */}
                          <span className={`${styles.tagType} ${entry.type === 'MANUAL' ? styles.tagManual : styles.tagAuto}`}>
                              {entry.type === 'MANUAL' ? 'Manual' : 'Automática'}
                          </span>
                      </div>
                  ))}
              </div>
          )}
        </div>

        {/* DANGER ZONE */}
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