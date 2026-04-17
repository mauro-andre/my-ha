import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const header = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: vars.space.lg,
});

export const pageTitle = style({
    fontSize: "clamp(1.25rem, 3vw, 2rem)",
    fontWeight: 700,
});

export const addButton = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
    padding: `${vars.space.sm} ${vars.space.md}`,
    backgroundColor: vars.color.primary,
    color: vars.color.primaryText,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    ":hover": {
        backgroundColor: vars.color.primaryHover,
    },
});

export const list = style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 14rem), 1fr))",
    gap: vars.space.sm,
});

export const card = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: vars.space.sm,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    padding: vars.space.lg,
    cursor: "pointer",
    transition: "background-color 0.15s",
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

export const cardIcon = style({
    color: vars.color.textMuted,
});

export const cardName = style({
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    textAlign: "center",
});

export const cardMeta = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
});

export const emptyState = style({
    textAlign: "center",
    padding: vars.space.xxl,
    color: vars.color.textMuted,
    fontSize: vars.fontSize.md,
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
    gap: vars.space.md,
});

export const modalTitle = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
});

export const nameRow = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.sm,
});

export const editNameButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.25rem",
    borderRadius: vars.radius.sm,
    color: vars.color.textMuted,
    ":hover": {
        color: vars.color.text,
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

export const inputGroup = style({
    display: "flex",
    flexDirection: "column",
    gap: vars.space.xs,
});

export const inputLabel = style({
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
});

export const input = style({
    fontSize: vars.fontSize.md,
    backgroundColor: vars.color.bg,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.sm} ${vars.space.md}`,
    color: vars.color.text,
    outline: "none",
    ":focus": {
        borderColor: vars.color.primary,
    },
});

export const modalActions = style({
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

export const saveButton = style({
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.primaryText,
    backgroundColor: vars.color.primary,
    fontWeight: 500,
    ":hover": {
        backgroundColor: vars.color.primaryHover,
    },
});

export const deleteButton = style({
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.danger,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
    },
});
