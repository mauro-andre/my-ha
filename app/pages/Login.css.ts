import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const page = style({
    minHeight: "100svh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vars.space.md,
    backgroundColor: vars.color.bg,
});

export const card = style({
    width: "100%",
    maxWidth: "24rem",
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    padding: vars.space.xl,
    display: "flex",
    flexDirection: "column",
    gap: vars.space.md,
});

export const title = style({
    fontSize: vars.fontSize.xl,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: vars.space.sm,
});

export const inputGroup = style({
    display: "flex",
    flexDirection: "column",
    gap: vars.space.xs,
});

export const inputLabel = style({
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
});

export const input = style({
    fontSize: vars.fontSize.md,
    backgroundColor: vars.color.bg,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.sm} ${vars.space.md}`,
    color: vars.color.text,
    outline: "none",
    ":focus": {
        borderColor: vars.color.primary,
    },
});

export const submitButton = style({
    padding: `${vars.space.md} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    backgroundColor: vars.color.primary,
    color: vars.color.primaryText,
    marginTop: vars.space.sm,
    ":hover": {
        backgroundColor: vars.color.primaryHover,
    },
    selectors: {
        "&:disabled": {
            opacity: "0.6",
            cursor: "not-allowed",
        },
    },
});

export const error = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.danger,
    textAlign: "center",
});
