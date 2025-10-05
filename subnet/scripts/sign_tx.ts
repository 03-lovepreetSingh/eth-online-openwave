import { U2U, Buffer, BinTools, BufferReader, BufferWriter } from "U2U";
import { KeyPair } from "U2U/dist/common/keypair";
import { Tx } from "U2U/dist/common/tx";
import { TxBuilder } from "U2U/dist/common/txBuilder";
import { TxStatus } from "U2U/dist/common/txStatus";
import { getTxStatus } from "../lib/U2U/txhelpers";

// Initialize U2U client
const ava = new U2U("localhost", 9650, "http");

// Function to sign a transaction
async function signTransaction(tx: Tx, keyPair: KeyPair): Promise<Tx> {
    const txBuilder = new TxBuilder();
    const signedTx = txBuilder.signTx(tx, keyPair);
    return signedTx;
}

// Example usage
(async () => {
    const keyPair = ava.keyChain().makeKeyPair();
    const tx = new Tx(); // Create a new transaction

    // Sign the transaction
    const signedTx = await signTransaction(tx, keyPair);

    // Send the transaction to the network
    const txID = await signedTx.send();
    console.log(`Transaction sent with ID: ${txID}`);

    // Check the transaction status
    const status = await getTxStatus(txID);
    console.log(`Transaction status: ${status}`);
})();