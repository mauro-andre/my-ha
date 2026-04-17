import { dbSchema } from "@mauroandre/zodmongo";
import { z } from "zod/v4";

// --- Capabilities (derivadas do exposes do Z2M) ---

const genericCapabilitySchema = z.object({
    kind: z.enum(["binary", "numeric", "enum", "text", "composite"]),
    name: z.string(),
    label: z.string(),
    property: z.string(),
    access: z.number(),
    category: z.enum(["config", "diagnostic"]).nullable().optional(),
    endpoint: z.string().nullable().optional(),

    // binary
    valueOn: z.any().optional(),
    valueOff: z.any().optional(),
    valueToggle: z.string().nullable().optional(),

    // numeric
    valueMin: z.number().nullable().optional(),
    valueMax: z.number().nullable().optional(),
    valueStep: z.number().nullable().optional(),
    unit: z.string().nullable().optional(),

    // enum
    values: z.array(z.string()).nullable().optional(),
});

export type GenericCapability = z.infer<typeof genericCapabilitySchema>;

const specificCapabilitySchema = z.object({
    kind: z.enum(["light", "switch", "fan", "cover", "lock", "climate"]),
    endpoint: z.string().nullable().optional(),
    features: z.array(genericCapabilitySchema),
});

export type SpecificCapability = z.infer<typeof specificCapabilitySchema>;

const capabilitySchema = z.union([specificCapabilitySchema, genericCapabilitySchema]);

export type Capability = z.infer<typeof capabilitySchema>;

// --- Device Category (inferida das capabilities) ---

export const deviceCategoryEnum = z.enum([
    "light",
    "switch",
    "climate",
    "cover",
    "lock",
    "fan",
    "sensor",
    "button",
    "remote",
    "unknown",
]);

export type DeviceCategory = z.infer<typeof deviceCategoryEnum>;

// --- Device ---

export const deviceSchema = dbSchema({
    ieeeAddress: z.string(),
    friendlyName: z.string(),
    vendor: z.string(),
    model: z.string(),
    description: z.string(),
    powerSource: z.enum(["mains", "battery", "dc", "unknown"]),
    type: z.enum(["Router", "EndDevice", "Coordinator"]),
    capabilities: z.array(capabilitySchema),
    category: deviceCategoryEnum,
    state: z.record(z.string(), z.any()),
    availability: z.enum(["online", "offline"]),

    // User customization
    areaId: z.string().nullable().optional(),
    displayName: z.string().nullable().optional(),
    displayLabels: z.record(z.string(), z.string()).nullable().optional(), // property → custom label
    icon: z.string().nullable().optional(),
    order: z.number().nullable().optional(),
    hidden: z.boolean().nullable().optional(),
});

export type Device = z.infer<typeof deviceSchema>;
