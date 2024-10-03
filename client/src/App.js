import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import Firstpage from "./components/Firstpage";
import Secondpage from "./components/Secondpage";
import AccessList from "./components/AccessList";
import "./App.css";
import Working from "./components/Working";
import BlockStash from "./components/artifacts/BlockStashV1.json";

const App = () => {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [fileId, setFileId] = useState(null);

  useEffect(() => {
    const connectToContract = async () => {
      if(typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
          const abi = BlockStash.abi;
          const contractInstance = new ethers.Contract(contractAddress, abi, signer);

          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          setContract(contractInstance);
          setProvider(provider);
        } catch (error) {
          console.error("Error connecting to contract or fetching accounts:", error);
        }
      } else {
        console.error("MetaMask is not installed");
      }
    };

    connectToContract();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Firstpage />} />
        <Route path="/Secondpage" element={<Secondpage contract={contract} account={account} provider={provider} setFileId={setFileId} />} />
        <Route path="/accesslist" element={<AccessList contract={contract} fileId={fileId} />} />
        <Route path="/Working" element={<Working/>} />
      </Routes>
    </>
  );
};

export default App;
