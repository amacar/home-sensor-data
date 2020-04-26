import { Database, EventEmitter, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers, TransactionReader } from "@arkecosystem/core-transactions";
import { Interfaces, Managers, Transactions } from "@arkecosystem/crypto";

import { SensorDataAssetError } from "../errors";
import { ISensorData } from "../interfaces";
import { SensorDataTransaction } from "../transactions";

export class SensorDataTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return SensorDataTransaction;
    }

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [];
    }

    public walletAttributes(): ReadonlyArray<string> {
        return ["transactionWalletKeyName"];
    }

    public async isActivated(): Promise<boolean> {
        return Managers.configManager.getMilestone().aip11 === true;
    }

    public async bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
        const reader: TransactionReader = await TransactionReader.create(connection, this.getConstructor());

        while (reader.hasNext()) {
            const transactions = await reader.read();

            for (const transaction of transactions) {
                const wallet: State.IWallet = walletManager.findByPublicKey(transaction.senderPublicKey);
                const asset: ISensorData = {
                    type: transaction.asset.sensorData.type,
                    value: transaction.asset.sensorData.value,
                };

                wallet.setAttribute<ISensorData>("transactionWalletKeyName", asset);
                walletManager.reindex(wallet);
            }
        }
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        wallet: State.IWallet,
        databaseWalletManager: State.IWalletManager,
    ): Promise<void> {
        const { data }: Interfaces.ITransaction = transaction;

        const { type, value }: ISensorData = data.asset.sensorData;
        if (!type || !value) {
            throw new SensorDataAssetError();
        }

        await super.throwIfCannotBeApplied(transaction, wallet, databaseWalletManager);
    }

    public emitEvents(transaction: Interfaces.ITransaction, emitter: EventEmitter.EventEmitter): void {
        emitter.emit("sensorData.set", transaction.data);
    }

    public async canEnterTransactionPool(
        data: Interfaces.ITransactionData,
        pool: TransactionPool.IConnection,
        processor: TransactionPool.IProcessor,
    ): Promise<{ type: string; message: string } | null> {
        const err = await this.typeFromSenderAlreadyInPool(data, pool);
        if (err) return err;

        return null;
    }

    public async applyToSender(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        await super.applyToSender(transaction, walletManager);
        const sender: State.IWallet = walletManager.findByPublicKey(transaction.data.senderPublicKey);
        sender.setAttribute<ISensorData>("transactionWalletKeyName", transaction.data.asset.sensorData);
        walletManager.reindex(sender);
    }

    public async revertForSender(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        await super.revertForSender(transaction, walletManager);
        const sender: State.IWallet = walletManager.findByPublicKey(transaction.data.senderPublicKey);
        sender.forgetAttribute("transactionWalletKeyName");
        walletManager.reindex(sender);
    }

    public async applyToRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        return;
    }

    public async revertForRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        return;
    }
}
