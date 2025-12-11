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

// Función auxiliar para formatear días (completa)
const formatDaysFull = (days) => {
  if (!days || days.length === 0) return "Sin programación";
  const dayMap = {
    mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", 
    fri: "Viernes", sat: "Sábado", sun: "Domingo"
  };
  if (days.length === 7) return "Todos los días";
  return days.map(d => dayMap[d] || d).join(", ");
};

// 🏆 NUEVA FUNCIÓN: Formatea la fecha ISO del historial
const formatHistoryDate = (isoDate) => {
    try {
        const date = new Date(isoDate);
        if (isNaN(date)) return "Fecha inválida";
        
        const day = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        return `${day} - ${time}`;
    } catch (e) {
        return "Fecha desconocida";
    }
};


const Detalle = () => { 
  const { id } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estado local para manejo de modal
  const [showModal, setShowModal] = useState(false); 

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

  // --- MUTACIÓN PARA ACTIVAR ESCENA ---
  const activateMutation = useMutation({
    mutationFn: () => {
      // *NOTA: Aquí debería ir la lógica completa de PUT/PATCH para actualizar 'active' en la base de datos
      // y potencialmente registrar en el historial si no lo hace el backend. 
      // Si la CardEscena ya maneja la lógica completa de PUT/Historial, aquí solo hacemos un PATCH simple:
      return fetch(`${URL_BASE}/escenas/${id}.json`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true })
      }).then(res => {
          if (!res.ok) throw new Error('Error al activar');
          return res.json();
      });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['escena', id] });
        queryClient.invalidateQueries({ queryKey: ['escenas'] });
        setShowModal(true); 
    },
    onError: () => alert("No se pudo activar la escena.")
  });
  
  const handleEdit = () => navigate(`/editar-escena/${id}`);
  
  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta escena?")) deleteMutation.mutate();
  };
  
  const handleExecute = () => {
      if (escena.active) {
          alert("La escena ya está activa. Presiona editar si deseas modificar sus parámetros.");
      } else {
          activateMutation.mutate();
      }
  };


  if (isLoading) return <div className={`${styles.loadingMsg} ${styles.appBackground}`}>Cargando...</div>;
  if (error) return <div className={`${styles.errorMsg} ${styles.appBackground}`}>Error: {error.message}</div>;

  // Lógica de estilos y acciones
  const actions = escena.actions || {};
  const luces = actions.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  const isSceneActive = escena.active === true;
  const diasTexto = formatDaysFull(escena.schedule?.days);
  
  const musica = actions.musica || { estado: false };
  const temperatura = actions.temperatura || { estado: false, grados: 25 };
  const limpieza = actions.limpieza || { estado: false }; 

  // 🏆 LÓGICA DEL HISTORIAL
  const history = escena.history || {};
  const historyList = Object.keys(history)
      .map(key => ({ id: key, ...history[key] }))
      // Ordenar por fecha (más reciente primero)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  // Limitar a los 10 últimos
  // .slice(0, 10);
  
  let colorRGB = "rgb(255, 255, 255)";
  if (luces.color) {
      if (typeof luces.color === 'string') colorRGB = luces.color;
      else {
          const { r, g, b } = luces.color;
          colorRGB = `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
      }
  }

  // Clases dinámicas
  const lightStyle = { ...(luces.estado && {'--scene-color': colorRGB}) };
  const chorrosIconClass = `${styles.deviceIcon} ${actions.chorrosAgua ? styles.activeWater : ''}`;
  const lucesIconClass = `${styles.deviceIcon} ${luces.estado ? styles.activeLight : ''}`;
  const musicaIconClass = `${styles.deviceIcon} ${musica.estado ? styles.activeMusic : ''}`;
  const tempIconClass = `${styles.deviceIcon} ${temperatura.estado ? styles.activeTemp : ''}`;
  const limpiezaIconClass = `${styles.deviceIcon} ${limpieza.estado ? styles.activeClean : ''}`;
  
  const imgIconStyle = { width: '100%', height: '100%', objectFit: 'contain' };
  const iconNavStyle = { width: '24px', height: '24px', objectFit: 'contain' };

  return (
    <div className={`${styles.detalleContainer} ${styles.appBackground}`}>
       <ModalExito
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mensaje={`¡La escena "${escena.name}" ha sido ACTIVADA con éxito!`}
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
        
        <div className={styles.detalleHero} style={lightStyle}>
          <h1 className={styles.detalleTitle}>{escena.name}</h1>
          <p className={styles.detalleDesc}>{escena.descripcion || "Sin descripción."}</p>
          <button 
            className={`${styles.btnBigPlay} ${isSceneActive ? styles.btnBigPlayActive : ''}`} 
            onClick={handleExecute}
            disabled={activateMutation.isPending || deleteMutation.isPending}
          >
            <div className={styles.playIcon}>{isSceneActive ? "■" : "\u25B6"}</div>
            <span>{activateMutation.isPending ? "ACTIVANDO..." : (isSceneActive ? "ESCENA ACTIVA" : "ACTIVAR AHORA")}</span>
          </button>
        </div>

        {/* TARJETAS DE DISPOSITIVOS */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Dispositivos Configurados</h3>
          
          {/* CHORROS DE AGUA */}
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

          {/* LUCES PISCINA */}
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
                  {luces.estado ? `ON (${colorRGB.match(/\d+/g).join(',')})` : 'APAGADAS'}
              </span>
            </div>
          </div>
          
          {/* MÚSICA */}
          {musica.estado !== undefined && (
            <div className={styles.deviceListItem}>
              <div className={styles.deviceIconAndLabel}>
                  <div className={musicaIconClass}>
                      <img src={imgChorros} alt="Música" style={imgIconStyle} /> 
                  </div>
                  <span className={styles.deviceLabel}>Música Ambiente</span>
              </div>
              <span className={`${styles.statusBadge} ${musica.estado ? styles.on : styles.off}`}>
                {musica.estado ? (musica.apiURL ? 'REPRODUCIENDO' : 'ON (Sin URL)') : 'APAGADA'}
              </span>
            </div>
          )}

          {/* TEMPERATURA */}
          {temperatura.estado !== undefined && (
            <div className={styles.deviceListItem}>
              <div className={styles.deviceIconAndLabel}>
                  <div className={tempIconClass}>
                      <img src={imgChorros} alt="Temperatura" style={imgIconStyle} /> 
                  </div>
                  <span className={styles.deviceLabel}>Control de Temperatura</span>
              </div>
              <span className={`${styles.statusBadge} ${temperatura.estado ? styles.on : styles.off}`}>
                {temperatura.estado ? `${temperatura.grados}°C` : 'INACTIVA'}
              </span>
            </div>
          )}

          {/* LIMPIEZA */}
          {limpieza.estado !== undefined && (
            <div className={styles.deviceListItem}>
              <div className={styles.deviceIconAndLabel}>
                  <div className={limpiezaIconClass}>
                      <img src={imgChorros} alt="Limpieza" style={imgIconStyle} /> 
                  </div>
                  <span className={styles.deviceLabel}>Limpieza Programada</span>
              </div>
              <span className={`${styles.statusBadge} ${limpieza.estado ? styles.on : styles.off}`}>
                {limpieza.estado ? 'PROGRAMADA' : 'DETENIDA'}
              </span>
            </div>
          )}

        </div> 

        {/* HORARIOS */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Días y Horarios</h3>
          <div className={styles.scheduleRow}>
              <div className={styles.scheduleContent}>
                  <strong className={styles.scheduleTitle}>Programación Automática:</strong>
                  {escena.schedule?.enabled ? (
                      <>
                          <p className={styles.scheduleText}>
                            **Días:** {diasTexto}
                          </p>
                          <p className={styles.scheduleText}>
                            **Hora:** {escena.schedule.time}
                          </p>
                      </>
                  ) : (
                    <p className={styles.scheduleText}>Apagado automático desactivado.</p>
                  )}
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
                      <div key={entry.id || index} className={styles.historyItem}>
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