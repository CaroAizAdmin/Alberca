import { useEffect } from 'react';
import { useTituloGlobal } from '../store/useTituloGlobal';

export const useTitulo = (texto) => {
  const setTitulo = useTituloGlobal((state) => state.setTitulo);

  useEffect(() => {
    // Solo actualizamos si 'texto' tiene valor
    if (texto) {
      setTitulo(texto);
    }
    // Opcional: Podrías resetear el título al desmontar, 
    // pero generalmente queremos que persista hasta cambiar de página.
  }, [texto, setTitulo]);
};