import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import { resolve } from "node:path";

dotenv.config({ path: resolve(__dirname, "../../.env") });

const privateKey = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.30",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    fuji: {
      url: process.env.FUJI_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;
