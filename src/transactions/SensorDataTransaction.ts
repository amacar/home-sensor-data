import { Transactions } from "@arkecosystem/crypto";
import { Utils } from "@arkecosystem/crypto";
import ByteBuffer from "bytebuffer";

import { ISensorData } from "../interfaces";
import { BUSINESS_REGISTRATION_TYPE_GROUP, BUSINESS_REGISTRATION_TYPE, DEFAULT_TX_FEE } from "../constants";
import { SensorType, SensorUnit } from "../enums";

const { schemas } = Transactions;

export class SensorDataTransaction extends Transactions.Transaction {
    public static typeGroup = BUSINESS_REGISTRATION_TYPE_GROUP;
    public static type = BUSINESS_REGISTRATION_TYPE;
    public static key: string = "sensor_key";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "sensorData",
            required: ["asset", "typeGroup"],
            properties: {
                type: { transactionType: BUSINESS_REGISTRATION_TYPE },
                typeGroup: { const: BUSINESS_REGISTRATION_TYPE_GROUP },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                asset: {
                    type: "object",
                    required: ["sensorData"],
                    properties: {
                        sensorData: {
                            type: "object",
                            required: ["type", "value", "unit"],
                            properties: {
                                type: {
                                    enum: [SensorType.TEMPERATURE, SensorType.HUMIDITY],
                                },
                                value: {
                                    bignumber: {},
                                },
                                unit: {
                                    enum: [SensorUnit.CELSIUS, SensorUnit.PERCENT],
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    protected static defaultStaticFee = DEFAULT_TX_FEE;

    public serialize(): ByteBuffer {
        const { data } = this;

        const sensorData = data.asset.sensorData as ISensorData;

        const typeBytes = Buffer.from(sensorData.type);
        const valueBytes = Buffer.from(sensorData.value.toString());
        const unitBytes = Buffer.from(sensorData.unit);

        const dataBytes = [typeBytes, valueBytes, unitBytes];

        const buffer = new ByteBuffer(dataBytes.reduce((sum, prop) => (sum += prop.length), dataBytes.length), true);
        for (const prop of dataBytes) {
            buffer.writeUint8(prop.length);
            buffer.append(prop);
        }

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const sensorData = {} as ISensorData;
        const typeLength = buf.readUint8();
        sensorData.type = buf.readString(typeLength) as SensorType;

        const valueLength = buf.readUint8();
        sensorData.value = Utils.BigNumber.make(buf.readString(valueLength));

        const unitLength = buf.readUint8();
        sensorData.unit = buf.readString(unitLength) as SensorUnit;

        data.asset = {
            sensorData,
        };
    }
}
