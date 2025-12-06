import "./App.css";
/* import Detalle from "./components/Detalle"; */
import Inicio from "./components/Inicio";

function App() {
  return (
    <>

      <Inicio />
      <Menu />
      {/* <Detalle id="fiesta" /> */}
            {/* router va acá */}


        <Routes>
          <Route path='/' element={<><Header nombre="Inicio" /><Inicio habitos={habitos} setHabitos={setHabitos} /></>} />
          <Route path='/crearEscena' element={<><Header nombre="Creá tu escena" /><GestorEscenas escena={habitos} setEscenas={setEscenas} /></>} /> 
          {/* ver si hacerlo con zustand */}
          <Route path='/escenas' element={<><Header nombre="Mis Escenas" /><Inicio escena={habitos} setEscenas={setEscenas} /></>} />
          {/* ver si hacerlo con zustand */}
          
          <Route path='/escenas/:id?' element={<><Header nombre="Detalle de la escena" /><DetalleEscena escena={habitos} setEscenas={setEscenas}  /></>} />
          {/* ver si hacerlo con zustand */}
          <Route path='/editar-escena/:id' element={<><Header nombre="Editar escena" /><EditarEscena escena={habitos} setEscenas={setEscenas}  /></>} />
          {/* ver si hacerlo con zustand */}
          <Route path='*' element={<><Error404 /></>} />
          
        </Routes>
    </>
  );
}

export default App;
