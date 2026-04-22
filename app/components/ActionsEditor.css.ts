import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const itemCard = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.sm,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: vars.space.md,
    marginBottom: vars.space.sm,
    cursor: "pointer",
    transition: "border-color 0.15s",
    ":hover": {
        borderColor: vars.color.textMuted,
    },
});

export const itemCardEditing = style({
    borderColor: vars.color.primary,
});

export const itemInfo = style({
    flex: 1,
    fontSize: vars.fontSize.sm,
});

export const deleteButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.25rem",
    borderRadius: vars.radius.sm,
    color: vars.color.danger,
    flexShrink: 0,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

export const editingLabel = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.primary,
    fontWeight: 600,
    marginBottom: vars.space.xs,
});

export const addForm = style({
    marginTop: vars.space.lg,
    padding: vars.space.md,
    border: `0.0625rem dashed ${vars.color.border}`,
    borderRadius: vars.radius.md,
    backgroundColor: vars.color.bg,
    display: "flex",
    flexDirection: "column",
    gap: vars.space.sm,
});

export const addFormTitle = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
});

export const inputGroup = style({
    display: "flex",
    flexDirection: "column",
    gap: vars.space.xs,
});

export const row = style({
    display: "flex",
    gap: vars.space.sm,
    alignItems: "center",
    flexWrap: "wrap",
});

export const fieldSmall = style({
    flex: 1,
    minWidth: "6rem",
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

export const addButton = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.primary,
    backgroundColor: "transparent",
    border: `0.0625rem dashed ${vars.color.border}`,
    cursor: "pointer",
    ":hover": {
        borderColor: vars.color.primary,
    },
});

export const cancelEditButton = style({
    display: "flex",
    alignItems: "center",
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    backgroundColor: vars.color.bgSurfaceHover,
    ":hover": {
        color: vars.color.text,
    },
});
