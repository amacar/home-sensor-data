import "jest-extended";

import { Managers, Transactions } from "@arkecosystem/crypto";

import { SensorDataBuilder } from "../../src/builders";
import { SensorDataTransaction } from "../../src/transactions";
import { RestClient } from "./rest-client";
import { SensorType, SensorUnit } from "../../src/enums";

describe("When e2e network is running with the plugin", () => {
    it("Should accept the transaction", async () => {
        Managers.configManager.setFromPreset("testnet");
        Managers.configManager.setHeight(2); // v2 transactions (aip11) are available from height 2
        Transactions.TransactionRegistry.registerTransactionType(SensorDataTransaction);

        const builder = new SensorDataBuilder();
        const actual = builder
            .sensorData(SensorType.TEMPERATURE, 22, SensorUnit.CELSIUS)
            .nonce("3")
            .sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");

        const txJson = actual.build().toJson();
        const result = await RestClient.broadcast([txJson]);
        expect(result.body.data).toEqual({
            accept: [txJson.id],
            broadcast: [txJson.id],
            excess: [],
            invalid: [],
        });
    });
});
