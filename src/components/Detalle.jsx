// src/components/Detalle.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import styles from './Detalle.module.css'; // Importa el CSS del detalle para usar flechaBlanca
import imgFlecha from '../assets/imagenes/flechaAtras.png';
import imgChorros from '../assets/imagenes/chorros.png';
import imgLuces from '../assets/imagenes/luces.png';
import imgLimpieza from '../assets/imagenes/limpieza.png';
import imgMusica from '../assets/imagenes/musica.png';
import imgTemperatura from '../assets/imagenes/temperatura.png';
import { useTitulo } from '../hooks/useTitulo';

// MODALES
import ModalExito from './ModalExito';
import ModalConfirmacion from './ModalConfirmacion';
import ModalError from './ModalError';
import Botones from './BotonesGenerales/Botones/Botones'; 

// Función auxiliar para formatear días
const formatDaysFull = (days) => {
  if (!days || days.length === 0) return "Sin programación";
  const dayMap = {
    mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves",
    fri: "Viernes", sat: "Sábado", sun: "Domingo"
  };
  if (days.length === 7) return "Todos los días";
  return days.map(d => dayMap[d] || d).join(", ");
};

// Formatea la fecha ISO del historial
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

  // Subir el scroll al inicio al montar el componente.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- ESTADOS DE MODALES ---
  const [showModalExito, setShowModalExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const [showModalStop, setShowModalStop] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);

  const [showModalError, setShowModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const [redirectOnClose, setRedirectOnClose] = useState(false);

  // --- GET DATA ---
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

  const pageTitle = escena ? "Detalle de:" : "Cargando detalle...";
  useTitulo(pageTitle);

  // --- MUTACIONES (Definiciones simuladas - asumiendo que la lógica real existe) ---
  const deleteMutation = useMutation({
    mutationFn: async () => { /* Lógica de eliminación */ },
    onSuccess: () => {
      setMensajeExito("Escena eliminada correctamente.");
      setRedirectOnClose(true);
      setShowModalDelete(false);
      setShowModalExito(true);
      queryClient.invalidateQueries({ queryKey: ['escenas'] });
    },
    onError: () => {
      setMensajeError("Error al eliminar la escena.");
      setShowModalError(true);
    }
  });

  const activateMutation = useMutation({
    mutationFn: async () => { /* Lógica de activación */ },
    onSuccess: () => {
      setMensajeExito("Escena activada correctamente.");
      setShowModalExito(true);
      queryClient.invalidateQueries({ queryKey: ['escena', id] });
    },
    onError: () => {
      setMensajeError("Error al activar la escena.");
      setShowModalError(true);
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => { /* Lógica de desactivación */ },
    onSuccess: () => {
      setShowModalStop(false);
      setMensajeExito("Escena detenida correctamente.");
      setShowModalExito(true);
      queryClient.invalidateQueries({ queryKey: ['escena', id] });
    },
    onError: () => {
      setShowModalStop(false);
      setMensajeError("Error al detener la escena.");
      setShowModalError(true);
    }
  });

  // --- HANDLERS ---
  const handleEdit = () => navigate(`/editar-escena/${id}`);
  const handleDelete = () => { setShowModalDelete(true); };
  const confirmDelete = () => { deleteMutation.mutate(); };
  const handleExecute = () => { if (escena.active) setShowModalStop(true); else activateMutation.mutate(); };
  const handleCloseExito = () => {
    setShowModalExito(false);
    if (redirectOnClose) {
      navigate('/escenas');
    }
  };

  if (isLoading) return <div className={`${styles.loadingMsg} ${styles.appBackground}`}>Cargando...</div>;
  if (error) return <div className={`${styles.errorMsg} ${styles.appBackground}`}>Error de conexión</div>;

  // 🟢 PREPARACIÓN DATOS VISUALES 
  const actions = escena.actions || {};
  const luces = actions.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  const chorrosOn = actions.chorrosAgua === true;

  // Normalización de Música/Limpieza (booleano simple o en objeto)
  const musica = { estado: actions.musica === true || actions.musica?.estado === true };

  let temperatura = { estado: false, grados: 25 };
  if (actions.temperatura) {
    temperatura = {
      estado: actions.temperatura.estado || false,
      grados: actions.temperatura.grados || 25
    };
  }

  const limpieza = { estado: actions.limpieza === true || actions.limpieza?.estado === true };

  const isSceneActive = escena.active === true;
  const diasTexto = formatDaysFull(escena.schedule?.days);

  const history = escena.history || {};
  const historyList = Object.keys(history)
    .map(key => ({ id: key, ...history[key] }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let colorRGB = "rgb(255, 255, 255)";
  if (luces.color) {
    if (typeof luces.color === 'string') colorRGB = luces.color;
    else {
      const { r, g, b } = luces.color;
      colorRGB = `rgb(${r || 0}, ${g || 0}, ${b || 0})`;
    }
  }

  const lightStyle = { ...(luces.estado && { '--scene-color': colorRGB }) };
  // Clases dinámicas
  const chorrosIconClass = `${styles.deviceIcon} ${chorrosOn ? styles.activeWater : ''}`;
  const lucesIconClass = `${styles.deviceIcon} ${luces.estado ? styles.activeLight : ''}`;
  const musicaIconClass = `${styles.deviceIcon} ${musica.estado ? styles.activeMusic : ''}`;
  const tempIconClass = `${styles.deviceIcon} ${temperatura.estado ? styles.activeTemp : ''}`;
  const limpiezaIconClass = `${styles.deviceIcon} ${limpieza.estado ? styles.activeClean : ''}`;

  const imgIconStyle = { width: '100%', height: '100%', objectFit: 'contain' };
  
  return (
    <div className={`${styles.detalleContainer} ${styles.appBackground}`}>

      {/* --- ZONA DE MODALES --- */}
      <ModalExito
        isOpen={showModalExito}
        onClose={handleCloseExito}
        mensaje={mensajeExito}
      />
      <ModalError
        isOpen={showModalError}
        onClose={() => setShowModalError(false)}
        mensaje={mensajeError}
      />
      <ModalConfirmacion
        isOpen={showModalStop}
        onClose={() => setShowModalStop(false)}
        onConfirm={() => deactivateMutation.mutate()}
        titulo="¿Apagar Escena?"
        mensaje={`La escena "${escena.name}" está en ejecución. ¿Deseas detenerla?`}
        textoBotonConfirmar="Sí, detener"
      />
      <ModalConfirmacion
        isOpen={showModalDelete}
        onClose={() => setShowModalDelete(false)}
        onConfirm={confirmDelete}
        titulo="¿Eliminar Escena?"
        mensaje="Esta acción no se puede deshacer. ¿Estás seguro de eliminarla permanentemente?"
        textoBotonConfirmar="Eliminar"
      />

      {/* HEADER NAV */}
      <div className={styles.detalleNavWrapper}>
        <div className={styles.detalleHeader}>
          
          {/* BOTÓN ATRÁS (CLAVE: variant="nav-icon" y clase flechaBlanca) */}
          <Botones onClick={() => navigate('/')} variant="nav-icon">
            <img 
              src={imgFlecha} 
              alt="Atrás" 
              className={styles.flechaBlanca} // Aplica el filtro CSS aquí
            />
          </Botones>

          {/* BOTÓN EDITAR (CLAVE: variant="nav-icon". El texto es blanco por CSS) */}
          <Botones onClick={handleEdit} variant="nav-icon">
            Editar
          </Botones>
        </div>
      </div>

      <div className={styles.centerWrapper}>

        <div className={styles.detalleHero} style={lightStyle}>
          <h1 className={styles.detalleTitle}>{escena.name}</h1>
          <p className={styles.detalleDesc}>{escena.descripcion || "Sin descripción."}</p>

          {/* BOTÓN ACTIVAR AHORA (CLAVE: variant="success" para el VERDE) */}
          <Botones
            variant="success" 
            isActive={isSceneActive}
            onClick={handleExecute}
            disabled={activateMutation.isPending || deleteMutation.isPending || deactivateMutation.isPending}
          >
            <div className={styles.playIcon}>{isSceneActive ? "■" : "\u25B6"}</div>
            <span>{activateMutation.isPending ? "ACTIVANDO..." : (isSceneActive ? "ESCENA ACTIVA" : "ACTIVAR AHORA")}</span>
          </Botones>
        </div>

        {/* DISPOSITIVOS */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Dispositivos Configurados</h3>

          {/* LUCES */}
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
              <div className={lucesIconClass} style={lightStyle}>
                <img src={imgLuces} alt="Luces" style={imgIconStyle} />
              </div>
              <span className={styles.deviceLabel}>Luces Piscina</span>
            </div>
            <div className={styles.lightStatus}>
              {luces.estado && <div className={styles.colorPreviewDot} style={{ backgroundColor: colorRGB }}></div>}
              <span className={`${styles.statusBadge} ${luces.estado ? styles.on : styles.off}`}>
                {luces.estado ? 'ENCENDIDAS' : 'APAGADAS'}
              </span>
            </div>
          </div>

          {/* CHORROS */}
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
              <div className={chorrosIconClass}>
                <img src={imgChorros} alt="Chorros" style={imgIconStyle} />
              </div>
              <span className={styles.deviceLabel}>Chorros de Agua</span>
            </div>
            <span className={`${styles.statusBadge} ${chorrosOn ? styles.on : styles.off}`}>
              {chorrosOn ? 'ACTIVADOS' : 'APAGADOS'}
            </span>
          </div>

          {/* MÚSICA */}
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
              <div className={musicaIconClass}>
                <img src={imgMusica} alt="Música" style={imgIconStyle} />
              </div>
              <span className={styles.deviceLabel}>Música</span>
            </div>
            <span className={`${styles.statusBadge} ${musica.estado ? styles.on : styles.off}`}>
              {musica.estado ? 'ON' : 'OFF'}
            </span>
          </div>
          
          {/* TEMPERATURA */}
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
              <div className={tempIconClass}>
                <img src={imgTemperatura} alt="Temperatura" style={imgIconStyle} />
              </div>
              <span className={styles.deviceLabel}>Temperatura</span>
            </div>
            <span className={`${styles.statusBadge} ${temperatura.estado ? styles.on : styles.off}`}>
              {temperatura.estado ? `${temperatura.grados}°C` : 'APAGADA'}
            </span>
          </div>

          {/* LIMPIEZA */}
          <div className={styles.deviceListItem}>
            <div className={styles.deviceIconAndLabel}>
              <div className={limpiezaIconClass}>
                <img src={imgLimpieza} alt="Limpieza" style={imgIconStyle} />
              </div>
              <span className={styles.deviceLabel}>Limpieza</span>
            </div>
            <span className={`${styles.statusBadge} ${limpieza.estado ? styles.on : styles.off}`}>
              {limpieza.estado ? 'EN CURSO' : 'INACTIVA'}
            </span>
          </div>

        </div> {/* Cierre de div.detalleCard DISPOSITIVOS */}

        {/* HORARIOS */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Días y Horarios</h3>
          <div className={styles.scheduleRow}>
            <div className={styles.scheduleContent}>
              <strong className={styles.scheduleTitle}>Programación Automática:</strong>
              {escena.schedule?.enabled ? (
                <>
                  <p className={styles.scheduleText}>Días: {diasTexto}</p>
                  <p className={styles.scheduleText}>Hora: {escena.schedule.time}</p>
                </>
              ) : (
                <p className={styles.scheduleText}>Apagado automático desactivado.</p>
              )}
            </div>
          </div>
        </div>

        {/* HISTORIAL */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Historial de Ejecuciones</h3>
          {historyList.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', textAlign: 'center' }}>
              Sin registros recientes.
            </p>
          ) : (
            <div className={styles.historyListContainer}>
              {historyList.map((entry, index) => (
                <div key={entry.id || index} className={styles.historyItem}>
                  <span className={styles.historyDate}>
                    {formatHistoryDate(entry.date)}
                  </span>
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
          {/* BOTÓN ELIMINAR (Componente Botones, variant="delete") */}
          <Botones
            variant="delete"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar Escena"}
          </Botones>
        </div>

      </div> {/* Cierre de div.centerWrapper */}
    </div> 
  ); 
}; 

export default Detalle;