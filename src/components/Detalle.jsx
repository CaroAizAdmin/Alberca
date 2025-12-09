import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import './Detalle.css'; 

const Detalle = () => {
  // 'id' aquí ES la Key de Firebase (ej: "-OfwGFg...") que viene de la URL
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

  // --- 2. MUTACIÓN PARA ELIMINAR (DELETE) - SIN ASYNC ---
  const deleteMutation = useMutation({
    mutationFn: () => {
      // Usamos return fetch... y .then()
      return fetch(`${URL_BASE}/escenas/${id}.json`, {
        method: 'DELETE',
      })
      .then((response) => {
        if (!response.ok) {
           // Usamos Promise.reject para manejar el error sin throw
           return Promise.reject("No se pudo eliminar la escena");
        }
        return response.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escenas'] }); // Recargar lista
      alert("Escena eliminada correctamente");
      navigate('/escenas'); // Volver al listado
    },
    onError: () => {
      alert("Hubo un error al intentar eliminar.");
    }
  });

  // --- HANDLERS ---
  const handleEdit = () => {
    // Navegamos usando la Key (id)
    navigate(`/editar-escena/${id}`);
  };
  
  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta escena? No se puede deshacer.")) {
      deleteMutation.mutate();
    }
  };

  const handleExecute = () => {
    // Aquí iría la lógica para enviar la orden al hardware
    alert(`¡Ejecutando escena: ${escena?.name}!`);
  };

  // --- PROTECCIÓN DE DATOS ---
  if (isLoading) return <div className={`${styles.loadingMsg} ${styles.appBackground}`}>Cargando detalle...</div>;
  if (error || !escena) return <div className={`${styles.errorMsg} ${styles.appBackground}`}>No se encontró la escena o hubo un error de conexión.</div>;

  // Acceso seguro a los datos (por si faltan propiedades en el JSON)
  const actions = escena.actions || {};
  const luces = actions.luces || { estado: false, color: { r: 255, g: 255, b: 255 } };
  
  // Normalización del color (Manejamos si viene como string o como objeto)
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
    <div className={`${styles.detalleContainer} ${styles.appBackground}`}>
      
      {/* CONTENEDOR CENTRAL LIMITADO */}
      <div className={styles.centerWrapper}>

        {/* HEADER */}
        <div className={styles.detalleHeader}>
          <button className={styles.btnBack} onClick={() => navigate('/escenas')}>
            <span className={styles.iconBack}>&#x2190;</span> Volver
          </button>
          <button className={styles.btnEdit} onClick={handleEdit}>
            <span className={styles.iconEdit}>&#x2699;</span> Editar
          </button>
        </div>

        {/* HERO (NOMBRE Y DESCRIPCIÓN) */}
        <div className={styles.detalleHero}>
          <h1>{escena.name}</h1>
          <p className={styles.detalleDesc}>{escena.descripcion || "Sin descripción disponible."}</p>
          
          {/* BOTÓN ACTIVAR */}
          <button className={styles.btnBigPlay} onClick={handleExecute}>
            <div className={styles.playIcon}>&#x25B6;</div>
            <span>ACTIVAR AHORA</span>
          </button>
        </div>

        {/* SECCIÓN 1: DISPOSITIVOS */}
        <div className={styles.detalleCard}>
          <h3 className={styles.cardTitle}>Dispositivos Configurados</h3>
          
          {/* Fila Chorros */}
          <div className={styles.deviceListItem}>
            <span className={styles.deviceLabel}>Chorros de agua</span>
            <span className={`${styles.statusBadge} ${actions.chorrosAgua ? styles.on : styles.off}`}>
              {actions.chorrosAgua ? 'ENCENDIDOS' : 'APAGADOS'}
            </span>
          </div>

          {/* Fila Luces */}
          <div className={styles.deviceListItem}>
            <span className={styles.deviceLabel}>Luces Piscina</span>
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
              <span className={styles.scheduleIcon}>&#x23F0;</span>
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

      </div> {/* FIN centerWrapper */}
    </div>
  );
};

export default Detalle;