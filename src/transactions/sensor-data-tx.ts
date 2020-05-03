import { Utils as AppUtils } from "@arkecosystem/core-kernel";
import { Transactions } from "@arkecosystem/crypto";
import ByteBuffer from "bytebuffer";

import { DEFAULT_TX_FEE, SENSOR_DATA_TYPE, SENSOR_DATA_TYPE_GROUP, SENSOR_DATA_VERSION } from "../constants";
import { SensorType, SensorUnit } from "../enums";
import { ISensorData } from "../interfaces";

const { schemas } = Transactions;

export class SensorDataTransaction extends Transactions.Transaction {
    public static typeGroup = SENSOR_DATA_TYPE_GROUP;
    public static type = SENSOR_DATA_TYPE;
    public static key: string = "sensorData";
    public static version = SENSOR_DATA_VERSION;
    protected static defaultStaticFee = DEFAULT_TX_FEE;

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "sensorData",
            required: ["asset", "typeGroup"],
            properties: {
                type: { transactionType: SENSOR_DATA_TYPE },
                typeGroup: { const: SENSOR_DATA_TYPE_GROUP },
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
                                    type: "number",
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

    public serialize(): ByteBuffer {
        const { data } = this;

        AppUtils.assert.defined<ISensorData>(data.asset?.sensorData);
        const sensorData = data.asset.sensorData as ISensorData;

        const typeBytes = Buffer.from(sensorData.type);
        const valueBytes = Buffer.from(sensorData.value.toString());
        const unitBytes = Buffer.from(sensorData.unit);

        const dataBytes = [typeBytes, valueBytes, unitBytes];

        const buffer = new ByteBuffer(
            dataBytes.reduce((sum, prop) => (sum += prop.length), dataBytes.length),
            true,
        );
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
        sensorData.value = parseFloat(buf.readString(valueLength));

        const unitLength = buf.readUint8();
        sensorData.unit = buf.readString(unitLength) as SensorUnit;

        data.asset = {
            sensorData,
        };
    }
}
