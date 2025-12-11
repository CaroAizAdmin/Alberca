// src/components/Menu.jsx

import React from 'react';
// Importamos el componente BotonNav con la ruta corregida
import BotonNav from './BotonesGenerales/BotonNav/BotonNav'; 
// Importamos las imágenes (asumiendo que están en assets/imagenes/ desde la raíz del src)
import imgEscenas from '../assets/imagenes/home.png';
import imgMas from '../assets/imagenes/mas.png'; 
import imgConfi from '../assets/imagenes/configuracion.png'; 
// Importamos solo los estilos contenedores (ya que BotonNav maneja los estilos del enlace)
import styles from "./Menu.module.css"; 

const Menu = () => {

  return (
        <div className={styles.menuContainer}> 
            <nav className={styles.navbarWrapper}> 
                
                {/* 1. Botón Configuración */}
                <BotonNav
                    to="/configuracion"
                    imgSrc={imgConfi}
                    altText="Configuración"
                />

                {/* 2. Botón Inicio (Ruta Raíz) */}
                <BotonNav
                    to="/"
                    imgSrc={imgEscenas}
                    altText="Inicio"
                    end={true} // Se activa solo en la ruta exacta '/'
                />

                {/* 3. Botón Crear Escena */}
                <BotonNav
                    to="/CrearEscena"
                    imgSrc={imgMas}
                    altText="Crear Escena"
                />

            </nav>
        </div>
  )
}

export default Menu