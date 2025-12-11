import React from 'react'
import { NavLink } from 'react-router-dom'
import imgEscenas from '../assets/imagenes/home.png'
import imgMas from '../assets/imagenes/mas.png' 
import imgConfi from '../assets/imagenes/configuracion.png' 
import styles from "./Menu.module.css"; // Importa los estilos modulares

const Menu = () => {

    const iconStyle = {
        width: '32px', 
        height: '32px',
        objectFit: 'contain' 
    };

    
  return (
        <div className={styles.menuContainer}> 
            <nav className={styles.navbarWrapper}> 
                
                {/* 1. Enlace a /escenas */}
                <NavLink 
                    to="/configuracion"
                    // 🏆 Agrega la clase modular .navLinkActive si isActive es true
                    className={({ isActive }) => isActive ? styles.navLinkActive : undefined}
                >
                    <img src={imgConfi} alt="configuracion" style={iconStyle} />
                </NavLink>

                {/* 2. Enlace a / (Inicio) - Activo por defecto */}
                <NavLink 
                    to="/" 
                    end // 🏆 CLAVE: Asegura que solo se active cuando la ruta es EXACTAMENTE '/'
                    // 🏆 Agrega la clase modular .navLinkActive si isActive es true (lo cual es por defecto en la raíz)
                    className={({ isActive }) => isActive ? styles.navLinkActive : undefined}
                > 
                    <img src={imgEscenas} alt="Inicio" style={iconStyle} />
                </NavLink>

                {/* 3. Enlace a /CrearEscena */}
                <NavLink 
                    to="/CrearEscena"
                    // 🏆 Agrega la clase modular .navLinkActive si isActive es true
                    className={({ isActive }) => isActive ? styles.navLinkActive : undefined}
                >
                    <img src={imgMas} alt="Más" style={iconStyle} />
                </NavLink>

            </nav>
        </div>
  )
}

export default Menu