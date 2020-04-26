// tslint:disable:max-classes-per-file
import { Errors } from "@arkecosystem/core-transactions";

export class SensorDataAssetError extends Errors.TransactionError {
    constructor() {
        super(`Incomplete sensor data asset.`);
    }
}
