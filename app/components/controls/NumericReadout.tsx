import * as css from "./NumericReadout.css.js";

interface NumericReadoutProps {
    label: string;
    value: unknown;
    unit?: string | null;
}

function formatValue(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") {
        // Show up to 1 decimal place; integers stay clean
        return Number.isInteger(value) ? value.toString() : value.toFixed(1);
    }
    if (typeof value === "string" && value.trim() !== "") return value;
    return null;
}

export function NumericReadout({ label, value, unit }: NumericReadoutProps) {
    const formatted = formatValue(value);

    return (
        <div class={css.card}>
            <span class={css.label}>{label}</span>
            {formatted !== null ? (
                <span class={css.value}>
                    {formatted}
                    {unit && <span class={css.unit}>{unit}</span>}
                </span>
            ) : (
                <span class={css.empty}>—</span>
            )}
        </div>
    );
}
