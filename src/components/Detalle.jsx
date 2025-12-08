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

  // --- PROTECCIÓN DE DATOS (Evitar 'undefined') ---
  if (isLoading) return <div className="loading-msg">Cargando detalle...</div>;
  if (error || !escena) return <div className="error-msg">No se encontró la escena o hubo un error de conexión.</div>;

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
    <div className="detalle-container">
      
      {/* HEADER */}
      <div className="detalle-header">
        <button className="btn-back" onClick={() => navigate('/escenas')}>
          ← Volver
        </button>
        <button className="btn-edit" onClick={handleEdit}>
          Editar
        </button>
      </div>

      {/* HERO (NOMBRE Y DESCRIPCIÓN) */}
      <div className="detalle-hero">
        <h1>{escena.name}</h1>
        <p className="detalle-desc">{escena.descripcion || "Sin descripción disponible."}</p>
        
        {/* BOTÓN ACTIVAR */}
        <button className="btn-big-play" onClick={handleExecute}>
          <div className="play-icon">▶</div>
          <span>ACTIVAR AHORA</span>
        </button>
      </div>

      {/* SECCIÓN 1: DISPOSITIVOS */}
      <div className="detalle-card">
        <h3>Dispositivos Configurados</h3>
        
        {/* Fila Chorros */}
        <div className="device-list-item">
          <span>🌊 Chorros de agua</span>
          <span className={`status-badge ${actions.chorrosAgua ? 'on' : 'off'}`}>
            {actions.chorrosAgua ? 'ENCENDIDOS' : 'APAGADOS'}
          </span>
        </div>

        {/* Fila Luces */}
        <div className="device-list-item">
          <span>💡 Luces Piscina</span>
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
             {luces.estado && (
                 <div className="color-preview-dot" style={{backgroundColor: colorRGB}}></div>
             )}
             <span className={`status-badge ${luces.estado ? 'on' : 'off'}`}>
                {luces.estado ? 'ENCENDIDAS' : 'APAGADAS'}
             </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: MOCK DATA (Para cumplir con el diseño) */}
      <div className="detalle-card">
        <h3>📅 Días y Horarios</h3>
        <div className="mock-data-row">
            <span className="icon">⏰</span>
            <div>
                <strong>Lunes, Miércoles y Viernes</strong>
                <p>Inicio automático: 19:00 hs</p>
            </div>
        </div>
      </div>

      {/* SECCIÓN 3: MOCK DATA (Historial) */}
      <div className="detalle-card">
        <h3>📜 Historial de Ejecución</h3>
        <ul className="history-list">
            <li>
                <span className="history-date">Hoy, 10:30 AM</span>
                <span className="history-type manual">Manual</span>
            </li>
            <li>
                <span className="history-date">Ayer, 07:00 PM</span>
                <span className="history-type auto">Automático</span>
            </li>
        </ul>
      </div>

      {/* ZONA DE PELIGRO (ELIMINAR) */}
      <div className="danger-zone">
        <button 
            className="btn-delete" 
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