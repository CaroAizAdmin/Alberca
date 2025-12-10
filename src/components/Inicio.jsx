import { useQuery } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import ListadoEscenas from "./ListadoEscenas.jsx";

import { useTitulo } from '../hooks/useTitulo'; 
// otros imports...

const Inicio = ({ escena, setEscenas }) => {
  // ✅ Una sola línea para definir el título
  useTitulo("Mis Escenas"); 

  return (
     // TU JSX YA LIMPIO (Sin <Header> ni <Menu>)
     <ListadoEscenas /> 
  );
}
export default Inicio;