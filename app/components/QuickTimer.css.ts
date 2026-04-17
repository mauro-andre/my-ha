import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const expandButton = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.03rem",
    fontWeight: 600,
    padding: `${vars.space.sm} 0`,
    width: "100%",
    textAlign: "center",
    borderTop: `0.0625rem solid ${vars.color.border}`,
    ":hover": {
        color: vars.color.text,
    },
});

export const container = style({
    display: "flex",
    flexDirection: "column",
    gap: vars.space.md,
    borderTop: `0.0625rem solid ${vars.color.border}`,
    paddingTop: vars.space.md,
    width: "100%",
});

export const modeRow = style({
    display: "flex",
    gap: vars.space.xs,
});

export const modeButton = style({
    flex: 1,
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    textAlign: "center",
    backgroundColor: vars.color.bgSurfaceHover,
    color: vars.color.textMuted,
    ":hover": {
        color: vars.color.text,
    },
});

export const modeButtonActive = style({
    backgroundColor: vars.color.primary,
    color: vars.color.primaryText,
});

export const row = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.sm,
    flexWrap: "wrap",
});

export const presets = style({
    display: "flex",
    gap: vars.space.xs,
    flexWrap: "wrap",
    justifyContent: "center",
});

export const presetButton = style({
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    backgroundColor: vars.color.bgSurfaceHover,
    color: vars.color.text,
    ":hover": {
        backgroundColor: vars.color.primary,
        color: vars.color.primaryText,
    },
});

export const presetActive = style({
    backgroundColor: vars.color.primary,
    color: vars.color.primaryText,
});

export const timeInput = style({
    fontSize: vars.fontSize.md,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.sm} ${vars.space.md}`,
    color: vars.color.text,
    outline: "none",
    width: "100%",
    textAlign: "center",
    ":focus": {
        borderColor: vars.color.primary,
    },
});

export const setButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    backgroundColor: vars.color.primary,
    color: vars.color.primaryText,
    width: "100%",
    ":hover": {
        backgroundColor: vars.color.primaryHover,
    },
    selectors: {
        "&:disabled": {
            opacity: "0.4",
            cursor: "not-allowed",
        },
    },
});

export const activeTimer = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: `0.0625rem solid ${vars.color.border}`,
    paddingTop: vars.space.md,
    width: "100%",
});

export const countdown = style({
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    color: vars.color.warning,
    fontVariantNumeric: "tabular-nums",
});

export const cancelButton = style({
    padding: `${vars.space.xs} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.danger,
    backgroundColor: "transparent",
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

export const actionLabel = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
});

// Badge on card
export const cardBadge = style({
    fontSize: vars.fontSize.xs,
    fontWeight: 600,
    color: vars.color.warning,
    fontVariantNumeric: "tabular-nums",
});
