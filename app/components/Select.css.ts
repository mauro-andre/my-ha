import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const wrapper = style({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
});

export const select = style({
    appearance: "none",
    fontSize: vars.fontSize.md,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.sm} ${vars.space.xl} ${vars.space.sm} ${vars.space.md}`,
    color: vars.color.text,
    outline: "none",
    cursor: "pointer",
    width: "100%",
    transition: "border-color 0.15s",
    ":focus": {
        borderColor: vars.color.primary,
    },
    ":hover": {
        borderColor: vars.color.textMuted,
    },
});

export const selectSmall = style({
    fontSize: vars.fontSize.sm,
    padding: `${vars.space.xs} ${vars.space.lg} ${vars.space.xs} ${vars.space.sm}`,
});

export const arrow = style({
    position: "absolute",
    right: vars.space.sm,
    pointerEvents: "none",
    color: vars.color.textMuted,
    display: "flex",
    alignItems: "center",
});
