import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const pageTitle = style({
    fontSize: "clamp(1.25rem, 3vw, 2rem)",
    fontWeight: 700,
    marginBottom: vars.space.lg,
});

export const list = style({
    display: "flex",
    flexDirection: "column",
    gap: vars.space.sm,
});

export const card = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: vars.space.md,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    padding: vars.space.md,
    "@media": {
        "(min-width: 48rem)": {
            flexDirection: "row",
        },
    },
});

export const deviceImage = style({
    width: "3rem",
    height: "3rem",
    objectFit: "contain",
    flexShrink: 0,
});

export const deviceImageFallback = style({
    width: "3rem",
    height: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: vars.color.bgSurfaceHover,
    borderRadius: vars.radius.md,
    color: vars.color.textMuted,
    flexShrink: 0,
});

export const deviceInfo = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.125rem",
    flex: 1,
    minWidth: 0,
    "@media": {
        "(min-width: 48rem)": {
            alignItems: "flex-start",
        },
    },
});

export const deviceName = style({
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
});

export const deviceMeta = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
});

export const deviceArea = style({
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
