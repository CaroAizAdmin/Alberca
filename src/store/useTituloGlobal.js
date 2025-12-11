import { create } from 'zustand';

export const useTituloGlobal = create((set) => ({
  titulo: 'Alberca App',
  setTitulo: (nuevoTitulo) => set({ titulo: nuevoTitulo }),
}));