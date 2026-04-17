import { BinaryControl } from "./BinaryControl.js";
import type { GenericCapability } from "../../modules/devices/device.schemas.js";

interface DeviceControlProps {
    capability: GenericCapability;
    label: string;
    value: unknown;
    onCommand: (property: string, value: unknown) => void;
}

export function DeviceControl({ capability, label, value, onCommand }: DeviceControlProps) {
    if (capability.kind === "binary" && (capability.access & 2)) {
        return (
            <BinaryControl
                label={label}
                property={capability.property}
                value={value}
                valueOn={capability.valueOn ?? "ON"}
                valueOff={capability.valueOff ?? "OFF"}
                onToggle={onCommand}
            />
        );
    }

    // TODO: NumericControl, EnumControl, GenericControl
    return null;
}
