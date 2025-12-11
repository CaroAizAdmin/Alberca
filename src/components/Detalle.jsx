import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import styles from './Detalle.module.css'; 
import imgFlecha from '../assets/imagenes/flechaAtras.png';
import imgChorros from '../assets/imagenes/chorros.png'; // Usado también como placeholder
import imgLuces from '../assets/imagenes/luces.png';
// 🏆 IMPORTACIONES NECESARIAS (Descomentar al tener los archivos)
// import imgMusica from '../assets/imagenes/musica.png';
// import imgTemperatura from '../assets/imagenes/temperatura.png';
// import imgLimpieza from '../assets/imagenes/limpieza.png'; 
import { useTitulo } from '../hooks/useTitulo'; 

const Detalle = () => { 
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

  // Lógica de estilos y acciones
  const actions = escena.actions || {};
  
  // 🏆 LÓGICA DE ESTADO PARA TODOS LOS DISPOSITIVOS
  const luces = actions.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  const musica = actions.musica || { estado: false };
  const temperatura = actions.temperatura || { estado: false };
  const limpieza = actions.limpieza || { estado: false }; // Asumiendo que limpieza tiene un estado booleano
  
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
  // 🏆 NUEVAS CLASES DINÁMICAS
  const musicaIconClass = `${styles.deviceIcon} ${musica.estado ? styles.activeMusic : ''}`;
  const tempIconClass = `${styles.deviceIcon} ${temperatura.estado ? styles.activeTemp : ''}`;
  const limpiezaIconClass = `${styles.deviceIcon} ${limpieza.estado ? styles.activeClean : ''}`;
  
  const imgIconStyle = { width: '100%', height: '100%', objectFit: 'contain' };
  const iconNavStyle = { width: '24px', height: '24px', objectFit: 'contain' };

  return (
    <div className={`${styles.detalleContainer} ${styles.appBackground}`}>
      
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
                  {luces.estado ? 'ENCENDIDAS' : 'APAGADAS'}
              </span>
            </div>
          </div>
          
          {/* 🏆 MÚSICA */}
          {musica.estado !== undefined && (
            <div className={styles.deviceListItem}>
              <div className={styles.deviceIconAndLabel}>
                  {/* Usamos imgChorros como placeholder si no tienes imgMusica importado */}
                  <div className={musicaIconClass}>
                      <img src={imgChorros} alt="Música" style={imgIconStyle} /> 
                  </div>
                  <span className={styles.deviceLabel}>Música Ambiente</span>
              </div>
              <span className={`${styles.statusBadge} ${musica.estado ? styles.on : styles.off}`}>
                {musica.estado ? 'REPRODUCIENDO' : 'APAGADA'}
              </span>
            </div>
          )}

          {/* 🏆 TEMPERATURA */}
          {temperatura.estado !== undefined && (
            <div className={styles.deviceListItem}>
              <div className={styles.deviceIconAndLabel}>
                  {/* Usamos imgChorros como placeholder si no tienes imgTemperatura importado */}
                  <div className={tempIconClass}>
                      <img src={imgChorros} alt="Temperatura" style={imgIconStyle} /> 
                  </div>
                  <span className={styles.deviceLabel}>Temperatura</span>
              </div>
              <span className={`${styles.statusBadge} ${temperatura.estado ? styles.on : styles.off}`}>
                {temperatura.estado ? 'ACTIVA' : 'INACTIVA'}
              </span>
            </div>
          )}

          {/* 🏆 LIMPIEZA */}
          {limpieza.estado !== undefined && (
            <div className={styles.deviceListItem}>
              <div className={styles.deviceIconAndLabel}>
                  {/* Usamos imgChorros como placeholder si no tienes imgLimpieza importado */}
                  <div className={limpiezaIconClass}>
                      <img src={imgChorros} alt="Limpieza" style={imgIconStyle} /> 
                  </div>
                  <span className={styles.deviceLabel}>Limpieza</span>
              </div>
              <span className={`${styles.statusBadge} ${limpieza.estado ? styles.on : styles.off}`}>
                {limpieza.estado ? 'EN PROGRESO' : 'DETENIDA'}
              </span>
            </div>
          )}

        </div> {/* CIERRE CORRECTO: detalleCard */}

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

      </div> {/* CIERRE CORRECTO: centerWrapper */}
    </div>
  );
};

export default Detalle;