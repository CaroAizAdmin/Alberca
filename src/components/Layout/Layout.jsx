import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Menu from '../Menu/Menu';
import { useTituloGlobal } from '../../store/useTituloGlobal';

const Layout = () => {
  const titulo = useTituloGlobal((state) => state.titulo);

  return (
    <>
      <Header nombre={titulo} />
      <main style={{ paddingTop: '30px', paddingBottom: '100px', minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Menu />
    </>
  );
};

export default Layout;