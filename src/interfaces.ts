import { SensorType, SensorUnit } from "./enums";

export interface ISensorData {
    type: SensorType;
    value: number;
    unit: SensorUnit;
}
