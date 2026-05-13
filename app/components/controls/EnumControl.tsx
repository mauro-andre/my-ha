import { useCallback } from "preact/hooks";
import { Select } from "../Select.js";
import * as css from "./EnumControl.css.js";

interface EnumControlProps {
    label: string;
    property: string;
    value: unknown;
    values: string[];
    onCommand: (property: string, value: unknown) => void;
}

export function EnumControl({ label, property, value, values, onCommand }: EnumControlProps) {
    const current = typeof value === "string" ? value : "";

    const handleChange = useCallback((v: string) => {
        if (v !== current) onCommand(property, v);
    }, [property, current, onCommand]);

    return (
        <div class={css.card}>
            <span class={css.label}>{label}</span>
            <div class={css.selectWrap}>
                <Select
                    options={values.map((v) => ({ value: v, label: v }))}
                    value={current}
                    onChange={handleChange}
                    size="small"
                />
            </div>
        </div>
    );
}
