import { Transactions } from "@arkecosystem/crypto";
import ByteBuffer from "bytebuffer";

import { ISensorData } from "../interfaces";
import { BUSINESS_REGISTRATION_TYPE_GROUP, BUSINESS_REGISTRATION_TYPE, DEFAULT_TX_FEE } from "../constants";

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
                            required: ["type", "value"],
                            properties: {
                                type: {
                                    type: "string",
                                    pattern: "^[^\u0000]+$",
                                },
                                value: {
                                    type: "string",
                                    pattern: "^[^\u0000]+$",
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

        const typeBytes = Buffer.from(sensorData.type, "utf8");
        const valueBytes = Buffer.from(sensorData.value, "utf8");

        const buffer = new ByteBuffer(typeBytes.length + valueBytes.length + 2, true);

        buffer.writeUint8(typeBytes.length);
        buffer.append(typeBytes, "hex");

        buffer.writeUint8(valueBytes.length);
        buffer.append(valueBytes, "hex");

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const sensorData = {} as ISensorData;
        const typeLength = buf.readUint8();
        sensorData.type = buf.readString(typeLength);

        const valueLength = buf.readUint8();
        sensorData.value = buf.readString(valueLength);

        data.asset = {
            sensorData,
        };
    }
}
