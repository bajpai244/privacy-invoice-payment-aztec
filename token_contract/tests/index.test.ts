import { expect, beforeAll, test } from "bun:test";
import { deployContract, getPxeAndWallet } from "./lib";
import { TokenContractArtifact } from "@aztec/noir-contracts.js/Token";

test("depoly contract", async () => {
  const { pxe, wallet } = await getPxeAndWallet();

  const contract = await deployContract(wallet, {
    tokenName: "Test Token",
    tokenSymbol: "TTK",
    tokenDecimals: 18,
  });

  console.log("contract deployed at address:", contract.address);
});

test("2+2 should equal 4", () => {
  expect(2 + 2).toBe(4);
});
