import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const pageTitle = style({
    fontSize: "clamp(1.25rem, 3vw, 2rem)",
    fontWeight: 700,
    marginBottom: vars.space.lg,
});

export const areaSection = style({
    marginBottom: vars.space.xxl,
    paddingBottom: vars.space.lg,
    borderBottom: `0.0625rem solid ${vars.color.borderMuted}`,
    selectors: {
        "&:last-child": {
            borderBottom: "none",
        },
    },
});

export const areaHeader = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.sm,
    marginBottom: vars.space.md,
});

export const areaIcon = style({
    color: vars.color.textMuted,
    display: "flex",
    alignItems: "center",
});

export const areaName = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
});

export const deviceGroup = style({
    marginBottom: vars.space.lg,
    marginLeft: vars.space.sm,
    selectors: {
        "&:last-child": {
            marginBottom: 0,
        },
    },
});

export const deviceHeader = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.sm,
    marginBottom: vars.space.sm,
});

export const deviceImage = style({
    width: "1.5rem",
    height: "1.5rem",
    objectFit: "contain",
    flexShrink: 0,
});

export const deviceName = style({
    fontSize: vars.fontSize.md,
    fontWeight: 500,
    color: vars.color.textMuted,
});

export const controlsGrid = style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 12rem), 1fr))",
    gap: vars.space.sm,
});

export const scenesRow = style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 12rem), 1fr))",
    gap: vars.space.sm,
    marginBottom: vars.space.lg,
});

export const globalScenes = style({
    marginBottom: vars.space.xxl,
    paddingBottom: vars.space.lg,
    borderBottom: `0.0625rem solid ${vars.color.borderMuted}`,
});

export const emptyState = style({
    textAlign: "center",
    padding: vars.space.xxl,
    color: vars.color.textMuted,
    fontSize: vars.fontSize.md,
});
