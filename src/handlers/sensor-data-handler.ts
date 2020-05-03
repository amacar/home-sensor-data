import { Models } from "@arkecosystem/core-database";
import { Container, Contracts, Utils } from "@arkecosystem/core-kernel";
import { Handlers, TransactionReader } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Transactions } from "@arkecosystem/crypto";

import { SensorDataImmutableError, SensorDataInputError } from "../errors";
import { SensorDataEvent } from "../events";
import { ISensorData } from "../interfaces";
import { SensorDataTransaction } from "../transactions";
import { validateSensorData, validateSensorImmutableData } from "../validators";

@Container.injectable()
export class SensorDataTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return SensorDataTransaction;
    }

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [];
    }

    public walletAttributes(): ReadonlyArray<string> {
        return ["sensorData"];
    }

    public async isActivated(): Promise<boolean> {
        return Managers.configManager.getMilestone().aip11 === true;
    }

    public async bootstrap(): Promise<void> {
        const reader: TransactionReader = this.getTransactionReader();
        const transactions: Models.Transaction[] = await reader.read();

        for (const transaction of transactions) {
            const wallet: Contracts.State.Wallet = this.walletRepository.findByPublicKey(transaction.senderPublicKey);
            if (!wallet.hasAttribute(this.walletAttributes()[0])) {
                wallet.setAttribute<ISensorData>(this.walletAttributes()[0], transaction.asset.sensorData);
                this.walletRepository.index(wallet);
            }
        }
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        sender: Contracts.State.Wallet,
        customWalletRepository?: Contracts.State.WalletRepository,
    ): Promise<void> {
        const { data }: Interfaces.ITransaction = transaction;

        // validate sensor data inputs
        Utils.assert.defined<ISensorData>(data.asset?.sensorData);
        const err = validateSensorData(data.asset.sensorData);
        if (err) {
            throw new SensorDataInputError(err);
        }

        // check if sender wants to change sensor unit/type
        if (sender.hasAttribute(this.walletAttributes()[0])) {
            const walletData = sender.getAttribute<ISensorData>(this.walletAttributes()[0]);
            const immutableErr = validateSensorImmutableData(data.asset.sensorData, walletData);
            if (immutableErr) {
                throw new SensorDataImmutableError(immutableErr);
            }
        }

        await super.throwIfCannotBeApplied(transaction, sender, customWalletRepository);
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: Contracts.Kernel.EventDispatcher): void {
        emitter.dispatch(SensorDataEvent, transaction.data);
    }

    public async applyToSender(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository,
    ): Promise<void> {
        await super.applyToSender(transaction, customWalletRepository);
        Utils.assert.defined<string>(transaction.data.senderPublicKey);
        Utils.assert.defined<ISensorData>(transaction.data.asset?.sensorData);
        const walletRepository: Contracts.State.WalletRepository = customWalletRepository ?? this.walletRepository;
        const sender: Contracts.State.Wallet = walletRepository.findByPublicKey(transaction.data.senderPublicKey);
        sender.setAttribute<ISensorData>(this.walletAttributes()[0], transaction.data.asset.sensorData);
        walletRepository.index(sender);
    }

    public async revertForSender(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository,
    ): Promise<void> {
        await super.revertForSender(transaction, customWalletRepository);
        Utils.assert.defined<string>(transaction.data.senderPublicKey);
        const walletRepository: Contracts.State.WalletRepository = customWalletRepository ?? this.walletRepository;
        const sender: Contracts.State.Wallet = walletRepository.findByPublicKey(transaction.data.senderPublicKey);
        sender.forgetAttribute(this.walletAttributes()[0]);
        walletRepository.index(sender);
    }

    public async applyToRecipient(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository,
    ): Promise<void> {
        return;
    }

    public async revertForRecipient(
        transaction: Interfaces.ITransaction,
        customWalletRepository?: Contracts.State.WalletRepository,
    ): Promise<void> {
        return;
    }
}
