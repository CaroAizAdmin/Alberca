import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants";
import ModalConfirmacion from './ModalConfirmacion'; 
import ModalExito from './ModalExito';
import ModalError from './ModalError';
import styles from './Configuracion.module.css';  
import { useTitulo } from '../hooks/useTitulo';
import Botones from './BotonesGenerales/Botones/Botones'; // 💡 Importado Botones

const Configuracion1 = () => {
   const queryClient = useQueryClient();
    useTitulo("Configuración");

    const [showConfirm, setShowConfirm] = useState(false);
    const [showExito, setShowExito] = useState(false);
    const [showError, setShowError] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

    // --- MUTACIÓN PARA ELIMINAR TODAS LAS ESCENAS ---
    const deleteAllScenesMutation = useMutation({
        mutationFn: () => {
            return fetch(`${URL_BASE}/escenas.json`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Envía 'null' para eliminar completamente el nodo 'escenas'
                body: JSON.stringify(null), 
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escenas'] });
            
            setShowConfirm(false);
            setShowExito(true);
        },
        onError: (err) => {
            setMensajeError("Hubo un error al eliminar todas las escenas. Intenta de nuevo.");
            setShowConfirm(false);
            setShowError(true);
            console.error(err);
        }
    });

    const handleDeleteAllScenes = () => {
        // Muestra la ventana modal de confirmación
        setShowConfirm(true);
    };

    const confirmDeletion = () => {
        // Ejecuta la mutación de borrado
        deleteAllScenesMutation.mutate();
    };

    return (
        <div className={styles.configuracionContainer}>
            <h1>Ajustes de Sistema</h1>

            <div className={styles.sectionCard}>
                <h3>Gestión de Escenas</h3>
                <p>Presiona este botón para eliminar permanentemente todas las escenas configuradas por el usuario. Esta acción no se puede deshacer.</p>
                
                {/* 🟢 Botón refactorizado con variant="delete" */}
                <Botones 
                    variant="delete"
                    onClick={handleDeleteAllScenes} 
                    disabled={deleteAllScenesMutation.isPending}
                    className={styles.btnFullWidth} // Clase para forzar 100% de ancho
                >
                    {deleteAllScenesMutation.isPending ? "Eliminando..." : "BORRAR TODAS LAS ESCENAS"}
                </Botones>
            </div>
            
            {/* MODALES (SIN CAMBIOS) */}
            <ModalConfirmacion
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmDeletion}
                titulo="¡Advertencia de Borrado!"
                mensaje="Estás a punto de eliminar *TODAS* las escenas de forma permanente. ¿Estás absolutamente seguro de que deseas continuar?"
                textoBotonConfirmar="SÍ, BORRAR TODO"
            />
            
            <ModalExito
                isOpen={showExito}
                onClose={() => setShowExito(false)}
                mensaje="¡Todas las escenas han sido eliminadas correctamente!"
            />
            
            <ModalError
                isOpen={showError}
                onClose={() => setShowError(false)}
                mensaje={mensajeError}
            />

        </div>
    );
};
export default Configuracion1;