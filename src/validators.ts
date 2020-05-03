import { SensorType, SensorUnit } from "./enums";
import { ISensorData } from "./interfaces";

const wrongUnitError = (type: SensorType, unit: SensorUnit) => `Sensor with ${type} type supports only ${unit} unit.`;

export const validateSensorData = ({ type, value, unit }: ISensorData): string | null => {
    if (!type || !value || !unit) {
        return "Incomplete sensor data asset.";
    }

    //validate humidity data
    if (type === SensorType.HUMIDITY) {
        if (unit !== SensorUnit.PERCENT) {
            return wrongUnitError(SensorType.HUMIDITY, SensorUnit.PERCENT);
        }
        if (value < 0 || value > 100) {
            return "Humidity value must be between 0 and 100%.";
        }
    }

    //validate temperature data
    if (type === SensorType.TEMPERATURE && unit !== SensorUnit.CELSIUS) {
        return wrongUnitError(SensorType.TEMPERATURE, SensorUnit.CELSIUS);
    }

    return null;
};

export const validateSensorImmutableData = (sensorData: ISensorData, walletData: ISensorData): string | null => {
    if (sensorData.unit !== walletData.unit) {
        return "unit";
    }

    if (sensorData.type !== walletData.type) {
        return "type";
    }

    return null;
};
