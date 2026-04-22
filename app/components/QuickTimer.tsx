import { signal, useSignal } from "@preact/signals";
import { useCallback, useEffect } from "preact/hooks";
import { Select } from "./Select.js";
import { action_createQuickTimer, action_cancelQuickTimer, action_getActiveTimers } from "../layouts/MainLayout.js";
import type { Action } from "../modules/actions/action.schemas.js";
import * as css from "./QuickTimer.css.js";

interface QuickTimerProps {
    actionKey: string;
    valueOptions: Array<{ value: string; label: string }>;
    buildAction?: (value: string) => Action;
    sceneId?: string;
    label: string;
}

interface ActiveTimerInfo {
    id: string;
    value: string;
    executeAt: string;
}

// --- Global timer store (shared between QuickTimer and TimerBadge) ---

const timerStore = signal<Record<string, ActiveTimerInfo>>({});
let storeLoaded = false;

async function loadTimerStore() {
    if (typeof window === "undefined") return;
    const result = await action_getActiveTimers({ body: {} }) as any;
    const store: Record<string, ActiveTimerInfo> = {};
    for (const t of result.timers ?? []) {
        store[t.actionKey] = { id: t.id, value: t.value, executeAt: t.executeAt };
    }
    timerStore.value = store;
    storeLoaded = true;
}

function setTimer(actionKey: string, info: ActiveTimerInfo) {
    timerStore.value = { ...timerStore.value, [actionKey]: info };
}

function clearTimer(actionKey: string) {
    const next = { ...timerStore.value };
    delete next[actionKey];
    timerStore.value = next;
}

// --- Helpers ---

const PRESETS = [
    { label: "1m", seconds: 60 },
    { label: "5m", seconds: 300 },
    { label: "10m", seconds: 600 },
    { label: "15m", seconds: 900 },
    { label: "30m", seconds: 1800 },
    { label: "45m", seconds: 2700 },
    { label: "1h", seconds: 3600 },
];

function formatCountdown(ms: number): string {
    if (ms <= 0) return "expired";
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
    if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
    return `${seconds}s`;
}

// --- Countdown component ---

function CountdownDisplay({ executeAt }: { executeAt: string }) {
    const remaining = useSignal("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const update = () => {
            const ms = new Date(executeAt).getTime() - Date.now();
            remaining.value = ms > 0 ? formatCountdown(ms) : "expired";
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [executeAt]);

    return <span class={css.countdown}>{remaining.value}</span>;
}

// --- QuickTimer (inside modal) ---

export function QuickTimer({ actionKey, valueOptions, buildAction, sceneId, label }: QuickTimerProps) {
    const expanded = useSignal(false);
    const selectedValue = useSignal(valueOptions[0]?.value ?? "");
    const mode = useSignal<"timer" | "schedule">("timer");
    const selectedPreset = useSignal<number | null>(null);
    const scheduleTime = useSignal("23:00");

    useEffect(() => {
        if (!storeLoaded) loadTimerStore();
    }, []);

    const activeTimer = timerStore.value[actionKey] ?? null;

    const handleSet = useCallback(async () => {
        const name = `${label} → ${selectedValue.value}`;

        const result = await action_createQuickTimer({
            body: {
                name,
                mode: mode.value,
                timerSeconds: mode.value === "timer" ? selectedPreset.value! : undefined,
                scheduleTime: mode.value === "schedule" ? scheduleTime.value : undefined,
                action: buildAction ? buildAction(selectedValue.value) : undefined,
                sceneId,
            },
        }) as any;

        if (result.ok) {
            const executeAt = result.executeAt ?? new Date(Date.now() + (selectedPreset.value ?? 0) * 1000).toISOString();
            setTimer(actionKey, { id: result.id, value: selectedValue.value, executeAt });
            expanded.value = false;
        }
    }, [actionKey, buildAction, sceneId, label]);

    const handleCancel = useCallback(async () => {
        if (!activeTimer) return;
        await action_cancelQuickTimer({ body: { id: activeTimer.id } });
        clearTimer(actionKey);
    }, [actionKey, activeTimer]);

    // Active timer view
    if (activeTimer) {
        return (
            <div class={css.activeTimer}>
                <div>
                    <span class={css.actionLabel}>{activeTimer.value} in </span>
                    <CountdownDisplay executeAt={activeTimer.executeAt} />
                </div>
                <button class={css.cancelButton} onClick={handleCancel}>
                    Cancel
                </button>
            </div>
        );
    }

    // Collapsed
    if (!expanded.value) {
        return (
            <button class={css.expandButton} onClick={() => { expanded.value = true; }}>
                Timer
            </button>
        );
    }

    // Expanded
    return (
        <div class={css.container}>
            {valueOptions.length > 1 && (
                <div class={css.row}>
                    <Select
                        options={valueOptions}
                        value={selectedValue.value}
                        onChange={(v) => { selectedValue.value = v; }}
                        size="small"
                    />
                </div>
            )}

            <div class={css.modeRow}>
                <button
                    class={`${css.modeButton} ${mode.value === "timer" ? css.modeButtonActive : ""}`}
                    onClick={() => { mode.value = "timer"; }}
                >
                    Timer
                </button>
                <button
                    class={`${css.modeButton} ${mode.value === "schedule" ? css.modeButtonActive : ""}`}
                    onClick={() => { mode.value = "schedule"; }}
                >
                    Schedule
                </button>
            </div>

            {mode.value === "timer" && (
                <div class={css.presets}>
                    {PRESETS.map((p) => (
                        <button
                            key={p.seconds}
                            class={`${css.presetButton} ${selectedPreset.value === p.seconds ? css.presetActive : ""}`}
                            onClick={() => { selectedPreset.value = p.seconds; }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            )}

            {mode.value === "schedule" && (
                <input
                    type="time"
                    class={css.timeInput}
                    value={scheduleTime.value}
                    onInput={(e) => { scheduleTime.value = (e.target as HTMLInputElement).value; }}
                />
            )}

            <button
                class={css.setButton}
                onClick={handleSet}
                disabled={mode.value === "timer" && !selectedPreset.value}
            >
                Set
            </button>
        </div>
    );
}

// --- TimerBadge (on card) ---

export function TimerBadge({ actionKey }: { actionKey: string }) {
    const display = useSignal("");
    const timerValue = useSignal("");

    useEffect(() => {
        if (!storeLoaded) loadTimerStore();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const update = () => {
            const timer = timerStore.value[actionKey];
            if (!timer) {
                display.value = "";
                timerValue.value = "";
                return;
            }
            const ms = new Date(timer.executeAt).getTime() - Date.now();
            if (ms <= 0) {
                clearTimer(actionKey);
                display.value = "";
                timerValue.value = "";
            } else {
                display.value = formatCountdown(ms);
                timerValue.value = timer.value;
            }
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [actionKey]);

    if (!display.value) return null;

    return (
        <span class={css.cardBadge}>
            <span class={css.cardBadgeValue}>{timerValue.value} in </span>
            <span class={css.cardBadgeTime}>{display.value}</span>
        </span>
    );
}
