import { useCallback } from "preact/hooks";
import { Link } from "@mauroandre/velojs";
import { usePathname } from "@mauroandre/velojs/hooks";
import type { ActionArgs } from "@mauroandre/velojs";
import { darkTheme, lightTheme } from "../styles/theme.css.js";
import { Home as HomeIcon, Chip, Aerial, Link as LinkIcon, Grid, Refresh, Sun, Moon } from "../components/icons.js";
import * as css from "./MainLayout.css.js";

import * as Home from "../pages/Home.js";
import * as Devices from "../pages/Devices.js";
import * as IrDevices from "../pages/IrDevices.js";
import * as LinkedControls from "../pages/LinkedControls.js";
import * as Areas from "../pages/Areas.js";
import * as Automations from "../pages/Automations.js";

const navItems = [
    { module: Home, path: "/", label: "Home", Icon: HomeIcon },
    { module: Devices, path: "/devices", label: "Devices", Icon: Chip },
    { module: IrDevices, path: "/ir-devices", label: "Remotes", Icon: Aerial },
    { module: LinkedControls, path: "/linked", label: "Linked", Icon: LinkIcon },
    { module: Areas, path: "/areas", label: "Areas", Icon: Grid },
    { module: Automations, path: "/automations", label: "Auto", Icon: Refresh },
];

// --- Quick Timer Actions ---

export const action_createQuickTimer = async ({ body }: ActionArgs<{
    name: string;
    mode: "timer" | "schedule";
    timerSeconds?: number;
    scheduleTime?: string;
    action: any;
}>) => {
    const { createAutomation } = await import("../modules/automations/automation.services.js");

    const trigger = body.mode === "timer"
        ? { type: "timer" as const, seconds: body.timerSeconds!, executeAt: new Date(Date.now() + body.timerSeconds! * 1000) }
        : { type: "schedule" as const, time: body.scheduleTime!, days: [] as any[] };

    const automation = await createAutomation({
        name: body.name,
        runOnce: true,
        trigger,
        conditions: [],
        actions: [body.action],
    });

    let executeAt: string;
    if (trigger.type === "timer") {
        executeAt = trigger.executeAt.toISOString();
    } else {
        const { getNextScheduleDate } = await import("../modules/automations/automation.services.js");
        executeAt = getNextScheduleDate(trigger.time, trigger.days).toISOString();
    }

    return { ok: true, id: automation.id, executeAt };
};

export const action_cancelQuickTimer = async ({ body }: ActionArgs<{ id: string }>) => {
    const { deleteAutomation } = await import("../modules/automations/automation.services.js");
    await deleteAutomation(body.id);
    return { ok: true };
};

export const action_getActiveTimers = async ({}: ActionArgs<{}>) => {
    const { getAllAutomations, getNextScheduleDate } = await import("../modules/automations/automation.services.js");
    const automations = getAllAutomations();
    const timers: Array<{ id: string; actionKey: string; value: string; executeAt: string }> = [];

    for (const auto of automations) {
        if (!auto.enabled || !auto.runOnce) continue;
        if (auto.trigger.type !== "timer" && auto.trigger.type !== "schedule") continue;

        for (const action of auto.actions) {
            let actionKey = "";
            let value = "";
            if (action.type === "device_command") {
                actionKey = `${action.ieeeAddress}:${action.property}`;
                value = String(action.value);
            } else if (action.type === "ir_command") {
                actionKey = `ir:${action.blasterIeee}:${action.code}`;
                value = "IR";
            }

            const executeAt = auto.trigger.type === "timer"
                ? auto.trigger.executeAt.toISOString()
                : getNextScheduleDate(auto.trigger.time, auto.trigger.days).toISOString();

            timers.push({ id: auto.id!, actionKey, value, executeAt });
        }
    }

    return { timers };
};

export const Component = ({ children }: { children: preact.ComponentChildren }) => {
    const pathname = usePathname();

    const toggleTheme = useCallback(() => {
        if (typeof window === "undefined") return;
        const html = document.documentElement;
        const isDark = html.classList.contains(darkTheme);
        const next = isDark ? "light" : "dark";
        html.className = next === "light" ? lightTheme : darkTheme;
        localStorage.setItem("theme", next);
    }, []);

    return (
        <div class={css.layout}>
            <aside class={css.sidebar}>
                <div class={css.logo}>my-ha</div>
                <nav class={css.nav}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path
                            || (item.path !== "/" && pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.label}
                                to={item.module}
                                class={`${css.navLink} ${isActive ? css.navLinkActive : ""}`}
                            >
                                <item.Icon size={20} />
                                <span class={css.navLabel}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <button class={css.themeButton} onClick={toggleTheme}>
                    <Sun size={20} />
                </button>
            </aside>
            <main class={`${css.mainScroll} ${css.main}`}>{children}</main>
        </div>
    );
};
