import Web3 from "web3";

// TODO: medio sus
declare global {
  interface Window {
    dataLayer?: Object[];
    [key: string]: any;
  }
}

const INFURA_ENDPOINT =
  process.env.ETH_ENV == "test"
    ? `ws://localhost:8545`
    : `ws://sepolia.infura.io/v3/${process.env.SEPOLIA_API_KEY}`;

let web3: Web3;
if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  window.ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3(window.ethereum);
} else {
  const provider = new Web3.providers.WebsocketProvider(INFURA_ENDPOINT);
  web3 = new Web3(provider);
}

export default web3;
