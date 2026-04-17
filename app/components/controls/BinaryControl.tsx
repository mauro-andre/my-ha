import { useSignal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { Power } from "../icons.js";
import { TimerBadge } from "../QuickTimer.js";
import * as css from "./BinaryControl.css.js";

interface BinaryControlProps {
    label: string;
    property: string;
    value: unknown;
    valueOn: unknown;
    valueOff: unknown;
    onToggle: (property: string, newValue: unknown) => void;
    modalExtra?: ComponentChildren;
    timerKey?: string;
}

export function BinaryControl({ label, property, value, valueOn, valueOff, onToggle, modalExtra, timerKey }: BinaryControlProps) {
    const modalOpen = useSignal(false);
    const isOn = value === valueOn;

    const handleToggle = useCallback((e: Event) => {
        e.stopPropagation();
        onToggle(property, isOn ? valueOff : valueOn);
    }, [property, isOn, valueOn, valueOff, onToggle]);

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
                    class={`${css.iconButton} ${isOn ? css.iconOn : css.iconOff}`}
                    onClick={handleToggle}
                >
                    <Power size={20} />
                </button>
                <span class={css.label}>
                    {label}
                    {timerKey && <TimerBadge actionKey={timerKey} />}
                </span>
                <span class={`${css.stateText} ${isOn ? css.stateOn : css.stateOff}`}>
                    {isOn ? "ON" : "OFF"}
                </span>
            </div>

            {modalOpen.value && (
                <div class={css.overlay} onClick={closeModal}>
                    <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                        <button
                            class={`${css.modalIcon} ${isOn ? css.iconOn : css.iconOff}`}
                            onClick={handleToggle}
                        >
                            <Power size={36} />
                        </button>
                        <span class={css.modalLabel}>{label}</span>
                        <span class={`${css.modalState} ${isOn ? css.stateOn : css.stateOff}`}>
                            {isOn ? "ON" : "OFF"}
                        </span>
                        {modalExtra}
                        <button class={css.modalClose} onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
