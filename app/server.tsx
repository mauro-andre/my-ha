import "dotenv/config";
import { connect } from "@mauroandre/zodmongo";
import { addRoutes } from "@mauroandre/velojs/server";
import { loadDevicesFromDb } from "./modules/devices/device.services.js";
import { connectMqtt } from "./mqtt/client.js";

const mongoUri = process.env["MONGO_URI"] ?? "mongodb://localhost:27017";
const mongoDb = process.env["MONGO_DB_NAME"] ?? "my-ha";

await connect(mongoUri, mongoDb);
console.log(`[db] Connected to MongoDB (${mongoDb})`);

await loadDevicesFromDb();

connectMqtt();

addRoutes((app) => {
    // SSE: stream device state changes
    app.get("/api/devices/events", async (c) => {
        const { streamSSE } = await import("hono/streaming");
        const { onStateChange } = await import("./modules/devices/device.services.js");

        return streamSSE(c, async (stream) => {
            const unsubscribe = onStateChange((ieeeAddress, changedKeys, state) => {
                stream.writeSSE({
                    event: "state_change",
                    data: JSON.stringify({ ieeeAddress, changedKeys, state }),
                });
            });

            stream.onAbort(() => { unsubscribe(); });
            await new Promise<void>(() => {});
        });
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
