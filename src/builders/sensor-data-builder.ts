import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";

import { DEFAULT_TX_FEE, SENSOR_DATA_TYPE, SENSOR_DATA_TYPE_GROUP, SENSOR_DATA_VERSION } from "../constants";
import { SensorType, SensorUnit } from "../enums";

export class SensorDataBuilder extends Transactions.TransactionBuilder<SensorDataBuilder> {
    public constructor() {
        super();
        this.data.type = SENSOR_DATA_TYPE;
        this.data.typeGroup = SENSOR_DATA_TYPE_GROUP;
        this.data.version = SENSOR_DATA_VERSION;
        this.data.fee = DEFAULT_TX_FEE;
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { sensorData: {} };
    }

    public sensorData(type: SensorType, value: number, unit: SensorUnit): SensorDataBuilder {
        if (this.data.asset) {
            this.data.asset.sensorData = {
                type,
                value,
                unit,
            };
        }

        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): SensorDataBuilder {
        return this;
    }
}
