import React, { useEffect, useState } from "react"; 
import CardEscena from "./CardEscena.jsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// 🏆 Importamos URL_BASE (y podrías importar DAYS_OF_WEEK si fuera necesario, pero la lógica solo necesita las claves)
import { URL_BASE } from "../assets/constants/constants.js"; 
import SinEscenas from "./SinEscenas.jsx";
import ModalError from './ModalError'; 

// 🏆 PUENTE NECESARIO: Mapea el índice fijo de JavaScript (0=Dom, 1=Lun...) a tus claves.
// Índice: [0,   1,    2,    3,    4,    5,    6   ]
// Día:    [Dom, Lun,  Mar,  Mié,  Jue,  Vie,  Sáb ]
const JS_TO_CUSTOM_DAY_MAP = ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sa'];


const ListadoEscenas = () => {
  const queryClient = useQueryClient();
  const [showModalError, setShowModalError] = useState(false); 

  // --- 1. OBTENER DATOS PARA MOSTRAR ---
  const { data: escenas, isLoading, error } = useQuery({
    queryKey: ["escenas"],
    queryFn: () => fetch(`${URL_BASE}/escenas.json`).then((res) => res.json()),
    refetchInterval: 30000, 
  });

  // --- 2. MUTACIÓN PARA ACTIVAR (AUTOMÁTICA - LÓGICA MUTEX) ---
  const activarEscenaMutation = useMutation({
    mutationFn: (idParaActivar) => {
      return fetch(`${URL_BASE}/escenas.json`)
        .then(res => res.json())
        .then(allScenes => {
            const updates = {};
            const historyId = Date.now().toString();
            
            if (allScenes) {
                Object.keys(allScenes).forEach((key) => {
                    const currentScene = allScenes[key];
                    if (key === idParaActivar) {
                        const prevHistory = currentScene.history || {};
                        updates[key] = {
                            ...currentScene,
                            active: true, 
                            history: { 
                                ...prevHistory, 
                                [historyId]: { date: new Date().toISOString(), type: 'AUTOMATICA' } 
                            }
                        };
                    } else {
                        updates[key] = { 
                            ...currentScene, 
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
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escenas"] });
      console.log("🤖 Sistema: Escena activada automáticamente.");
    },
    onError: () => {
        setShowModalError(true); 
    }
  });

  // --- 3. RELOJ AUTOMÁTICO (Scheduler) ---
  useEffect(() => {
    if (!escenas) return;

    const revisarHorario = () => {
      const ahora = new Date();
      
      // 🏆 USO DE LA CONSTANTE PUENTE: Obtenemos la clave de día 'lu', 'ma', etc.
      const diaActual = JS_TO_CUSTOM_DAY_MAP[ahora.getDay()];
      
      // Formato HH:MM (e.g., "14:05")
      const horaActual = ahora.getHours().toString().padStart(2, '0') + ":" + 
                         ahora.getMinutes().toString().padStart(2, '0');

      Object.entries(escenas).forEach(([id, datos]) => {
        const programacion = datos.schedule;
        
        // La condición de activación más estricta
        if (programacion?.enabled && 
            programacion.time === horaActual && 
            programacion.days?.includes(diaActual)) 
        {
            // Evita múltiples activaciones en el mismo minuto
            if (!datos.active) {
                console.log(`⏰ HORA DE EJECUTAR: ${datos.name}`);
                activarEscenaMutation.mutate(id);
            }
        }
      });
    };

    // Revisa el horario cada 10 segundos
    const intervalo = setInterval(revisarHorario, 10000); 
    
    return () => clearInterval(intervalo);
  }, [escenas]);


  // --- 4. FUNCIÓN DE CÁLCULO DE TIEMPO (Para el Sort) ---
  const getMinutesUntilNext = (schedule) => {
    if (!schedule?.enabled || !schedule?.days?.length || !schedule?.time) return Infinity;

    const now = new Date();
    const currentDayIndex = now.getDay(); 
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    // 🏆 MAPEO INVERSO para el cálculo de diferencia de días
    // Usamos esta estructura para el cálculo matemático de días restantes
    const dayMap = { lu: 1, ma: 2, mi: 3, ju: 4, vi: 5, sa: 6, do: 0 }; // Lun=1, Dom=0

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
    <>
        <ModalError 
            isOpen={showModalError}
            onClose={() => setShowModalError(false)}
            mensaje="El sistema automático no pudo activar la escena. Verifica la conexión con la base de datos."
        />

        <div className="escena-list">
        {listaOrdenada.map(([firebaseKey, datosEscena]) => (
            <div key={firebaseKey}>
            <CardEscena id={firebaseKey} escena={datosEscena} />
            </div>
        ))}
        </div>
    </>
  );
};

export default ListadoEscenas;