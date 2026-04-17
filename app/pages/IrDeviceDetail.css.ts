import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css.js";

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

export const header = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.md,
    marginBottom: vars.space.xl,
});

export const headerIcon = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "4rem",
    height: "4rem",
    backgroundColor: vars.color.bgSurface,
    borderRadius: vars.radius.lg,
    color: vars.color.textMuted,
    flexShrink: 0,
});

export const headerInfo = style({
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
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

export const sectionHeader = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: vars.space.md,
});

export const sectionTitle = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
});

export const addButton = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
    padding: `${vars.space.sm} ${vars.space.md}`,
    backgroundColor: vars.color.primary,
    color: vars.color.primaryText,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    fontWeight: 500,
    ":hover": {
        backgroundColor: vars.color.primaryHover,
    },
});

export const commandList = style({
    display: "flex",
    flexDirection: "column",
    gap: vars.space.sm,
});

export const addBlasterRow = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.sm,
    marginTop: vars.space.sm,
});

export const commandCard = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.md,
    backgroundColor: vars.color.bgSurface,
    border: `0.0625rem solid ${vars.color.border}`,
    borderRadius: vars.radius.lg,
    padding: vars.space.md,
});

export const commandInfo = style({
    flex: 1,
    minWidth: 0,
});

export const commandNameRow = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
});

export const commandName = style({
    fontSize: vars.fontSize.md,
    fontWeight: 600,
});

export const commandNameInput = style({
    fontSize: vars.fontSize.md,
    fontWeight: 600,
    backgroundColor: vars.color.bg,
    border: `0.0625rem solid ${vars.color.primary}`,
    borderRadius: vars.radius.md,
    padding: `${vars.space.xs} ${vars.space.sm}`,
    color: vars.color.text,
    outline: "none",
    width: "100%",
    maxWidth: "16rem",
});

export const commandCode = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "20rem",
});

export const commandActions = style({
    display: "flex",
    alignItems: "center",
    gap: vars.space.xs,
    flexShrink: 0,
});

export const actionButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vars.space.sm,
    borderRadius: vars.radius.md,
    color: vars.color.textMuted,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
        color: vars.color.text,
    },
});

export const sendButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vars.space.sm,
    borderRadius: vars.radius.md,
    color: vars.color.primary,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

export const deleteButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: vars.space.sm,
    borderRadius: vars.radius.md,
    color: vars.color.danger,
    ":hover": {
        backgroundColor: vars.color.bgSurfaceHover,
    },
});

export const blasterSelect = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    backgroundColor: vars.color.bgSurfaceHover,
    border: "none",
    borderRadius: vars.radius.sm,
    padding: `0.125rem ${vars.space.xs}`,
    outline: "none",
});

export const emptyState = style({
    textAlign: "center",
    padding: vars.space.xl,
    color: vars.color.textMuted,
    fontSize: vars.fontSize.md,
});

// Learning modal

export const overlay = style({
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: vars.space.md,
});

export const modal = style({
    backgroundColor: vars.color.bgSurface,
    borderRadius: vars.radius.lg,
    padding: vars.space.lg,
    width: "100%",
    maxWidth: "28rem",
    display: "flex",
    flexDirection: "column",
    gap: vars.space.md,
});

export const modalTitle = style({
    fontSize: vars.fontSize.lg,
    fontWeight: 600,
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

export const learnButton = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: vars.space.sm,
    padding: `${vars.space.sm} ${vars.space.md}`,
    backgroundColor: vars.color.warning,
    color: "#1a1d27",
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    fontWeight: 600,
    ":hover": {
        opacity: "0.9",
    },
});

export const learningStatus = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.warning,
    textAlign: "center",
    fontWeight: 500,
});

export const codePreview = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.success,
    backgroundColor: vars.color.bg,
    borderRadius: vars.radius.md,
    padding: vars.space.sm,
    wordBreak: "break-all",
    maxHeight: "4rem",
    overflow: "hidden",
});

export const modalActions = style({
    display: "flex",
    gap: vars.space.sm,
    justifyContent: "flex-end",
});

export const cancelButton = style({
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    backgroundColor: vars.color.bgSurfaceHover,
    ":hover": {
        color: vars.color.text,
    },
});

export const saveButton = style({
    padding: `${vars.space.sm} ${vars.space.md}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSize.sm,
    color: vars.color.primaryText,
    backgroundColor: vars.color.primary,
    fontWeight: 500,
    ":hover": {
        backgroundColor: vars.color.primaryHover,
    },
    selectors: {
        "&:disabled": {
            opacity: "0.4",
            cursor: "not-allowed",
        },
        "&:disabled:hover": {
            backgroundColor: vars.color.primary,
        },
    },
});
