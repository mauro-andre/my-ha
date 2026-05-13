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

export const inputWrap = style({
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    flexShrink: 0,
});

export const input = style({
    width: "5rem",
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    backgroundColor: vars.color.bgSurfaceHover,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.xs} ${vars.space.sm}`,
    color: vars.color.text,
    outline: "none",
    textAlign: "right",
    ":focus": {
        borderColor: vars.color.primary,
    },
});

export const inputPending = style({
    borderColor: vars.color.warning,
});

export const unit = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    fontWeight: 500,
});
