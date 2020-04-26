import "jest-extended";

import { Managers, Transactions } from "@arkecosystem/crypto";

import { SensorDataBuilder } from "../../src/builders";
import { SensorDataTransaction } from "../../src/transactions";

describe("Test builder", () => {
    it("Should verify correctly", () => {
        Managers.configManager.setFromPreset("testnet");
        Managers.configManager.setHeight(2); // v2 transactions (aip11) are available from height 2
        Transactions.TransactionRegistry.registerTransactionType(SensorDataTransaction);

        const builder = new SensorDataBuilder();
        const actual = builder
            .sensorData("temperature", "10")
            .nonce("4")
            .sign("clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire");

        console.log(actual.build().toJson());
        console.log(JSON.stringify(actual.build().toJson()));
        expect(actual.build().verified).toBeTrue();
        expect(actual.verify()).toBeTrue();
    });
});
