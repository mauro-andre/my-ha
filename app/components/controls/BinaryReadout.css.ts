import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css.js";

export const card = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.md,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    padding: vars.space.md,
});

export const statusDot = style({
    width: "0.75rem",
    height: "0.75rem",
    borderRadius: "50%",
    flexShrink: 0,
    transition: "background-color 0.15s",
});

export const dotOn = style({
    backgroundColor: vars.color.success,
    boxShadow: `0 0 0.5rem ${vars.color.success}`,
});

export const dotOff = style({
    backgroundColor: vars.color.border,
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

export const stateText = style({
    fontSize: vars.fontSize.sm,
    fontWeight: 600,
    flexShrink: 0,
});

export const stateOn = style({
    color: vars.color.success,
});

export const stateOff = style({
    color: vars.color.textMuted,
});
