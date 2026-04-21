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
    display: "flex",
    flexDirection: "column",
    gap: vars.space.sm,
});

export const card = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.md,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    padding: vars.space.md,
});

export const cardIcon = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3rem",
    height: "3rem",
    backgroundColor: vars.color.bgSurfaceHover,
    borderRadius: vars.radius.md,
    color: vars.color.textMuted,
    flexShrink: 0,
});

export const cardInfo = style({
    flex: 1,
    minWidth: 0,
});

export const cardName = style({
    fontSize: vars.fontSize.md,
    fontWeight: 600,
});

export const cardMeta = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
});

export const cardArea = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
});

export const editButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vars.space.sm,
    borderRadius: vars.radius.md,
    color: vars.color.textMuted,
    flexShrink: 0,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
        color: vars.color.text,
    },
});

export const emptyState = style({
    textAlign: "center",
    padding: vars.space.xxl,
    color: vars.color.textMuted,
    fontSize: vars.fontSize.md,
});

// Create modal

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
    maxWidth: "28rem",
    display: "flex",
    flexDirection: "column",
    gap: vars.space.md,
});

export const modalTitle = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
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

export const select = style({
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
