import { style, globalStyle } from "@vanilla-extract/css";
import { vars } from "./theme.css.js";

export const scrollY = (
    showScrollbar = true,
    scrollbarWidth = "0.25rem",
    spacing = "0.25rem",
) => {
    if (!showScrollbar) {
        const cls = style({
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
        });

        globalStyle(`${cls}::-webkit-scrollbar`, {
            display: "none",
        });

        return cls;
    }

    const cls = style({
        overflowY: "auto",
    });

    globalStyle(`${cls}::-webkit-scrollbar`, {
        width: scrollbarWidth,
    });

    globalStyle(`${cls}::-webkit-scrollbar-track`, {
        background: "transparent",
    });

    globalStyle(`${cls}::-webkit-scrollbar-thumb`, {
        backgroundColor: vars.color.border,
        borderRadius: `calc(${scrollbarWidth} / 2)`,
        transition: "background-color 0.3s ease",
    });

    globalStyle(`${cls}::-webkit-scrollbar-thumb:hover`, {
        backgroundColor: vars.color.textMuted,
    });

    return cls;
};
