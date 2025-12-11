import React, { useEffect } from "react";
import CardEscena from "./CardEscena.jsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants.js";
import SinEscenas from "./SinEscenas.jsx";

const ListadoEscenas = () => {
  const queryClient = useQueryClient();

  // --- 1. OBTENER DATOS ---
  const { data: escenas, isLoading, error } = useQuery({
    queryKey: ["escenas"],
    queryFn: () => fetch(`${URL_BASE}/escenas.json`).then((res) => res.json()),
    refetchInterval: 30000, // Refresca cada 30s por seguridad
  });

  // --- 2. MUTACIÓN PARA ACTIVAR (AUTOMÁTICA) ---
  const activarEscenaMutation = useMutation({
    mutationFn: (idParaActivar) => {
      const updates = {};
      const historyId = Date.now().toString();
      
      Object.keys(escenas).forEach((key) => {
        if (key === idParaActivar) {
           const prevHistory = escenas[key].history || {};
           updates[key] = {
             ...escenas[key],
             active: true,
             history: { 
                 ...prevHistory, 
                 [historyId]: { date: new Date().toISOString(), type: 'AUTOMATICA' } 
             }
           };
        } else {
           updates[key] = { ...escenas[key], active: false };
        }
      });

      return fetch(`${URL_BASE}/escenas.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escenas"] });
      console.log("¡Escena activada automáticamente!");
    }
  });

  // --- 3. RELOJ AUTOMÁTICO (useEffect) ---
  useEffect(() => {
    if (!escenas) return;

    const revisarHorario = () => {
      const ahora = new Date();
      const diasMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const diaActual = diasMap[ahora.getDay()];
      const horaActual = ahora.getHours().toString().padStart(2, '0') + ":" + 
                         ahora.getMinutes().toString().padStart(2, '0');

      Object.entries(escenas).forEach(([id, datos]) => {
        const programacion = datos.schedule;
        if (programacion?.enabled) {
            if (programacion.time === horaActual && programacion.days?.includes(diaActual)) {
                if (!datos.active) {
                    activarEscenaMutation.mutate(id);
                }
            }
        }
      });
    };

    const intervalo = setInterval(revisarHorario, 10000); // Revisa cada 10s
    return () => clearInterval(intervalo);
  }, [escenas]);


  // --- 4. FUNCIÓN DE CÁLCULO DE TIEMPO (Para el Sort) ---
  const getMinutesUntilNext = (schedule) => {
    if (!schedule?.enabled || !schedule?.days?.length || !schedule?.time) return Infinity;

    const now = new Date();
    const currentDayIndex = now.getDay(); 
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    
    const [h, m] = schedule.time.split(':').map(Number);
    const targetTotalMinutes = h * 60 + m;

    let minDiff = Infinity;

    schedule.days.forEach(dayKey => {
      const targetDayIndex = dayMap[dayKey];
      let dayDiff = (targetDayIndex - currentDayIndex + 7) % 7;

      // Si es hoy pero la hora ya pasó, es para la semana que viene (7 días)
      if (dayDiff === 0 && targetTotalMinutes < currentTotalMinutes) {
         dayDiff = 7; 
      }

      const totalMinutesAway = (dayDiff * 24 * 60) + (targetTotalMinutes - currentTotalMinutes);
      if (totalMinutesAway < minDiff) minDiff = totalMinutesAway;
    });

    return minDiff;
  };

  // --- RENDERIZADO ---
  if (isLoading) return <p style={{textAlign:'center', marginTop: 20}}>Cargando...</p>;
  if (error) return <p style={{textAlign:'center', marginTop: 20}}>Error al cargar las escenas</p>;
  if (!escenas || Object.keys(escenas).length === 0) return <SinEscenas />;

  // --- 5. ORDENAMIENTO FINAL (Activa > Cercanía) ---
  const listaOrdenada = Object.entries(escenas).sort((a, b) => {
    const escenaA = a[1];
    const escenaB = b[1];

    // 1. Prioridad: ¿Está activa?
    if (escenaA.active && !escenaB.active) return -1;
    if (!escenaA.active && escenaB.active) return 1;

    // 2. Prioridad: ¿Cuál está más cerca en el tiempo?
    const timeA = getMinutesUntilNext(escenaA.schedule);
    const timeB = getMinutesUntilNext(escenaB.schedule);

    return timeA - timeB;
  });

  return (
    <div className="escena-list">
      {listaOrdenada.map(([firebaseKey, datosEscena]) => (
        <div key={firebaseKey}>
          <CardEscena id={firebaseKey} escena={datosEscena} />
        </div>
      ))}
    </div>
  );
};

export default ListadoEscenas;