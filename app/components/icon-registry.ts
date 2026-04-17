import * as haIcons from "./home-assistant-outlined-icons.js";

interface IconComponent {
    (props: { size?: number; class?: string; [key: string]: any }): any;
}

interface IconEntry {
    name: string;
    searchName: string;
    component: IconComponent;
}

function toSearchName(name: string): string {
    return name.replace(/([A-Z])/g, " $1").trim().toLowerCase();
}

const registry: IconEntry[] = [];

for (const [name, component] of Object.entries(haIcons)) {
    if (typeof component === "function") {
        registry.push({ name, searchName: toSearchName(name), component: component as IconComponent });
    }
}

export function searchIcons(query: string, limit = 50): IconEntry[] {
    if (!query) return registry.slice(0, limit);
    const lower = query.toLowerCase();
    return registry.filter((e) => e.searchName.includes(lower)).slice(0, limit);
}

export function getIcon(name: string): IconComponent | null {
    return registry.find((e) => e.name === name)?.component ?? null;
}

export { type IconEntry };
