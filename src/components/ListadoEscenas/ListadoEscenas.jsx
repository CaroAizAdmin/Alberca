import React, { useEffect, useState } from "react";
import CardEscena from "../CardEscenas/CardEscena.jsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../../assets/constants/constants.js";
import SinEscenas from "../SinEscenas/SinEscenas.jsx";
import ModalError from '../Modal/ModalError/ModalError.jsx';

const JS_TO_CUSTOM_DAY_MAP = ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sa'];


const ListadoEscenas = () => {
  const queryClient = useQueryClient();
  const [showModalError, setShowModalError] = useState(false);

  const { data: escenas, isLoading, error } = useQuery({
    queryKey: ["escenas"],
    queryFn: () => fetch(`${URL_BASE}/escenas.json`).then((res) => res.json()),
    refetchInterval: 30000,
  });

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

  useEffect(() => {
    if (!escenas) return;

    const revisarHorario = () => {
      const ahora = new Date();

      const diaActual = JS_TO_CUSTOM_DAY_MAP[ahora.getDay()];

      const horaActual = ahora.getHours().toString().padStart(2, '0') + ":" +
        ahora.getMinutes().toString().padStart(2, '0');

      Object.entries(escenas).forEach(([id, datos]) => {
        const programacion = datos.schedule;

        if (programacion?.enabled &&
          programacion.time === horaActual &&
          programacion.days?.includes(diaActual)) {
          if (!datos.active) {
            console.log(`⏰ HORA DE EJECUTAR: ${datos.name}`);
            activarEscenaMutation.mutate(id);
          }
        }
      });
    };

    const intervalo = setInterval(revisarHorario, 10000);

    return () => clearInterval(intervalo);
  }, [escenas]);

  const getMinutesUntilNext = (schedule) => {
    if (!schedule?.enabled || !schedule?.days?.length || !schedule?.time) return Infinity;

    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const dayMap = { lu: 1, ma: 2, mi: 3, ju: 4, vi: 5, sa: 6, do: 0 };

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

  if (isLoading) return <p style={{ textAlign: 'center', marginTop: 20 }}>Cargando...</p>;
  if (error) return <p style={{ textAlign: 'center', marginTop: 20 }}>Error al cargar las escenas</p>;
  if (!escenas || Object.keys(escenas).length === 0) return <SinEscenas />;

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