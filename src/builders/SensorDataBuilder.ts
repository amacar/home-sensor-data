import { Interfaces, Transactions, Utils } from "@arkecosystem/crypto";

import { DEFAULT_TX_FEE, BUSINESS_REGISTRATION_TYPE, BUSINESS_REGISTRATION_TYPE_GROUP } from "../constants";
import { SensorType, SensorUnit } from "../enums";

export class SensorDataBuilder extends Transactions.TransactionBuilder<SensorDataBuilder> {
    constructor() {
        super();
        this.data.type = BUSINESS_REGISTRATION_TYPE;
        this.data.typeGroup = BUSINESS_REGISTRATION_TYPE_GROUP;
        this.data.version = 2;
        this.data.fee = DEFAULT_TX_FEE;
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { sensorData: {} };
    }

    public sensorData(type: SensorType, value: Utils.BigNumber, unit: SensorUnit): SensorDataBuilder {
        this.data.asset.sensorData = {
            type,
            value,
            unit,
        };

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
