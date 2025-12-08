import React from "react";
import CardEscena from "./CardEscena.jsx";
import { useQuery } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants.js";
import SinEscenas from "./SinEscenas.jsx";

const ListadoEscenas = () => {
  const { data: escenas, isLoading, error } = useQuery({
    queryKey: ["escenas"],
    queryFn: () =>
      fetch(`${URL_BASE}/escenas.json`).then((res) => res.json()),
  });

  if (isLoading) return <p style={{textAlign:'center', marginTop: 20}}>Cargando...</p>;
  if (error) return <p style={{textAlign:'center', marginTop: 20}}>Error al cargar las escenas</p>;

  // Validación si está vacío
  if (!escenas || Object.keys(escenas).length === 0) {
    return <SinEscenas />;
  }

  return (
    <div className="escena-list">
      {/* Object.entries devuelve: 
         [ 
           ["-OfwGFg...", {name: "Escena prueba", ...}], 
           ["fiesta", {name: "Fiesta", ...}] 
         ]
      */}
      {Object.entries(escenas).map(([firebaseKey, datosEscena]) => (
        <div key={firebaseKey}>
          {/* AQUÍ ESTÁ LA SOLUCIÓN:
             1. 'key' de React usa la firebaseKey para optimización.
             2. Pasamos 'id' como prop explícita con el valor de la key.
             3. Pasamos 'escena' tal cual viene de la BD (sin alterarla).
          */}
          <CardEscena 
             id={firebaseKey} 
             escena={datosEscena} 
          />
        </div>
      ))}
    </div>
  );
};

export default ListadoEscenas;