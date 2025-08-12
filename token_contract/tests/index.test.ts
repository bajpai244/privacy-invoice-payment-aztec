import { expect, test } from "bun:test";
import {
  deployContract,
  getPxeAndWallet,
  deployAndGetRandomWallet,
} from "./lib";

const ONE_SECOND = 1000;
const THIRTY_SECONDS = 30 * ONE_SECOND;

// Tests most of the important functionalities of the token contract
// Deployment, minting, transferring from public to private, and private transfers
test(
  "end-to-end token contract test",
  async () => {
    const { pxe, wallet } = await getPxeAndWallet();
    const { wallet: recipientWallet, secretKey } =
      await deployAndGetRandomWallet(pxe, wallet);
    const recipientAddress = recipientWallet.getAddress();

    await pxe.registerAccount(
      secretKey,
      recipientWallet.getCompleteAddress().partialAddress
    );

    const contract = await deployContract(wallet, {
      tokenName: "Test Token",
      tokenSymbol: "TTK",
      tokenDecimals: 18,
    });

    console.log("contract deployed at address:", contract.address);

    console.log(
      "balance before minting:",
      await contract.methods.public_balance_of(wallet.getAddress()).simulate()
    );

    const balanceBeforeMint = await contract.methods
      .public_balance_of(wallet.getAddress())
      .simulate();
    expect(balanceBeforeMint).toBe(0n);

    console.log("minting 100 tokens to the wallet address...");
    await contract.methods
      .mint_publicly(wallet.getAddress(), 100)
      .send()
      .wait();
    console.log("minting complete");

    const balanceAfterMint = await contract.methods
      .public_balance_of(wallet.getAddress())
      .simulate();
    expect(balanceAfterMint).toBe(100n);

    const privateBalanceBefore = await contract.methods
      .private_balance_of(wallet.getAddress())
      .simulate();
    expect(privateBalanceBefore).toBe(0n);

    console.log("transferring 100 tokens from public to private...");

    await contract.methods
      .transfer_from_public_to_private(wallet.getAddress(), 100)
      .send()
      .wait();

    console.log("transfer complete");

    const privateBalanceAfter = await contract.methods
      .private_balance_of(wallet.getAddress())
      .simulate();
    expect(privateBalanceAfter).toBe(100n);

    const privateRecipientBalanceBefore = await contract.methods
      .private_balance_of(recipientAddress)
      .simulate();
    expect(privateRecipientBalanceBefore).toBe(0n);

    await contract.methods.private_transfer(recipientAddress, 50).send().wait();

    const privateRecipientBalanceAfter = await contract.methods
      .private_balance_of(recipientAddress)
      .simulate();
    expect(privateRecipientBalanceAfter).toBe(50n);

    const privateBalanceAfterTransfer = await contract.methods
      .private_balance_of(wallet.getAddress())
      .simulate();
    expect(privateBalanceAfterTransfer).toBe(50n);
  },
  THIRTY_SECONDS
);
