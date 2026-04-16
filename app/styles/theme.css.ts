import { createThemeContract, createTheme, globalStyle } from "@vanilla-extract/css";

export const vars = createThemeContract({
    color: {
        bg: null,
        bgSurface: null,
        bgSurfaceHover: null,
        text: null,
        textMuted: null,
        primary: null,
        primaryHover: null,
        primaryText: null,
        success: null,
        danger: null,
        warning: null,
        border: null,
        borderMuted: null,
    },
    space: {
        xs: null,
        sm: null,
        md: null,
        lg: null,
        xl: null,
        xxl: null,
    },
    radius: {
        sm: null,
        md: null,
        lg: null,
    },
    fontSize: {
        xs: null,
        sm: null,
        md: null,
        lg: null,
        xl: null,
        xxl: null,
    },
    shadow: {
        sm: null,
        md: null,
    },
});

export const darkTheme = createTheme(vars, {
    color: {
        bg: "#0f1117",
        bgSurface: "#1a1d27",
        bgSurfaceHover: "#22252f",
        text: "#e1e4ed",
        textMuted: "#8b8fa3",
        primary: "#6c8cff",
        primaryHover: "#5a7aee",
        primaryText: "#ffffff",
        success: "#4ade80",
        danger: "#f87171",
        warning: "#fbbf24",
        border: "#2a2d37",
        borderMuted: "#22252f",
    },
    space: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        xxl: "3rem",
    },
    radius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
    },
    fontSize: {
        xs: "0.6875rem",
        sm: "0.8125rem",
        md: "0.9375rem",
        lg: "1.125rem",
        xl: "1.5rem",
        xxl: "2rem",
    },
    shadow: {
        sm: "0 0.0625rem 0.125rem rgba(0,0,0,0.3)",
        md: "0 0.25rem 0.75rem rgba(0,0,0,0.4)",
    },
});

export const lightTheme = createTheme(vars, {
    color: {
        bg: "#f5f6fa",
        bgSurface: "#ffffff",
        bgSurfaceHover: "#f0f1f5",
        text: "#1a1d27",
        textMuted: "#6b7085",
        primary: "#4c6ef5",
        primaryHover: "#3b5de4",
        primaryText: "#ffffff",
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
        border: "#c8cbd4",
        borderMuted: "#e2e4ea",
    },
    space: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        xxl: "3rem",
    },
    radius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
    },
    fontSize: {
        xs: "0.6875rem",
        sm: "0.8125rem",
        md: "0.9375rem",
        lg: "1.125rem",
        xl: "1.5rem",
        xxl: "2rem",
    },
    shadow: {
        sm: "0 0.0625rem 0.125rem rgba(0,0,0,0.08)",
        md: "0 0.25rem 0.75rem rgba(0,0,0,0.12)",
    },
});

globalStyle("html, body", {
    backgroundColor: vars.color.bg,
    color: vars.color.text,
    fontFamily: "system-ui, -apple-system, sans-serif",
    lineHeight: 1.6,
    margin: 0,
    padding: 0,
});

globalStyle("*, *::before, *::after", {
    boxSizing: "border-box",
});
