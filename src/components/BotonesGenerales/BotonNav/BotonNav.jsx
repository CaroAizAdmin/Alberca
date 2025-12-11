// src/components/BotonesGenerales/BotonNav/BotonNav.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
// 💡 La ruta es local, dentro de la misma carpeta
import styles from './BotonNav.module.css'; 

/**
 * Componente BotonNav (Reutilizable para cada enlace de la barra de navegación)
 */
const BotonNav = ({ to, imgSrc, altText, end = false }) => {
    
    // Estilo base para los íconos
    const iconStyle = {
        width: '32px', 
        height: '32px',
        objectFit: 'contain',
        transition: 'filter 0.3s ease'
    };
    
    // Función que devuelve la clase activa/inactiva
    // Ahora usa la clase 'navLinkActive' de BotonNav.module.css
    const linkClassName = ({ isActive }) => isActive ? styles.navLinkActive : undefined;

    return (
        // Aplicamos la clase principal para el enlace (está definida como la etiqueta 'a' en el CSS)
        <NavLink 
            to={to}
            end={end} 
            className={`${styles.navLink} ${linkClassName({ isActive: false })}`} // Clase base del botón
        >
            <img src={imgSrc} alt={altText} style={iconStyle} />
        </NavLink>
    );
};

export default BotonNav;