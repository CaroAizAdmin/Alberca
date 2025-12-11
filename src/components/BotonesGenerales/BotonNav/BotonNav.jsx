import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './BotonNav.module.css';

const BotonNav = ({ to, imgSrc, altText, end = false }) => {

    const iconStyle = {
        width: '32px',
        height: '32px',
        objectFit: 'contain',
        transition: 'filter 0.3s ease'
    };

    const linkClassName = ({ isActive }) => isActive ? styles.navLinkActive : undefined;

    return (

        <NavLink
            to={to}
            end={end}
            className={`${styles.navLink} ${linkClassName({ isActive: false })}`}
        >
            <img src={imgSrc} alt={altText} style={iconStyle} />
        </NavLink>
    );
};

export default BotonNav;