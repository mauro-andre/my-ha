import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";
import { scrollY } from "../styles/scroll.css.js";

export const layout = style({
    height: "100svh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    "@media": {
        "(min-width: 48rem)": {
            flexDirection: "row",
        },
    },
});

export const sidebar = style({
    backgroundColor: vars.color.bgSurface,
    borderTop: `0.0625rem solid ${vars.color.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: vars.space.xs,
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    "@media": {
        "(min-width: 48rem)": {
            position: "static",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            width: "15rem",
            minWidth: "15rem",
            borderTop: "none",
            borderRight: `0.0625rem solid ${vars.color.border}`,
            padding: vars.space.md,
            gap: vars.space.sm,
            minHeight: "100vh",
        },
    },
});

export const logo = style({
    display: "none",
    "@media": {
        "(min-width: 48rem)": {
            display: "block",
            fontSize: vars.fontSize.lg,
            fontWeight: 700,
            padding: `${vars.space.sm} 0`,
            marginBottom: vars.space.sm,
        },
    },
});

export const nav = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    "@media": {
        "(min-width: 48rem)": {
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            gap: vars.space.xs,
            flex: 1,
        },
    },
});

export const navLink = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.125rem",
    padding: vars.space.sm,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
        color: vars.color.text,
    },
    "@media": {
        "(min-width: 48rem)": {
            flexDirection: "row",
            justifyContent: "flex-start",
            gap: vars.space.sm,
            padding: `${vars.space.sm} ${vars.space.md}`,
            fontSize: vars.fontSize.md,
        },
    },
});

export const navLabel = style({
    "@media": {
        "(min-width: 48rem)": {
            display: "inline",
        },
    },
});

export const navLinkActive = style({
    backgroundColor: vars.color.bgSurfaceHover,
    color: vars.color.text,
    fontWeight: 600,
});

export const userInfo = style({
    display: "none",
    flexDirection: "column",
    gap: "0.125rem",
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderTop: `0.0625rem solid ${vars.color.border}`,
    "@media": {
        "(min-width: 48rem)": {
            display: "flex",
        },
    },
});

export const userName = style({
    fontSize: vars.fontSize.sm,
    fontWeight: 600,
    color: vars.color.text,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
});

export const userEmail = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
});

export const clock = style({
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    color: vars.color.text,
    marginTop: vars.space.xs,
    fontVariantNumeric: "tabular-nums",
});

export const actionsRow = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
});

export const themeButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vars.space.sm,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
        color: vars.color.text,
    },
});

export const mainScroll = scrollY();

export const main = style({
    flex: 1,
    padding: vars.space.md,
    paddingBottom: "4rem",
    "@media": {
        "(min-width: 48rem)": {
            padding: vars.space.lg,
            paddingBottom: vars.space.lg,
        },
    },
});
