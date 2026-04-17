import { useSignal } from "@preact/signals";
import { useCallback, useEffect, useRef } from "preact/hooks";
import type { ComponentType } from "preact";
import { ChevronDown } from "./icons.js";
import * as css from "./Select.css.js";

interface SelectOption {
    value: string;
    label: string;
    icon?: ComponentType<{ size?: number }>;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    size?: "default" | "small";
    class?: string;
}

export function Select({ options, value, onChange, placeholder = "Select...", size = "default", class: className }: SelectProps) {
    const open = useSignal(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    const handleSelect = useCallback((optionValue: string) => {
        onChange?.(optionValue);
        open.value = false;
    }, [onChange]);

    // Position dropdown and close on click outside
    useEffect(() => {
        if (!open.value) return;

        const positionDropdown = () => {
            if (!triggerRef.current || !dropdownRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            const dropdownHeight = dropdownRef.current.offsetHeight;
            const spaceBelow = window.innerHeight - rect.bottom;
            const openAbove = spaceBelow < dropdownHeight && rect.top > spaceBelow;

            dropdownRef.current.style.left = `${rect.left}px`;
            dropdownRef.current.style.width = `${rect.width}px`;

            if (openAbove) {
                dropdownRef.current.style.top = "";
                dropdownRef.current.style.bottom = `${window.innerHeight - rect.top + 4}px`;
            } else {
                dropdownRef.current.style.bottom = "";
                dropdownRef.current.style.top = `${rect.bottom + 4}px`;
            }
        };

        positionDropdown();

        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                open.value = false;
            }
        };

        const handleScroll = () => {
            positionDropdown();
        };

        document.addEventListener("mousedown", handleClick);
        window.addEventListener("scroll", handleScroll, true);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [open.value]);

    return (
        <div ref={wrapperRef} class={`${css.wrapper} ${className ?? ""}`}>
            <button
                ref={triggerRef}
                class={`${css.trigger} ${open.value ? css.triggerOpen : ""} ${size === "small" ? css.triggerSmall : ""}`}
                onClick={() => { open.value = !open.value; }}
                type="button"
            >
                {selected ? (
                    <span class={css.optionContent}>
                        {selected.icon && <selected.icon size={18} />}
                        {selected.label}
                    </span>
                ) : (
                    <span class={css.triggerPlaceholder}>{placeholder}</span>
                )}
                <span class={`${css.arrow} ${open.value ? css.arrowOpen : ""}`}>
                    <ChevronDown size={14} />
                </span>
            </button>

            {open.value && (
                <div ref={dropdownRef} class={css.dropdown}>
                    <div class={`${css.optionsList} ${css.optionsListInner}`}>
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                class={`${css.option} ${size === "small" ? css.optionSmall : ""} ${opt.value === value ? css.optionSelected : ""}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                <span class={css.optionContent}>
                                    {opt.icon && <opt.icon size={18} />}
                                    {opt.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export type { SelectOption };
