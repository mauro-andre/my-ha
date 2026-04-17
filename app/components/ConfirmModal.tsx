import * as css from "./ConfirmModal.css.js";

interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    title,
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <div class={css.overlay} onClick={onCancel}>
            <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                <h3 class={css.title}>{title}</h3>
                <p class={css.message}>{message}</p>
                <div class={css.actions}>
                    <button class={css.cancelButton} onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button class={css.confirmButton} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
