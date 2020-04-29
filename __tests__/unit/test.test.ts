import "jest-extended";

import { Managers, Transactions } from "@arkecosystem/crypto";

import { SensorDataBuilder } from "../../src/builders";
import { SensorDataTransaction } from "../../src/transactions";
import { SensorType, SensorUnit } from "../../src/enums";

describe("Test builder", () => {
    it("Should verify correctly", () => {
        Managers.configManager.setFromPreset("testnet");
        Managers.configManager.setHeight(2); // v2 transactions (aip11) are available from height 2
        Transactions.TransactionRegistry.registerTransactionType(SensorDataTransaction);

        const builder = new SensorDataBuilder();
        const actual = builder
            .sensorData(SensorType.TEMPERATURE, 42, SensorUnit.CELSIUS)
            .nonce("3")
            .sign("craft imitate step mixture patch forest volcano business charge around girl confirm");

        expect(actual.build().verified).toBeTrue();
        expect(actual.verify()).toBeTrue();
    });
});
