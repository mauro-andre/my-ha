import { BinaryControl } from "./BinaryControl.js";
import { QuickTimer } from "../QuickTimer.js";
import type { GenericCapability } from "../../modules/devices/device.schemas.js";

interface DeviceControlProps {
    capability: GenericCapability;
    label: string;
    value: unknown;
    ieeeAddress: string;
    onCommand: (property: string, value: unknown) => void;
}

export function DeviceControl({ capability, label, value, ieeeAddress, onCommand }: DeviceControlProps) {
    if (capability.kind === "binary" && (capability.access & 2)) {
        const valueOn = String(capability.valueOn ?? "ON");
        const valueOff = String(capability.valueOff ?? "OFF");

        const timerKey = `${ieeeAddress}:${capability.property}`;

        return (
            <BinaryControl
                label={label}
                property={capability.property}
                value={value}
                valueOn={valueOn}
                valueOff={valueOff}
                onToggle={onCommand}
                timerKey={timerKey}
                modalExtra={
                    <QuickTimer
                        actionKey={`${ieeeAddress}:${capability.property}`}
                        valueOptions={[
                            { value: valueOn, label: valueOn },
                            { value: valueOff, label: valueOff },
                        ]}
                        buildAction={(v) => ({
                            type: "device_command",
                            ieeeAddress,
                            property: capability.property,
                            value: v,
                        })}
                        label={label}
                    />
                }
            />
        );
    }

    // TODO: NumericControl, EnumControl, GenericControl
    return null;
}
