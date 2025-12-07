// ... imports ...
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Error404Pool.css';

const Error404 = () => {
    const navigate = useNavigate();
    const floatRef = useRef(null);

    useEffect(() => {
        const element = floatRef.current;
        if (!element) return;

        let x = Math.random() * (window.innerWidth - 150);
        let y = Math.random() * (window.innerHeight - 150);
        
        // --- CAMBIO AQUÍ: VELOCIDAD MÁS LENTA ---
        // Antes era 2. Ahora ponemos 0.6 para que flote suavemente
        let speedX = 0.6; 
        let speedY = 0.6;

        // Dirección aleatoria
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

    // ... el resto del return sigue igual ...
    return (
        // ...
         <div className="full-pool-container">
            <div className="drifting-float" ref={floatRef}>
                <div className="pool-float-css">
                    <div className="float-stripe stripe-1"></div>
                    <div className="float-stripe stripe-2"></div>
                    <div className="float-stripe stripe-3"></div>
                    <div className="float-stripe stripe-4"></div>
                </div>
                <div className="float-shadow-water"></div>
            </div>

            <div className="content-card">
                 {/* ... contenido del texto ... */}
                 <h1 className="pool-404-number">404</h1>
                 <h2 className="pool-404-title">¡Ups! Te fuiste a lo hondo</h2>
                 <p className="pool-404-message">Parece que la página que buscas se hundió en la piscina o no existe.
                Será mejor volver a la superficie.</p>
                 <button className="pool-404-button" onClick={() => navigate('/')}>
                    🏊 Volver al inicio
                </button>
            </div>
         </div>
    );
};
export default Error404;
