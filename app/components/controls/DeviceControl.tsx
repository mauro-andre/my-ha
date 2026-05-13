import { BinaryControl } from "./BinaryControl.js";
import { BinaryReadout } from "./BinaryReadout.js";
import { NumericControl } from "./NumericControl.js";
import { NumericReadout } from "./NumericReadout.js";
import { EnumControl } from "./EnumControl.js";
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
    const isWritable = (capability.access & 2) !== 0;
    const isReadable = (capability.access & 1) !== 0;

    // Writable: interactive control
    if (capability.kind === "binary" && isWritable) {
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

    // Writable numeric: editable input with min/max/step
    if (capability.kind === "numeric" && isWritable) {
        return (
            <NumericControl
                label={label}
                property={capability.property}
                value={value}
                valueMin={capability.valueMin}
                valueMax={capability.valueMax}
                valueStep={capability.valueStep}
                unit={capability.unit}
                onCommand={onCommand}
            />
        );
    }

    // Writable enum: dropdown
    if (capability.kind === "enum" && isWritable && capability.values) {
        return (
            <EnumControl
                label={label}
                property={capability.property}
                value={value}
                values={capability.values}
                onCommand={onCommand}
            />
        );
    }

    // Read-only: display the value
    if (!isWritable && isReadable) {
        if (capability.kind === "numeric") {
            return <NumericReadout label={label} value={value} unit={capability.unit} />;
        }
        if (capability.kind === "binary") {
            return <BinaryReadout label={label} value={value} valueOn={capability.valueOn ?? true} />;
        }
    }

    // TODO: EnumReadout, text, composite
    return null;
}
