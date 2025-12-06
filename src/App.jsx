import "./App.css";
/* import Detalle from "./components/Detalle"; */
import Inicio from "./components/Inicio";
import Menu from "./components/Menu";
import Header from "./components/Header";
import { Routes, Route } from "react-router";
import GestorEscenas from "./components/GestorEscenas";
import Detalle from "./components/Detalle";
import EditarEscena from "./components/EditarEscena";
import Error404 from "./components/Error404";
import React from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

function App() {


  const [escenas, setEscenas] = useState([
    {
      id: "fiesta",
      nombre: "Fiesta en la playa",
      descripcion: "Una fiesta divertida en la playa con amigos.",
      imagen: "https://example.com/fiesta.jpg",
    }]);

  return (
    <>

      <div className='menu'>
          <nav className='navbar'>
            <NavLink to="/habitos"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(9, 59, 116)"><path d="M200-200v-560 179-19 400Zm80-240h221q2-22 10-42t20-38H280v80Zm0 160h157q17-20 39-32.5t46-20.5q-4-6-7-13t-5-14H280v80Zm0-320h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v258q-14-26-34-46t-46-33v-179H200v560h202q-1 6-1.5 12t-.5 12v56H200Zm480-200q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM480-120v-56q0-24 12.5-44.5T528-250q36-15 74.5-22.5T680-280q39 0 77.5 7.5T832-250q23 9 35.5 29.5T880-176v56H480Z"/></svg></NavLink>
            <NavLink to="/"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(9, 59, 116)"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg></NavLink>
            <NavLink to="/mas"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(9, 59, 116)"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></NavLink>
          </nav>
      </div>


      <Inicio />
      <Menu />
      {/* <Detalle id="fiesta" /> */}
            {/* router va acá */}


        <Routes>
          <Route path='/' element={<><Header nombre="Inicio" /><Inicio escena={escenas} setEscenas={setEscenas} /></>} />
          <Route path='/crearEscena' element={<><Header nombre="Creá tu escena" /><GestorEscenas escena={escenas} setEscenas={setEscenas} /></>} /> 
          {/* ver si hacerlo con zustand */}
          <Route path='/escenas' element={<><Header nombre="Mis Escenas" /><Inicio escena={escenas} setEscenas={setEscenas} /></>} />
          {/* ver si hacerlo con zustand */}
          
          <Route path='/escenas/:id?' element={<><Header nombre="Detalle de la escena" /><Detalle escena={escenas} setEscenas={setEscenas}  /></>} />
          {/* ver si hacerlo con zustand */}
          <Route path='/editar-escena/:id' element={<><Header nombre="Editar escena" /><EditarEscena escena={escenas} setEscenas={setEscenas}  /></>} />
          {/* ver si hacerlo con zustand */}
          <Route path='*' element={<><Error404 /></>} />
          
        </Routes>
    </>
  );
}

export default App;
