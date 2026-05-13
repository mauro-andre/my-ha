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

export const label = style({
    fontSize: vars.fontSize.md,
    fontWeight: 500,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
});

export const selectWrap = style({
    minWidth: "8rem",
    flexShrink: 0,
});
