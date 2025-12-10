import { create } from 'zustand';

export const useTituloGlobal = create((set) => ({
  titulo: 'Alberca App', // Valor inicial por defecto
  setTitulo: (nuevoTitulo) => set({ titulo: nuevoTitulo }),
}));