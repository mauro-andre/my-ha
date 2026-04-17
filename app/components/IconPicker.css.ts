import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";
import { scrollY } from "../styles/scroll.css.js";

export const wrapper = style({
    position: "relative",
    width: "100%",
});

export const trigger = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.sm,
    width: "100%",
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.sm} ${vars.space.md}`,
    cursor: "pointer",
    transition: "border-color 0.15s",
    ":hover": {
        borderColor: vars.color.textMuted,
    },
});

export const triggerOpen = style({
    borderColor: vars.color.primary,
});

export const triggerIcon = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: vars.color.text,
});

export const triggerPlaceholder = style({
    color: vars.color.textMuted,
    fontSize: vars.fontSize.sm,
});

export const triggerLabel = style({
    fontSize: vars.fontSize.sm,
    flex: 1,
});

export const dropdown = style({
    position: "fixed",
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.md,
    zIndex: 300,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
});

export const searchInput = style({
    fontSize: vars.fontSize.sm,
    backgroundColor: vars.color.bg,
    border: "none",
    borderBottom: `0.0625rem solid ${vars.color.border}`,
    padding: `${vars.space.sm} ${vars.space.md}`,
    color: vars.color.text,
    outline: "none",
    width: "100%",
});

export const gridScroll = scrollY();

export const gridWrapper = style({
    maxHeight: "15rem",
});

export const grid = style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(2.5rem, 1fr))",
    gap: "0.125rem",
    padding: vars.space.sm,
});

export const iconCell = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vars.space.sm,
    borderRadius: vars.radius.sm,
    cursor: "pointer",
    color: vars.color.textMuted,
    transition: "background-color 0.1s, color 0.1s",
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
        color: vars.color.text,
    },
});

export const iconCellSelected = style({
    backgroundColor: vars.color.bgSurfaceHover,
    color: vars.color.primary,
});

export const emptyState = style({
    padding: vars.space.md,
    textAlign: "center",
    color: vars.color.textMuted,
    fontSize: vars.fontSize.sm,
});
