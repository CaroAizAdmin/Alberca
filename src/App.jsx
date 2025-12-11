import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import Inicio from "./components/Inicio";
import GestorEscenas from "./components/GestorEscenas";
import Detalle from "./components/Detalle";
import EditarEscena from "./components/EditarEscena";
import Error404 from "./components/Error404";
import Configuracion1 from "./components/Configuracion1";

function App() {
  const [escenas, setEscenas] = useState([]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Inicio escena={escenas} setEscenas={setEscenas} />} />
        <Route path='/configuracion' element={<Configuracion1 escena={escenas} setEscenas={setEscenas}/>}/>
        <Route path='/crearEscena' element={<GestorEscenas escena={escenas} setEscenas={setEscenas} />} />
        <Route path='/escenas/:id' element={<Detalle escena={escenas} setEscenas={setEscenas} />} />
        <Route path='/editar-escena/:id' element={<EditarEscena escena={escenas} setEscenas={setEscenas} />} />
      </Route>
      <Route path='*' element={<Error404 />} />
    </Routes>
  );
}

export default App;