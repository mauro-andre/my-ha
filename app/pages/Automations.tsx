import { Link } from "@mauroandre/velojs";
import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback, useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { Plus, Pencil, X } from "../components/icons.js";
import { ConfirmModal } from "../components/ConfirmModal.js";
import * as AutomationEdit from "./AutomationEdit.js";
import * as css from "./Automations.css.js";

interface AutomationItem {
    id: string;
    name: string;
    enabled: boolean;
    runOnce: boolean;
    triggerType: string;
    triggerSummary: string;
    nextRunAt: string | null;
    actionCount: number;
    lastTriggeredAt: string | null;
    triggerCount: number;
}

interface AutomationsData {
    automations: AutomationItem[];
}

function summarizeTrigger(trigger: any): string {
    switch (trigger.type) {
        case "timer": return `Timer: ${Math.round(trigger.seconds / 60)} min`;
        case "schedule": {
            const days = trigger.days.length === 7 ? "every day" :
                trigger.days.length === 0 ? "once" :
                trigger.days.join(", ");
            return `${trigger.time} (${days})`;
        }
        case "device_state": return `Device state: ${trigger.property} ${trigger.operator}`;
        default: return "Unknown";
    }
}

export const loader = async ({}: LoaderArgs) => {
    const { getAllAutomations, getNextScheduleDate } = await import("../modules/automations/automation.services.js");

    const automations = getAllAutomations();

    return {
        automations: automations.map((a) => ({
            id: a.id!,
            name: a.name,
            enabled: a.enabled,
            runOnce: a.runOnce,
            triggerType: a.trigger.type,
            triggerSummary: summarizeTrigger(a.trigger),
            nextRunAt: a.trigger.type === "timer"
                ? a.trigger.executeAt.toISOString()
                : a.trigger.type === "schedule"
                    ? getNextScheduleDate(a.trigger.time, a.trigger.days).toISOString()
                    : null,
            actionCount: a.actions.length + a.scenes.length,
            lastTriggeredAt: a.lastTriggeredAt ? new Date(a.lastTriggeredAt).toLocaleString() : null,
            triggerCount: a.triggerCount,
        })),
    } satisfies AutomationsData;
};

export const action_toggle = async ({ body }: ActionArgs<{ id: string }>) => {
    const { toggleAutomation } = await import("../modules/automations/automation.services.js");
    await toggleAutomation(body.id);
    return { ok: true };
};

export const action_delete = async ({ body }: ActionArgs<{ id: string }>) => {
    const { deleteAutomation } = await import("../modules/automations/automation.services.js");
    await deleteAutomation(body.id);
    return { ok: true };
};

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

function Countdown({ executeAt }: { executeAt: string }) {
    const remaining = useSignal("");

    useEffect(() => {
        if (typeof window === "undefined") return;

        const update = () => {
            const ms = new Date(executeAt).getTime() - Date.now();
            remaining.value = formatCountdown(ms);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [executeAt]);

    return <span>{remaining.value}</span>;
}


export const Component = () => {
    const { data, refetch } = useLoader<AutomationsData>();
    const deleteTarget = useSignal<string | null>(null);

    if (!data.value) return null;

    const { automations } = data.value;

    const handleToggle = useCallback(async (id: string) => {
        await action_toggle({ body: { id } });
        refetch();
    }, [refetch]);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget.value) return;
        await action_delete({ body: { id: deleteTarget.value } });
        deleteTarget.value = null;
        refetch();
    }, [refetch]);

    return (
        <div>
            <div class={css.header}>
                <h1 class={css.pageTitle}>Automations</h1>
                <Link to={AutomationEdit} class={css.addButton}>
                    <Plus size={16} />
                    New
                </Link>
            </div>

            {automations.length === 0 ? (
                <div class={css.emptyState}>
                    No automations yet. Create one to automate your home.
                </div>
            ) : (
                <div class={css.list}>
                    {automations.map((auto) => (
                        <div key={auto.id} class={css.card}>
                            <div class={css.cardInfo}>
                                <div class={css.cardName}>
                                    {auto.name}
                                    {auto.runOnce && <span class={css.badgeOneShot}> one-shot</span>}
                                </div>
                                <div class={css.cardMeta}>
                                    {auto.triggerSummary} · {auto.actionCount} action{auto.actionCount !== 1 ? "s" : ""}
                                    {auto.lastTriggeredAt && ` · last: ${auto.lastTriggeredAt}`}
                                </div>
                                {auto.enabled && auto.nextRunAt && (
                                    <div class={css.countdown}>
                                        <Countdown executeAt={auto.nextRunAt} />
                                    </div>
                                )}
                            </div>
                            <div class={css.cardActions}>
                                <button
                                    class={`${css.toggleButton} ${auto.enabled ? css.toggleOn : css.toggleOff}`}
                                    onClick={() => handleToggle(auto.id)}
                                >
                                    <div class={`${css.toggleDot} ${auto.enabled ? css.toggleDotOn : css.toggleDotOff}`} />
                                </button>
                                <Link to={`/automations/${auto.id}`} class={css.editButton}>
                                    <Pencil size={16} />
                                </Link>
                                <button class={css.deleteButton} onClick={() => { deleteTarget.value = auto.id; }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {deleteTarget.value && (
                <ConfirmModal
                    title="Delete automation"
                    message="Are you sure you want to delete this automation?"
                    confirmLabel="Delete"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { deleteTarget.value = null; }}
                />
            )}
        </div>
    );
};
