import { useQuery } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";

const Detalle = ({ id }) => {

  const { data: escena, isLoading, error } = useQuery({
    queryKey: ["escena", id],
    queryFn: () =>
      fetch(`${URL_BASE}/escenas/${id}.json`)
        .then((res) => res.json()),
  });

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar la escena</p>;

  return (

/* COMENTARIO

INFORMACION QUE NOS PIDE:
NOMBRE
DESCRIPCION
DIAS Y HORARIOS PROGRAMADOS
LISTADO DE ACCIONES ASOCIADAS A DISPOSITIVOS
HISTORIAL DE EJECUCION, FECHA, DIA, Y MODO DE ACTIVACION (MANUAL/AUTOMATICA)
PERMITIR EJECUTAR EDITAR Y ELIMINAR */


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

export default Detalle;
