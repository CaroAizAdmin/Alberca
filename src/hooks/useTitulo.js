import { useEffect } from 'react';
import { useTituloGlobal } from '../store/useTituloGlobal';

export const useTitulo = (texto) => {
  const setTitulo = useTituloGlobal((state) => state.setTitulo);

  useEffect(() => {
    if (texto) {
      setTitulo(texto);
    }
  }, [texto, setTitulo]);
};