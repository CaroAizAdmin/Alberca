import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// 🚫 ELIMINAMOS: import './Error404Pool.css';
// ✅ AÑADIMOS:
import styles from './Error404.module.css';

const Error404 = () => {
    const navigate = useNavigate();
    const floatRef = useRef(null);

    useEffect(() => {
        const element = floatRef.current;
        if (!element) return;

        let x = Math.random() * (window.innerWidth - 150);
        let y = Math.random() * (window.innerHeight - 150);
        
        let speedX = 0.6; 
        let speedY = 0.6;

        if (Math.random() > 0.5) speedX *= -1;
        if (Math.random() > 0.5) speedY *= -1;

        let animationFrameId;

        const animate = () => {
            const { innerWidth, innerHeight } = window;
            const rect = element.getBoundingClientRect();

            x += speedX;
            y += speedY;

            // Rebote Horizontal
            if (x + rect.width >= innerWidth) {
                x = innerWidth - rect.width;
                speedX = -speedX;
            } else if (x <= 0) {
                x = 0;
                speedX = -speedX;
            }

            // Rebote Vertical
            if (y + rect.height >= innerHeight) {
                y = innerHeight - rect.height;
                speedY = -speedY;
            } else if (y <= 0) {
                y = 0;
                speedY = -speedY;
            }

            element.style.transform = `translate(${x}px, ${y}px)`;
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    
    return (
        // ✅ CLASE ACTUALIZADA: fullPoolContainer
         <div className={styles.fullPoolContainer}>
             
            {/* ✅ CLASES ACTUALIZADAS */}
            <div className={styles.driftingFloat} ref={floatRef}>
                <div className={styles.poolFloatCss}>
                    <div className={styles.floatStripe + ' ' + styles.stripe1}></div>
                    <div className={styles.floatStripe + ' ' + styles.stripe2}></div>
                    <div className={styles.floatStripe + ' ' + styles.stripe3}></div>
                    <div className={styles.floatStripe + ' ' + styles.stripe4}></div>
                </div>
                <div className={styles.floatShadowWater}></div>
            </div>

            {/* ✅ CLASES ACTUALIZADAS */}
            <div className={styles.contentCard}>
                 <h1 className={styles.pool404Number}>404</h1>
                 <h2 className={styles.pool404Title}>¡Ups! Te fuiste a lo hondo</h2>
                 <p className={styles.pool404Message}>Parece que la página que buscas se hundió en la piscina o no existe.
                Será mejor volver a la superficie.</p>
                 <button className={styles.pool404Button} onClick={() => navigate('/')}>
                     Volver al inicio
                </button>
            </div>
         </div>
    );
};
export default Error404;