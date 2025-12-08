import React from "react";
import CardEscena from "./CardEscena.jsx";
import { useQuery } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants.js";
// 1. IMPORTAMOS EL EMPTY STATE
import SinEscenas from "./SinEscenas.jsx";

const ListadoEscenas = () => {
  const { data: escenas, isLoading, error } = useQuery({
    queryKey: ["escenas"],
    queryFn: () =>
      fetch(`${URL_BASE}/escenas.json`).then((res) => res.json()),
  });

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar las escenas</p>;

  // 2. LÓGICA DE VALIDACIÓN
  // Si escenas es null (Firebase devuelve null si no hay datos)
  // O si es un objeto vacío (Object.keys(escenas).length === 0)
  const noHayEscenas = !escenas || Object.keys(escenas).length === 0;

  if (noHayEscenas) {
    return <SinEscenas />;
  }

  // 3. SI HAY ESCENAS, LAS MOSTRAMOS
  return (
    <div className="escena-list">
      {Object.entries(escenas).map(([id, escena]) => (
        <div key={id}>
          <CardEscena escena={{ id, ...escena }} />
        </div>
      ))}
    </div>
  );
};

export default ListadoEscenas;