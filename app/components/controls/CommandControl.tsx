import { useSignal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import { Play } from "../icons.js";
import * as css from "./CommandControl.css.js";

interface CommandControlProps {
    label: string;
    onFire: () => void;
}

export function CommandControl({ label, onFire }: CommandControlProps) {
    const modalOpen = useSignal(false);
    const fired = useSignal(false);
    const modalFired = useSignal(false);

    const handleFire = useCallback((e: Event) => {
        e.stopPropagation();
        onFire();
        fired.value = true;
        setTimeout(() => { fired.value = false; }, 600);
    }, [onFire]);

    const handleModalFire = useCallback(() => {
        onFire();
        modalFired.value = true;
        setTimeout(() => { modalFired.value = false; }, 600);
    }, [onFire]);

    const openModal = useCallback(() => {
        modalOpen.value = true;
    }, []);

    const closeModal = useCallback((e: Event) => {
        e.stopPropagation();
        modalOpen.value = false;
    }, []);

    return (
        <>
            <div class={css.card} onClick={openModal}>
                <button
                    class={`${css.iconButton} ${fired.value ? css.iconFired : ""}`}
                    onClick={handleFire}
                >
                    <Play size={20} />
                </button>
                <span class={css.label}>{label}</span>
            </div>

            {modalOpen.value && (
                <div class={css.overlay} onClick={closeModal}>
                    <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                        <button
                            class={`${css.modalIcon} ${modalFired.value ? css.modalIconFired : ""}`}
                            onClick={handleModalFire}
                        >
                            <Play size={36} />
                        </button>
                        <span class={css.modalLabel}>{label}</span>
                        <button class={css.modalClose} onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
