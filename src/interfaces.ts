import { Utils } from "@arkecosystem/crypto";

import { SensorType, SensorUnit } from "./enums";

export interface ISensorData {
    type: SensorType;
    value: Utils.BigNumber;
    unit: SensorUnit;
}
