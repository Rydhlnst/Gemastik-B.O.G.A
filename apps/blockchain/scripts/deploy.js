// apps/blockchain/scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Mulai mendeploy BogaIdentity...");

  const BogaIdentity = await hre.ethers.getContractFactory("BogaIdentity");
  const bogaIdentity = await BogaIdentity.deploy();

  await bogaIdentity.waitForDeployment();
  const contractAddress = await bogaIdentity.getAddress();

  console.log(`✅ BogaIdentity berhasil di-deploy ke alamat: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});