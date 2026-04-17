import { Link } from "@mauroandre/velojs";
import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { Aerial, Pencil, Plus } from "../components/icons.js";
import { Select } from "../components/Select.js";
import * as IrDeviceDetail from "./IrDeviceDetail.js";
import * as css from "./IrDevices.css.js";

interface IrDeviceItem {
    id: string;
    name: string;
    commandCount: number;
    blasterCount: number;
}

interface IrDevicesData {
    devices: IrDeviceItem[];
    blasters: Array<{ ieeeAddress: string; friendlyName: string }>;
}

export const loader = async ({}: LoaderArgs) => {
    const { getAllIrDevices } = await import("../modules/ir-devices/ir-device.services.js");
    const { getAllDevices } = await import("../modules/devices/device.services.js");

    const irDevices = await getAllIrDevices();
    const allDevices = getAllDevices();

    const blasters = allDevices
        .filter((d) => d.capabilities.some((c) =>
            !("features" in c) && c.name === "ir_code_to_send"
        ))
        .map((d) => ({ ieeeAddress: d.ieeeAddress, friendlyName: d.friendlyName }));

    return {
        devices: irDevices.map((d) => ({
            id: d.id!,
            name: d.name,
            commandCount: d.commands.length,
            blasterCount: d.blasters.length,
        })),
        blasters,
    } satisfies IrDevicesData;
};

export const action_create = async ({ body }: ActionArgs<{ name: string; blasters: string[] }>) => {
    const { createIrDevice } = await import("../modules/ir-devices/ir-device.services.js");
    const device = await createIrDevice(body.name, body.blasters);
    return { ok: true, id: device.id };
};

export const Component = () => {
    const { data, refetch } = useLoader<IrDevicesData>();
    const modalOpen = useSignal(false);
    const selectedBlaster = useSignal("");
    const nameRef = useRef<HTMLInputElement>(null);

    if (!data.value) return null;

    const { devices, blasters } = data.value;

    const openModal = useCallback(() => {
        if (blasters.length === 0) {
            alert("No IR blasters found. Pair a device like UFO-R11 first.");
            return;
        }
        selectedBlaster.value = blasters[0]!.ieeeAddress;
        modalOpen.value = true;
        setTimeout(() => nameRef.current?.focus(), 0);
    }, [blasters]);

    const handleCreate = useCallback(async () => {
        const name = nameRef.current?.value.trim();
        const blasterIeee = selectedBlaster.value;
        if (!name || !blasterIeee) return;

        await action_create({
            body: {
                name,
                blasters: [blasterIeee],
            },
        });

        modalOpen.value = false;
        refetch();
    }, [refetch]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter") handleCreate();
        if (e.key === "Escape") modalOpen.value = false;
    }, [handleCreate]);

    return (
        <div>
            <div class={css.header}>
                <h1 class={css.pageTitle}>Remotes</h1>
                <button class={css.addButton} onClick={openModal}>
                    <Plus size={16} />
                    Add
                </button>
            </div>

            {devices.length === 0 ? (
                <div class={css.emptyState}>
                    No IR devices yet. Add one to get started.
                </div>
            ) : (
                <div class={css.list}>
                    {devices.map((device) => (
                        <div key={device.id} class={css.card}>
                            <div class={css.cardIcon}>
                                <Aerial size={24} />
                            </div>
                            <div class={css.cardInfo}>
                                <div class={css.cardName}>{device.name}</div>
                                <div class={css.cardMeta}>
                                    {device.commandCount} commands · {device.blasterCount} blaster{device.blasterCount !== 1 ? "s" : ""}
                                </div>
                            </div>
                            <Link to={`/ir-devices/${device.id}`} class={css.editButton}>
                                <Pencil size={18} />
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen.value && (
                <div class={css.overlay} onClick={() => { modalOpen.value = false; }}>
                    <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 class={css.modalTitle}>New IR Device</h3>

                        <div class={css.inputGroup}>
                            <label class={css.inputLabel}>Name</label>
                            <input
                                ref={nameRef}
                                class={css.input}
                                placeholder="e.g. Living Room AC"
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <div class={css.inputGroup}>
                            <label class={css.inputLabel}>IR Blaster</label>
                            <Select
                                options={blasters.map((b) => ({ value: b.ieeeAddress, label: b.friendlyName }))}
                                value={selectedBlaster.value}
                                onChange={(v) => { selectedBlaster.value = v; }}
                            />
                        </div>

                        <div class={css.modalActions}>
                            <button class={css.cancelButton} onClick={() => { modalOpen.value = false; }}>
                                Cancel
                            </button>
                            <button class={css.saveButton} onClick={handleCreate}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
