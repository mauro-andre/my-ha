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

export const subsectionTitle = style({
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    color: vars.color.textMuted,
    marginTop: vars.space.md,
    marginBottom: vars.space.sm,
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

export const daysRow = style({
    display: "flex",
    gap: vars.space.xs,
    flexWrap: "wrap",
});

export const dayChip = style({
    padding: `${vars.space.xs} ${vars.space.sm}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    cursor: "pointer",
    border: `0.0625rem solid ${vars.color.border}`,
    backgroundColor: vars.color.bgSurface,
    color: vars.color.textMuted,
    transition: "all 0.15s",
    fontWeight: 500,
});

export const dayChipActive = style({
    backgroundColor: vars.color.primary,
    color: vars.color.primaryText,
    borderColor: vars.color.primary,
});

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

export const editingLabel = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.primary,
    fontWeight: 600,
    marginBottom: vars.space.xs,
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

export const checkboxRow = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.sm,
    marginBottom: vars.space.md,
});

export const checkbox = style({
    width: "1.25rem",
    height: "1.25rem",
    accentColor: vars.color.primary,
    cursor: "pointer",
});

export const checkboxLabel = style({
    fontSize: vars.fontSize.md,
    cursor: "pointer",
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
