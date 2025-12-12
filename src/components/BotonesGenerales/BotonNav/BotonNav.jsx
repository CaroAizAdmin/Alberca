// src/components/BotonesGenerales/BotonNav/BotonNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './BotonNav.module.css';

const BotonNav = ({ to, imgSrc, altText, end = false }) => {

    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) => 
                // Si está activo, suma las dos clases: .navLink Y .navLinkActive
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
        >
            {/* Quitamos los estilos inline para que el CSS controle el tamaño y color */}
            <img src={imgSrc} alt={altText} />
        </NavLink>
    );
};

export default BotonNav;