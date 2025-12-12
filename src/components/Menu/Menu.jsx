
import BotonNav from '../BotonesGenerales/BotonNav/BotonNav';
import imgEscenas from '../../assets/imagenes/home.png'; 
import imgMas from '../../assets/imagenes/mas.png';
import imgConfi from '../../assets/imagenes/configuracion.png';
import styles from './Menu.module.css';

const Menu = () => {

    return (
        <div className={styles.menuContainer}>
            <nav className={styles.navbarWrapper}>

                <BotonNav
                    to="/configuracion"
                    imgSrc={imgConfi}
                    altText="Configuración"
                />

                <BotonNav
                    to="/"
                    imgSrc={imgEscenas}
                    altText="Inicio"
                    end={true}
                />

                <BotonNav
                    to="/CrearEscena"
                    imgSrc={imgMas}
                    altText="Crear Escena"
                />

            </nav>
        </div>
    )
}

export default Menu;