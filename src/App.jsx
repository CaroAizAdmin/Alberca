import "./App.css";
/* import Detalle from "./components/Detalle"; */

import { Routes, Route } from "react-router-dom";


import Inicio from "./components/Inicio";
import Menu from "./components/Menu";
import Header from "./components/Header";
import GestorEscenas from "./components/GestorEscenas";
import Detalle from "./components/Detalle";
import EditarEscena from "./components/EditarEscena";
import Error404 from "./components/Error404";
import React from "react";
import { useState } from "react";

function App() {


  const [escenas, setEscenas] = useState([]);

  return (
    <>

      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}
      {/* LO IDEAL SERIA HACER USO DEL OUTLET */}

      {/* <Inicio /> */}
      <Menu />
      {/* <Detalle id="fiesta" /> */}


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
