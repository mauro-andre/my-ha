import type { AppRoutes } from "@mauroandre/velojs";

import * as Root from "./client-root.js";
import * as MainLayout from "./layouts/MainLayout.js";
import * as Home from "./pages/Home.js";
import * as Devices from "./pages/Devices.js";

export default [
    {
        module: Root,
        isRoot: true,
        children: [
            {
                module: MainLayout,
                children: [
                    { path: "/", module: Home },
                    { path: "/devices", module: Devices },
                ],
            },
        ],
    },
] satisfies AppRoutes;
