import { ethers, network } from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const [issuer] = await ethers.getSigners();
  if (!issuer) {
    throw new Error("No deployment account. Configure PRIVATE_KEY in the repository .env file.");
  }

  const propertyReference = process.env.PROPERTY_REFERENCE ?? "BOL-001";
  const tokenName = process.env.SHARE_TOKEN_NAME ?? "Fracciona Propiedad #001";
  const tokenSymbol = process.env.SHARE_TOKEN_SYMBOL ?? "FRA-001";
  const totalShares = BigInt(process.env.TOTAL_SHARES ?? "7000");
  const pricePerShare = BigInt(
    process.env.PRICE_PER_SHARE_WEI ?? ethers.parseEther("0.01").toString()
  );

  const propertyShares = await ethers.deployContract("PropertyShares", [
    propertyReference,
    tokenName,
    tokenSymbol,
    totalShares,
    pricePerShare,
    issuer.address
  ]);

  await propertyShares.waitForDeployment();
  const address = await propertyShares.getAddress();

  // Listing is explicit: the issuer retains custody but authorizes this contract
  // to transfer the full initial inventory only when a buyer pays the exact price.
  const approval = await propertyShares.approve(address, totalShares);
  await approval.wait();

  const deployment = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    address,
    issuer: issuer.address,
    propertyReference,
    tokenName,
    tokenSymbol,
    totalShares: totalShares.toString(),
    pricePerShareWei: pricePerShare.toString(),
    deployedAt: new Date().toISOString()
  };

  const deploymentDirectory = resolve(__dirname, "../deployments", network.name);
  mkdirSync(deploymentDirectory, { recursive: true });
  writeFileSync(
    resolve(deploymentDirectory, "PropertyShares.json"),
    JSON.stringify(deployment, null, 2) + "\n"
  );

  console.log(JSON.stringify(deployment, null, 2));
  console.log("Inventory listed through issuer approval:", totalShares.toString());
  console.log("Set VITE_PROPERTY_SHARES_ADDRESS=" + address + " in apps/web/.env.local");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
