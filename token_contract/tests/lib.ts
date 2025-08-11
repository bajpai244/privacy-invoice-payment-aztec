import { getDeployedTestAccountsWallets } from "@aztec/accounts/testing";
import {
  Contract,
  createPXEClient,
  waitForPXE,
  type Wallet,
} from "@aztec/aztec.js";
import { SimpleTokenContractArtifact } from "../src/artifacts/SimpleToken";

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
  const contract = await Contract.deploy(wallet, SimpleTokenContractArtifact, [
    tokenParams.tokenName,
    tokenParams.tokenSymbol,
    tokenParams.tokenDecimals,
  ])
    .send()
    .deployed();
  return contract;
};
