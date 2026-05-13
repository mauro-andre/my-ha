import { useSignal, useSignalEffect } from "@preact/signals";
import { useCallback } from "preact/hooks";
import * as css from "./NumericControl.css.js";

interface NumericControlProps {
    label: string;
    property: string;
    value: unknown;
    valueMin?: number | null;
    valueMax?: number | null;
    valueStep?: number | null;
    unit?: string | null;
    onCommand: (property: string, value: unknown) => void;
}

function toNumber(v: unknown): number | "" {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
    return "";
}

export function NumericControl({ label, property, value, valueMin, valueMax, valueStep, unit, onCommand }: NumericControlProps) {
    const draft = useSignal<string>(String(toNumber(value)));

    // Re-sync draft with external value updates while not focused (avoid clobbering user typing)
    useSignalEffect(() => {
        const external = toNumber(value);
        if (typeof document !== "undefined" && document.activeElement?.tagName === "INPUT") return;
        draft.value = external === "" ? "" : String(external);
    });

    const commit = useCallback(() => {
        const n = Number(draft.value);
        if (!Number.isFinite(n)) {
            draft.value = String(toNumber(value));
            return;
        }
        let clamped = n;
        if (typeof valueMin === "number" && clamped < valueMin) clamped = valueMin;
        if (typeof valueMax === "number" && clamped > valueMax) clamped = valueMax;
        if (clamped !== toNumber(value)) {
            onCommand(property, clamped);
        }
        draft.value = String(clamped);
    }, [property, value, valueMin, valueMax, onCommand]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        }
        if (e.key === "Escape") {
            draft.value = String(toNumber(value));
            (e.target as HTMLInputElement).blur();
        }
    }, [value]);

    const pending = draft.value !== "" && Number(draft.value) !== toNumber(value);

    return (
        <div class={css.card}>
            <span class={css.label}>{label}</span>
            <div class={css.inputWrap}>
                <input
                    class={`${css.input} ${pending ? css.inputPending : ""}`}
                    type="number"
                    inputMode="decimal"
                    min={valueMin ?? undefined}
                    max={valueMax ?? undefined}
                    step={valueStep ?? "any"}
                    value={draft.value}
                    onInput={(e) => { draft.value = (e.target as HTMLInputElement).value; }}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                />
                {unit && <span class={css.unit}>{unit}</span>}
            </div>
        </div>
    );
}
