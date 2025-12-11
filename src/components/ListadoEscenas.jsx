import React, { useEffect } from "react";
import CardEscena from "./CardEscena.jsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants.js";
import SinEscenas from "./SinEscenas.jsx";

const ListadoEscenas = () => {
  const queryClient = useQueryClient();

  // --- 1. OBTENER DATOS PARA MOSTRAR ---
  const { data: escenas, isLoading, error } = useQuery({
    queryKey: ["escenas"],
    queryFn: () => fetch(`${URL_BASE}/escenas.json`).then((res) => res.json()),
    refetchInterval: 30000, 
  });

  // --- 2. MUTACIÓN PARA ACTIVAR (AUTOMÁTICA - BLINDADA) ---
  const activarEscenaMutation = useMutation({
    mutationFn: (idParaActivar) => {
      // 🛑 IMPORTANTE: No usamos la variable 'escenas' local, 
      // pedimos una copia FRESCA a Firebase para no cometer errores.
      return fetch(`${URL_BASE}/escenas.json`)
        .then(res => res.json())
        .then(allScenes => {
            const updates = {};
            const historyId = Date.now().toString();
            
            if (allScenes) {
                Object.keys(allScenes).forEach((key) => {
                    const currentScene = allScenes[key];

                    if (key === idParaActivar) {
                        // --- LA ELEGIDA (TRUE) ---
                        const prevHistory = currentScene.history || {};
                        updates[key] = {
                            ...currentScene,
                            active: true, // ACTIVAR
                            history: { 
                                ...prevHistory, 
                                [historyId]: { date: new Date().toISOString(), type: 'AUTOMATICA' } 
                            }
                        };
                    } else {
                        // --- EL RESTO (FALSE) ---
                        updates[key] = { 
                            ...currentScene, 
                            active: false // DESACTIVAR
                        };
                    }
                });
            }

            // Guardamos el lote completo
            return fetch(`${URL_BASE}/escenas.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escenas"] });
      console.log("🤖 Sistema: Escena activada automáticamente y exclusividad aplicada.");
    }
  });

  // --- 3. RELOJ AUTOMÁTICO ---
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
             // Coincide día y hora
            if (programacion.time === horaActual && programacion.days?.includes(diaActual)) {
                // Solo activamos si NO está activa ya (para no spamear la base de datos)
                if (!datos.active) {
                    console.log(`⏰ Ejecutando: ${datos.name}`);
                    activarEscenaMutation.mutate(id);
                }
            }
        }
      });
    };

    const intervalo = setInterval(revisarHorario, 10000); // 10 segundos
    return () => clearInterval(intervalo);
  }, [escenas]);


  // --- 4. ORDENAMIENTO VISUAL ---
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

  // Ordenar: 1. Activa, 2. Cercanía
  const listaOrdenada = Object.entries(escenas).sort((a, b) => {
    const escenaA = a[1];
    const escenaB = b[1];

    if (escenaA.active && !escenaB.active) return -1;
    if (!escenaA.active && escenaB.active) return 1;

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