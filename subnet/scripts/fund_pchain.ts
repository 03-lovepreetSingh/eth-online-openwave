import { U2U, BinTools, Buffer, BufferReader, BufferWriter, BufferWriterOptions, KeyChain, Tx, TxType } from "U2U";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve } from "path";

const require = createRequire(import.meta.url);
const subnetConfig = require(resolve(process.cwd(), "subnet/config/subnet-config.json"));

const U2U = 1e9; // 1 U2U in nU2U (nano-U2U)
const P_CHAIN_ID = "X"; // Replace with your actual P-Chain ID
const PRIVATE_KEY = "YOUR_PRIVATE_KEY"; // Replace with your actual private key

async function fundPChain() {
    const ava = new U2U("localhost", 9650, "http");
    const keyChain = ava.keyChain();
    const wallet = keyChain.importKey(PRIVATE_KEY);
    const balance = await ava.X.getTxStatus(wallet.getAddressString());

    if (balance < U2U) {
        console.log("Insufficient funds on P-Chain. Please fund your wallet.");
        return;
    }

    const tx = await ava.buildTx({
        to: P_CHAIN_ID,
        amount: U2U,
        from: wallet.getAddressString(),
    });

    const signedTx = keyChain.signTx(tx);
    const txID = await ava.sendTx(signedTx);

    console.log(`Transaction sent with ID: ${txID}`);
}

fundPChain().catch((error) => {
    console.error("Error funding P-Chain:", error);
});