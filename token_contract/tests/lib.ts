import { getDeployedTestAccountsWallets } from "@aztec/accounts/testing";
import { getSchnorrAccount } from "@aztec/accounts/schnorr";
import {
  Contract,
  createPXEClient,
  waitForPXE,
  type Wallet,
  type PXE,
  Fr,
  GrumpkinScalar,
  type AztecAddress,
  AccountWalletWithSecretKey,
} from "@aztec/aztec.js";
import {
  SimpleTokenContract,
  SimpleTokenContractArtifact,
} from "../src/artifacts/SimpleToken";

export const getPxeAndWallet = async () => {
  const PXE_URL = process.env.PXE_URL || "http://localhost:8080";
  const pxe = createPXEClient(PXE_URL);

  await waitForPXE(pxe);

  const wallet = (await getDeployedTestAccountsWallets(pxe))[0];

  return { pxe, wallet };
};

export const deployContract = async (
  wallet: Wallet,
  tokenParams: {
    tokenName: string;
    tokenSymbol: string;
    tokenDecimals: number;
  }
) => {
  const contract = await SimpleTokenContract.deploy(
    wallet,
    tokenParams.tokenName,
    tokenParams.tokenSymbol,
    tokenParams.tokenDecimals
  )
    .send()
    .deployed();

  return contract;
};

export const deployAndGetRandomWallet = async (
  pxe: PXE,
  deployWallet: Wallet
) => {
  const secretKey = Fr.random();
  const signingPrivateKey = GrumpkinScalar.random();

  const account = await (
    await getSchnorrAccount(pxe, secretKey, signingPrivateKey)
  )
    .deploy({ deployWallet })
    .wait();

  return { wallet: account.wallet, secretKey };
};
