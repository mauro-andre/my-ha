import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

export const header = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: vars.space.md,
    marginBottom: vars.space.xl,
    "@media": {
        "(min-width: 48rem)": {
            flexDirection: "row",
            alignItems: "flex-start",
        },
    },
});

export const deviceImage = style({
    width: "6rem",
    height: "6rem",
    objectFit: "contain",
    flexShrink: 0,
});

export const deviceImageFallback = style({
    width: "6rem",
    height: "6rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: vars.color.bgSurface,
    borderRadius: vars.radius.lg,
    color: vars.color.textMuted,
    flexShrink: 0,
});

export const headerInfo = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.125rem",
    "@media": {
        "(min-width: 48rem)": {
            alignItems: "flex-start",
        },
    },
});

export const nameRow = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.sm,
});

export const deviceName = style({
    fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
    fontWeight: 700,
});

export const editNameButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.25rem",
    borderRadius: vars.radius.sm,
    color: vars.color.textMuted,
    ":hover": {
        color: vars.color.text,
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

export const nameInput = style({
    fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
    fontWeight: 700,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.primary}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.xs} ${vars.space.sm}`,
    color: vars.color.text,
    outline: "none",
    width: "100%",
    maxWidth: "20rem",
});

export const deviceMeta = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
});

export const section = style({
    marginBottom: vars.space.lg,
});

export const sectionTitle = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
    marginBottom: vars.space.md,
});

export const controlsGrid = style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 16rem), 1fr))",
    gap: vars.space.sm,
});

export const infoGrid = style({
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: vars.space.sm,
    "@media": {
        "(min-width: 48rem)": {
            gridTemplateColumns: "1fr 1fr",
        },
    },
});

export const infoCard = style({
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: vars.space.md,
});

export const infoLabel = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.03rem",
    fontWeight: 600,
});

export const infoValue = style({
    fontSize: vars.fontSize.md,
    fontWeight: 500,
    wordBreak: "break-all",
});

export const stateGrid = style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 12rem), 1fr))",
    gap: vars.space.sm,
});

export const stateCard = style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.sm} ${vars.space.md}`,
});

export const stateProperty = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
});

export const stateValue = style({
    fontSize: vars.fontSize.sm,
    fontWeight: 600,
});

export const badgeOn = style({
    color: vars.color.success,
});

export const badgeOff = style({
    color: vars.color.textMuted,
});

export const backLink = style({
    display: "inline-flex",
    alignItems: "center",
    gap: vars.space.xs,
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    marginBottom: vars.space.md,
    ":hover": {
        color: vars.color.text,
    },
});
