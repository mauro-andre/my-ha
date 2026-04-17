import type { AppRoutes } from "@mauroandre/velojs";

import * as Root from "./client-root.js";
import * as MainLayout from "./layouts/MainLayout.js";
import * as Home from "./pages/Home.js";
import * as Devices from "./pages/Devices.js";
import * as DeviceDetail from "./pages/DeviceDetail.js";
import * as IrDevices from "./pages/IrDevices.js";
import * as IrDeviceDetail from "./pages/IrDeviceDetail.js";
import * as LinkedControls from "./pages/LinkedControls.js";
import * as Areas from "./pages/Areas.js";
import * as Automations from "./pages/Automations.js";
import * as AutomationEdit from "./pages/AutomationEdit.js";

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
                    { path: "/devices/:ieee", module: DeviceDetail },
                    { path: "/ir-devices", module: IrDevices },
                    { path: "/ir-devices/:id", module: IrDeviceDetail },
                    { path: "/linked", module: LinkedControls },
                    { path: "/areas", module: Areas },
                    { path: "/automations", module: Automations },
                    { path: "/automations/:id", module: AutomationEdit },
                ],
            },
        ],
    },
] satisfies AppRoutes;
