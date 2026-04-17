import { style, keyframes } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css.js";

export const card = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.md,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    padding: vars.space.md,
    cursor: "pointer",
    transition: "background-color 0.15s",
    flex: 1,
    minWidth: 0,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

const flash = keyframes({
    "0%": { backgroundColor: vars.color.primary },
    "100%": { backgroundColor: vars.color.bgSurfaceHover },
});

export const iconButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.75rem",
    height: "2.75rem",
    borderRadius: vars.radius.md,
    flexShrink: 0,
    backgroundColor: vars.color.bgSurfaceHover,
    color: vars.color.textMuted,
    transition: "background-color 0.15s, color 0.15s",
    ":hover": {
        backgroundColor: vars.color.primary,
        color: vars.color.primaryText,
    },
});

export const iconFired = style({
    animation: `${flash} 0.6s ease-out`,
});

export const label = style({
    fontSize: vars.fontSize.md,
    fontWeight: 500,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
});

// Modal

export const overlay = style({
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: vars.space.md,
});

export const modal = style({
    backgroundColor: vars.color.bgSurface,
    borderRadius: vars.radius.lg,
    padding: vars.space.lg,
    width: "100%",
    maxWidth: "24rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: vars.space.lg,
});

export const modalIcon = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "5rem",
    height: "5rem",
    borderRadius: "50%",
    backgroundColor: vars.color.bgSurfaceHover,
    color: vars.color.textMuted,
    cursor: "pointer",
    transition: "background-color 0.15s, color 0.15s",
    ":hover": {
        backgroundColor: vars.color.primary,
        color: vars.color.primaryText,
    },
});

export const modalIconFired = style({
    animation: `${flash} 0.6s ease-out`,
});

export const modalLabel = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
    textAlign: "center",
});

export const modalClose = style({
    padding: `${vars.space.sm} ${vars.space.lg}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    backgroundColor: vars.color.bgSurfaceHover,
    ":hover": {
        color: vars.color.text,
    },
});
