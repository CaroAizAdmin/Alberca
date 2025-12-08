import React from 'react'
import { NavLink } from 'react-router-dom'
import imgEscenas from '../assets/imagenes/home.png'
import imgHome from '../assets/imagenes/home.png'
import imgMas from '../assets/imagenes/mas.png' 


const Menu = () => {


    const iconStyle = {
    width: '24px',
    height: '24px',
    objectFit: 'contain' // Para que no se deformen
  };

    
  return (

        <div className='menu'>
            <nav className='navbar'>
                
                {/* 2. REEMPLAZA LOS SVG POR LA ETIQUETA IMG */}
                
                <NavLink to="/escenas">
                    <img src={imgEscenas} alt="Escenas" style={iconStyle} />
                </NavLink>

                <NavLink to="/">
                    <img src={imgHome} alt="Inicio" style={iconStyle} />
                </NavLink>

                <NavLink to="/CrearEscena">
                    <img src={imgMas} alt="Más" style={iconStyle} />
                </NavLink>

            </nav>
        </div>
  )
}

export default Menu
