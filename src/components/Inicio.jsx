import { useQuery } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";

const Inicio = ({ id }) => {

  const { data: escena, isLoading, error } = useQuery({
    queryKey: ["escena", id],
    queryFn: () =>
      fetch(`${URL_BASE}/escenas/${id}.json`)
        .then((res) => res.json()),
  });

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar la escena</p>;

  return (
    <div>
      <h1>{escena?.name}</h1>
      <p>{escena?.descripcion}</p>

      <h2>Parlante</h2>
      <p>Canción: {escena?.actions?.parlante?.cancionPip}</p>
      <p>Volumen: {escena?.actions?.parlante?.volumen}</p>

      <h2>Chorros de Agua</h2>
      <p>Estado: {String(escena?.actions?.chorrosAgua?.estado)}</p>

      <h2>Luces</h2>
      <p>Color ON: {String(escena?.luces?.color?.estado)}</p>

      <pre>{JSON.stringify(escena, null, 2)}</pre>
    </div>
  );
};

export default Inicio;
