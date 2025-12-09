import React from 'react';
import styles from './Header.module.css';

// Componente simplificado que solo usa la prop 'nombre'
const Header = ({ nombre }) => {
  return (
    // Usamos el nombre del módulo CSS
    <header className={styles.headerContainer}>
        {/* Solo el nombre, sin card ni info extra */}
        <h1 className={styles.dynamicTitle}>{nombre}</h1>
    </header>
  )
}

export default Header;