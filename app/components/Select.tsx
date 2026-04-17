import { useSignal } from "@preact/signals";
import { useCallback, useEffect, useRef } from "preact/hooks";
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
    placeholder?: string;
    size?: "default" | "small";
    class?: string;
}

export function Select({ options, value, onChange, placeholder = "Select...", size = "default", class: className }: SelectProps) {
    const open = useSignal(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedLabel = options.find((o) => o.value === value)?.label;

    const handleSelect = useCallback((optionValue: string) => {
        onChange?.(optionValue);
        open.value = false;
    }, [onChange]);

    // Position dropdown and close on click outside
    useEffect(() => {
        if (!open.value) return;

        // Position the dropdown below the trigger
        if (triggerRef.current && dropdownRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            dropdownRef.current.style.top = `${rect.bottom + 4}px`;
            dropdownRef.current.style.left = `${rect.left}px`;
            dropdownRef.current.style.width = `${rect.width}px`;
        }

        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                open.value = false;
            }
        };

        const handleScroll = () => {
            if (triggerRef.current && dropdownRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                dropdownRef.current.style.top = `${rect.bottom + 4}px`;
                dropdownRef.current.style.left = `${rect.left}px`;
            }
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
                <span class={selectedLabel ? undefined : css.triggerPlaceholder}>
                    {selectedLabel ?? placeholder}
                </span>
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
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
