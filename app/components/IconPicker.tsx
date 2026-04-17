import { useSignal } from "@preact/signals";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { searchIcons, getIcon } from "./icon-registry.js";
import { ChevronDown } from "./icons.js";
import * as css from "./IconPicker.css.js";

interface IconPickerProps {
    value?: string;
    onChange?: (iconName: string) => void;
    placeholder?: string;
}

export function IconPicker({ value, onChange, placeholder = "Select icon..." }: IconPickerProps) {
    const open = useSignal(false);
    const query = useSignal("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const results = searchIcons(query.value);
    const SelectedIcon = value ? getIcon(value) : null;

    const handleSelect = useCallback((name: string) => {
        onChange?.(name);
        open.value = false;
        query.value = "";
    }, [onChange]);

    useEffect(() => {
        if (!open.value) return;

        if (triggerRef.current && dropdownRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            dropdownRef.current.style.top = `${rect.bottom + 4}px`;
            dropdownRef.current.style.left = `${rect.left}px`;
            dropdownRef.current.style.width = `${Math.max(rect.width, 280)}px`;
        }

        setTimeout(() => searchRef.current?.focus(), 0);

        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                open.value = false;
                query.value = "";
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
        <div ref={wrapperRef} class={css.wrapper}>
            <button
                ref={triggerRef}
                class={`${css.trigger} ${open.value ? css.triggerOpen : ""}`}
                onClick={() => { open.value = !open.value; }}
                type="button"
            >
                {SelectedIcon ? (
                    <>
                        <span class={css.triggerIcon}><SelectedIcon size={24} /></span>
                        <span class={css.triggerLabel}>{value}</span>
                    </>
                ) : (
                    <span class={css.triggerPlaceholder}>{placeholder}</span>
                )}
                <ChevronDown size={14} />
            </button>

            {open.value && (
                <div ref={dropdownRef} class={css.dropdown}>
                    <input
                        ref={searchRef}
                        class={css.searchInput}
                        placeholder="Search icons..."
                        value={query.value}
                        onInput={(e) => { query.value = (e.target as HTMLInputElement).value; }}
                    />
                    <div class={`${css.gridScroll} ${css.gridWrapper}`}>
                        {results.length === 0 ? (
                            <div class={css.emptyState}>No icons found</div>
                        ) : (
                            <div class={css.grid}>
                                {results.map((entry) => (
                                    <div
                                        key={entry.name}
                                        class={`${css.iconCell} ${entry.name === value ? css.iconCellSelected : ""}`}
                                        onClick={() => handleSelect(entry.name)}
                                        title={entry.name}
                                    >
                                        <entry.component size={22} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
