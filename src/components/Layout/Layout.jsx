import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header'; // Asegúrate que esta ruta sea correcta
import Menu from '../Menu';     // Asegúrate que esta ruta sea correcta
import { useTituloGlobal } from '../../store/useTituloGlobal';

const Layout = () => {
  // 1. Leemos el título del store global
  const titulo = useTituloGlobal((state) => state.titulo);

  return (
    <>
      {/* 2. El Header recibe el título dinámico automáticamente */}
      <Header nombre={titulo} />

      {/* 3. Contenedor principal con padding para evitar solapamiento */}
      {/* Ajusta '100px' según la altura real de tu Header y Menu */}
      <main style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '100vh' }}>
        {/* Aquí se renderizan tus páginas (Inicio, Gestor, etc.) */}
        <Outlet />
      </main>

      {/* 4. Menú fijo abajo */}
      <Menu />
    </>
  );
};

export default Layout;