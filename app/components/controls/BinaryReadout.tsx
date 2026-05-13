import * as css from "./BinaryReadout.css.js";

interface BinaryReadoutProps {
    label: string;
    value: unknown;
    valueOn: unknown;
    onLabel?: string;
    offLabel?: string;
}

export function BinaryReadout({ label, value, valueOn, onLabel = "ON", offLabel = "OFF" }: BinaryReadoutProps) {
    const isOn = value === valueOn;

    return (
        <div class={css.card}>
            <span class={`${css.statusDot} ${isOn ? css.dotOn : css.dotOff}`} />
            <span class={css.label}>{label}</span>
            <span class={`${css.stateText} ${isOn ? css.stateOn : css.stateOff}`}>
                {isOn ? onLabel : offLabel}
            </span>
        </div>
    );
}
