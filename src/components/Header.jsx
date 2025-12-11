import React from 'react';
import styles from './Header.module.css';

const Header = ({ nombre }) => {
  return (
    <header className={styles.headerContainer}>
      <h1 className={styles.dynamicTitle}>{nombre}</h1>
    </header>
  )
}

export default Header;