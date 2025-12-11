import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../assets/constants/constants"; // Asegúrate de que esta URL exista
import ModalConfirmacion from './ModalConfirmacion'; 
import ModalExito from './ModalExito';
import ModalError from './ModalError';
// Importa tus estilos. Renombra 'Configuracion.module.css' si usas otro nombre
import styles from './Configuracion.module.css';  
import { useTitulo } from '../hooks/useTitulo';

// 💡 Importamos el componente Botones
import Botones from './BotonesGenerales/Botones/Botones'; 

const Configuracion1 = () => {
   const queryClient = useQueryClient();
    useTitulo("Configuración"); // Establece el título de la página

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
                // Envía 'null' para eliminar completamente el nodo 'escenas' en Firebase
                body: JSON.stringify(null), 
            });
        },
        onSuccess: () => {
            // Invalida la caché para que el listado de escenas se actualice
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
                
                {/* 🟢 REEMPLAZAMOS por el componente Botones con variant="delete" */}
                <Botones 
                    variant="delete"
                    onClick={handleDeleteAllScenes} 
                    disabled={deleteAllScenesMutation.isPending}
                    // Opcional: añadimos una clase de utilería para forzar el 100% de ancho si es necesario
                    className={styles.btnFullWidth} 
                >
                    {deleteAllScenesMutation.isPending ? "Eliminando..." : "BORRAR TODAS LAS ESCENAS"}
                </Botones>
            </div>
            
            {/* MODAL DE CONFIRMACIÓN */}
            <ModalConfirmacion
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmDeletion}
                titulo="¡Advertencia de Borrado!"
                mensaje="Estás a punto de eliminar *TODAS* las escenas de forma permanente. ¿Estás absolutamente seguro de que deseas continuar?"
                textoBotonConfirmar="SÍ, BORRAR TODO"
            />
            
            {/* MODAL DE ÉXITO */}
            <ModalExito
                isOpen={showExito}
                onClose={() => setShowExito(false)}
                mensaje="¡Todas las escenas han sido eliminadas correctamente!"
            />
            
            {/* MODAL DE ERROR */}
            <ModalError
                isOpen={showError}
                onClose={() => setShowError(false)}
                mensaje={mensajeError}
            />

        </div>
    );
};
export default Configuracion1;