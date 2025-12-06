import CardEscena from "./CardEscena.jsx";
import { useQuery } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants.js";

const ListadoEscenas = () => {
  const { data: escenas, isLoading, error } = useQuery({
    queryKey: ["escenas"],
    queryFn: () =>
      fetch(`${URL_BASE}/escenas.json`).then((res) => res.json()),
  });

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar las escenas</p>;


/* COMENTARIO

SI NO HAY ESCENAS, PONER PANTALLA DE INFO PARA EL USUARIO */


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
