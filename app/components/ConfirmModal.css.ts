import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const overlay = style({
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
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
    gap: vars.space.md,
});

export const title = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
});

export const message = style({
    fontSize: vars.fontSize.md,
    color: vars.color.textMuted,
    lineHeight: 1.5,
});

export const actions = style({
    display: "flex",
    gap: vars.space.sm,
    justifyContent: "flex-end",
});

export const cancelButton = style({
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    backgroundColor: vars.color.bgSurfaceHover,
    ":hover": {
        color: vars.color.text,
    },
});

export const confirmButton = style({
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.primaryText,
    backgroundColor: vars.color.danger,
    fontWeight: 500,
    ":hover": {
        opacity: "0.9",
    },
});
