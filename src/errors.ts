// tslint:disable:max-classes-per-file
import { Errors } from "@arkecosystem/core-transactions";

export class SensorDataInputError extends Errors.TransactionError {
    constructor(errorInfo) {
        super(errorInfo);
    }
}

export class SensorDataImmutableError extends Errors.TransactionError {
    constructor(prop: string) {
        super(`Sensor ${prop} cannot be changed`);
    }
}
