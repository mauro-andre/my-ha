import { style, globalStyle } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";
import { scrollY } from "../styles/scroll.css.js";

export const wrapper = style({
    position: "relative",
    width: "100%",
});

export const trigger = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    fontSize: vars.fontSize.md,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.md} ${vars.space.md}`,
    color: vars.color.text,
    cursor: "pointer",
    transition: "border-color 0.15s",
    textAlign: "left",
    ":hover": {
        borderColor: vars.color.textMuted,
    },
});

export const triggerOpen = style({
    borderColor: vars.color.primary,
});

export const triggerSmall = style({
    fontSize: vars.fontSize.sm,
    padding: `${vars.space.sm} ${vars.space.md}`,
});

export const triggerPlaceholder = style({
    color: vars.color.textMuted,
});

export const arrow = style({
    color: vars.color.textMuted,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    marginLeft: vars.space.sm,
    transition: "transform 0.15s",
});

export const arrowOpen = style({
    transform: "rotate(180deg)",
});

export const dropdown = style({
    position: "fixed",
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.md,
    zIndex: 300,
    overflow: "hidden",
});

export const optionsList = scrollY();

export const optionsListInner = style({
    maxHeight: "15rem",
});

export const option = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `${vars.space.md} ${vars.space.md}`,
    fontSize: vars.fontSize.md,
    cursor: "pointer",
    transition: "background-color 0.1s",
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

export const optionSmall = style({
    padding: `${vars.space.sm} ${vars.space.md}`,
    fontSize: vars.fontSize.sm,
});

export const optionSelected = style({
    backgroundColor: vars.color.bgSurfaceHover,
    color: vars.color.primary,
    fontWeight: 600,
});
