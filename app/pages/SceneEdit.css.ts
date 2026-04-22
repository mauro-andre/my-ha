import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const backLink = style({
    display: "inline-flex",
    alignItems: "center",
    gap: vars.space.xs,
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    marginBottom: vars.space.md,
    ":hover": {
        color: vars.color.text,
    },
});

export const pageTitle = style({
    fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
    fontWeight: 700,
    marginBottom: vars.space.lg,
});

export const section = style({
    marginBottom: vars.space.lg,
});

export const sectionTitle = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
    marginBottom: vars.space.md,
});

export const inputGroup = style({
    display: "flex",
    flexDirection: "column",
    gap: vars.space.xs,
    marginBottom: vars.space.md,
});

export const inputLabel = style({
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
});

export const input = style({
    fontSize: vars.fontSize.md,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.sm} ${vars.space.md}`,
    color: vars.color.text,
    outline: "none",
    ":focus": {
        borderColor: vars.color.primary,
    },
});

export const actionsRow = style({
    display: "flex",
    gap: vars.space.sm,
    flexWrap: "wrap",
    marginTop: vars.space.xl,
});

export const saveButton = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
    padding: `${vars.space.md} ${vars.space.xl}`,
    backgroundColor: vars.color.primary,
    color: vars.color.primaryText,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    ":hover": {
        backgroundColor: vars.color.primaryHover,
    },
});

export const runButton = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
    padding: `${vars.space.md} ${vars.space.xl}`,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    color: vars.color.text,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    ":hover": {
        borderColor: vars.color.primary,
        color: vars.color.primary,
    },
});

export const deleteButton = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
    padding: `${vars.space.md} ${vars.space.xl}`,
    backgroundColor: "transparent",
    border: `0.0625rem solid ${vars.color.danger}`,
    color: vars.color.danger,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    marginLeft: "auto",
    ":hover": {
        backgroundColor: vars.color.danger,
        color: vars.color.primaryText,
    },
});
