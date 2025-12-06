

const CardEscena = ({escena}) => {
  return (
    <div className="escena-card">
      <h3>{escena.name}</h3>
      <p>{escena.descripcion}</p>
      <div className="acciones">
        <p><strong>Chorros de agua:</strong> {escena.actions.chorrosAgua ? "Prendidos" : "Apagados"}</p>
        <p><strong>Luces encendidas:</strong> {escena.actions.luces.estado ? "Sí" : "No"}</p>

        <p><strong>Color:</strong>  
          r:{escena.actions.luces.color.r} - 
          g:{escena.actions.luces.color.g} - 
          b:{escena.actions.luces.color.b}
        </p>

        <div 
        style={{ 
            width: "40px",
            height: "40px",
            backgroundColor: escena.actions.luces.color,
            borderRadius: "6px"
        }}
        ></div>

      </div>
      {/* Agregá lo que necesites: imagen, autor, etiquetas, etc */}


      {/* COMENTARIO
      AGREGAR BOTON DE EJECUTAR Y QUE LLAME A UNA VENTANA MODULE QUE DIGA QUE LA ACCION SE HIZO Y CAMBIE EN LA PESTALA DE DASHBOARD COMO ESCENA ACTIVA */}
    </div>
  )
}

export default CardEscena;