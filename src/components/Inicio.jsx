import { useQuery } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import ListadoEscenas from "./ListadoEscenas.jsx";

const Inicio = () => {

/* 
  const { data: escenas, isLoading, error } = useQuery({
  queryKey: ["escenas"],
  queryFn: () =>
    fetch(`${URL_BASE}/escenas.json`)
      .then((res) => res.json()),
});

  
  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar la escena</p>;

 */

  return (
    <>
    <ListadoEscenas />

{/* ACA VA EL LISTADO DE ESCENAS */}
    </>


  )
}

export default Inicio
