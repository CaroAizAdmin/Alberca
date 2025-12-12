import styles from './ModalConfirmacion.module.css';

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje, textoBotonConfirmar = "Confirmar" }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <div className={styles.iconCircle}>
          !
        </div>
        <h3 className={styles.title}>{titulo}</h3>
        <p className={styles.message}>{mensaje}</p>

        <div className={styles.buttonGroup}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnConfirm} onClick={onConfirm}>
            {textoBotonConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;