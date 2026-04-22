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

export const countdown = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.warning,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
});

export const cardActions = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
    flexShrink: 0,
});

export const toggleButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.5rem",
    height: "1.5rem",
    borderRadius: "0.75rem",
    transition: "background-color 0.15s",
    position: "relative",
    cursor: "pointer",
});

export const toggleOn = style({
    backgroundColor: vars.color.success,
});

export const toggleOff = style({
    backgroundColor: vars.color.border,
});

export const toggleDot = style({
    width: "1.125rem",
    height: "1.125rem",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    position: "absolute",
    transition: "left 0.15s",
});

export const toggleDotOn = style({
    left: "calc(100% - 1.3125rem)",
});

export const toggleDotOff = style({
    left: "0.1875rem",
});

export const editButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vars.space.sm,
    borderRadius: vars.radius.md,
    color: vars.color.textMuted,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
        color: vars.color.text,
    },
});

export const deleteButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vars.space.sm,
    borderRadius: vars.radius.md,
    color: vars.color.danger,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

export const badgeOneShot = style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: vars.fontSize.xs,
    padding: `0.125rem ${vars.space.sm}`,
    borderRadius: vars.radius.sm,
    backgroundColor: vars.color.warning,
    color: "#1a1d27",
    fontWeight: 600,
    marginLeft: vars.space.sm,
    verticalAlign: "middle",
});

export const badgeOrphan = style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: vars.fontSize.xs,
    padding: `0.125rem ${vars.space.sm}`,
    borderRadius: vars.radius.sm,
    backgroundColor: vars.color.danger,
    color: vars.color.primaryText,
    fontWeight: 600,
    marginLeft: vars.space.sm,
    verticalAlign: "middle",
});

export const emptyState = style({
    textAlign: "center",
    padding: vars.space.xxl,
    color: vars.color.textMuted,
    fontSize: vars.fontSize.md,
});
