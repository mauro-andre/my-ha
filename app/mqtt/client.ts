import mqtt from "mqtt";
import { routeMessage } from "./router.js";

let client: mqtt.MqttClient | null = null;

export function connectMqtt() {
    const host = process.env["MQTT_HOST"] ?? "localhost";
    const port = Number(process.env["MQTT_PORT"] ?? 1883);
    const url = `mqtt://${host}:${port}`;

    console.log(`[mqtt] Connecting to ${url}...`);

    client = mqtt.connect(url);

    client.on("connect", () => {
        console.log("[mqtt] Connected to Mosquitto");

        client!.subscribe("zigbee2mqtt/#", (err) => {
            if (err) {
                console.error("[mqtt] Subscribe error:", err);
            } else {
                console.log("[mqtt] Subscribed to zigbee2mqtt/#");
            }
        });
    });

    client.on("message", (topic, payload) => {
        routeMessage(topic, payload);
    });

    client.on("error", (err) => {
        console.error("[mqtt] Error:", err.message);
    });

    client.on("reconnect", () => {
        console.log("[mqtt] Reconnecting...");
    });

    client.on("close", () => {
        console.log("[mqtt] Connection closed");
    });
}

export function publish(topic: string, payload: string | object) {
    if (!client) return;
    const message = typeof payload === "string" ? payload : JSON.stringify(payload);
    client.publish(topic, message);
}

