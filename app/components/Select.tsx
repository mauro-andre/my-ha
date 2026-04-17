import type { Ref } from "preact";
import { ChevronDown } from "./icons.js";
import * as css from "./Select.css.js";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    selectRef?: Ref<HTMLSelectElement>;
    size?: "default" | "small";
    class?: string;
}

export function Select({ options, value, onChange, selectRef, size = "default", class: className }: SelectProps) {
    return (
        <div class={`${css.wrapper} ${className ?? ""}`}>
            <select
                ref={selectRef}
                class={`${css.select} ${size === "small" ? css.selectSmall : ""}`}
                value={value}
                onChange={(e) => onChange?.((e.target as HTMLSelectElement).value)}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <span class={css.arrow}>
                <ChevronDown size={14} />
            </span>
        </div>
    );
}
