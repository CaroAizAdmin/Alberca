

const CardEscena = ({escena}) => {
  return (
    <div className="escena-card">
      <h3>{escena.name}</h3>
      <p>{escena.descripcion}</p>
      <div className="acciones">
        <p><strong>Chorros de agua:</strong> {escena.actions.chorrosAgua || "N/A"}</p>
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
    </div>
  )
}

export default CardEscena;