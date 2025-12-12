import ListadoEscenas from "../ListadoEscenas/ListadoEscenas.jsx";
import { useTitulo } from '../../hooks/useTitulo.js';

const Inicio = ({ escena, setEscenas }) => {
  useTitulo("Mis Escenas");

  return (
    <ListadoEscenas />
  );
}
export default Inicio;