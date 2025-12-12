import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_BASE } from "../../assets/constants/constants";
import ModalConfirmacion from '../Modal/ModalConfirmacion/ModalConfirmacion';
import ModalExito from '../Modal/ModalExito/ModalExito';
import ModalError from '../Modal/ModalError/ModalError';
import styles from './Configuracion.module.css';
import { useTitulo } from '../../hooks/useTitulo';
import Botones from '../BotonesGenerales/Botones/Botones';

const Configuracion1 = () => {
    const queryClient = useQueryClient();
    useTitulo("Configuración");

    const [showConfirm, setShowConfirm] = useState(false);
    const [showExito, setShowExito] = useState(false);
    const [showError, setShowError] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

    const deleteAllScenesMutation = useMutation({
        mutationFn: () => {
            return fetch(`${URL_BASE}/escenas.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
        setShowConfirm(true);
    };

    const confirmDeletion = () => {
        deleteAllScenesMutation.mutate();
    };

    return (
        <div className={styles.configuracionContainer}>
            <h1>Ajustes de Sistema</h1>

            <div className={styles.sectionCard}>
                <h3>Gestión de Escenas</h3>
                <p>Presiona este botón para eliminar permanentemente todas las escenas configuradas por el usuario. Esta acción no se puede deshacer.</p>

                <Botones
                    variant="delete"
                    onClick={handleDeleteAllScenes}
                    disabled={deleteAllScenesMutation.isPending}
                    className={styles.btnFullWidth}
                >
                    {deleteAllScenesMutation.isPending ? "Eliminando..." : "BORRAR TODAS LAS ESCENAS"}
                </Botones>
            </div>

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