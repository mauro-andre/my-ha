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
    position: "relative",
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

export const value = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    color: vars.color.text,
    flexShrink: 0,
});

export const unit = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    fontWeight: 500,
    marginLeft: "0.25rem",
});

export const empty = style({
    fontSize: vars.fontSize.md,
    color: vars.color.textMuted,
    fontStyle: "italic",
});
