import { useCallback } from "preact/hooks";
import { Link } from "@mauroandre/velojs";
import { usePathname } from "@mauroandre/velojs/hooks";
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
