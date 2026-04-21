import "dotenv/config";
import { connect } from "@mauroandre/zodmongo";
import { addRoutes } from "@mauroandre/velojs/server";
import { loadDevicesFromDb } from "./modules/devices/device.services.js";
import "./modules/devices/device.stream.js";
import { connectMqtt } from "./mqtt/client.js";

const mongoUri = process.env["MONGO_URI"] ?? "mongodb://localhost:27017";
const mongoDb = process.env["MONGO_DB_NAME"] ?? "my-ha";

await connect(mongoUri, mongoDb);
console.log(`[db] Connected to MongoDB (${mongoDb})`);

await loadDevicesFromDb();

import { ensureMasterUser } from "./modules/users/user.services.js";
await ensureMasterUser();

import { loadAreas } from "./modules/areas/area.services.js";
await loadAreas();

import { loadLinkedControls, initLinkedControls } from "./modules/linked-controls/linked-control.services.js";
await loadLinkedControls();
initLinkedControls();

import { loadAutomations, initAutomations } from "./modules/automations/automation.services.js";
await loadAutomations();
initAutomations();

connectMqtt();

addRoutes((app) => {
    // Protect all API and asset routes with auth middleware
    app.use("/api/*", async (c, next) => {
        const { authMiddleware } = await import("./modules/users/auth.middleware.js");
        return authMiddleware(c, next);
    });
    app.use("/assets/*", async (c, next) => {
        const { authMiddleware } = await import("./modules/users/auth.middleware.js");
        return authMiddleware(c, next);
    });

    app.get("/assets/devices/:model", async (c) => {
        const model = c.req.param("model");
        const { getDeviceImagePath } = await import("./modules/devices/device.services.js");
        const filePath = getDeviceImagePath(model.replace(".png", ""));

        if (!filePath) {
            return c.notFound();
        }

        const fs = await import("node:fs");
        const buffer = fs.readFileSync(filePath);
        return new Response(buffer, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=86400",
            },
        });
    });
});
