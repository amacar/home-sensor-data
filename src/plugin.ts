import { Container, Logger } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";

import { defaults } from "./defaults";
import { SensorDataTransactionHandler } from "./handlers";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    alias: "home-sensor-data",
    async register(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Registering home-sensor-data transaction");
        Handlers.Registry.registerTransactionHandler(SensorDataTransactionHandler);
    },
    async deregister(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Deregistering home-sensor-data transaction");
        Handlers.Registry.deregisterTransactionHandler(SensorDataTransactionHandler);
    },
};
