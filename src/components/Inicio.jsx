import ListadoEscenas from "./ListadoEscenas.jsx";
import { useTitulo } from '../hooks/useTitulo';

const Inicio = ({ escena, setEscenas }) => {
  useTitulo("Mis Escenas");

  return (
    <ListadoEscenas />
  );
}
export default Inicio;