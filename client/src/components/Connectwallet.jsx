import React, { useEffect, useState } from "react";

const Connectwallet = () => {
  const [walletAddress, setWalletAddress] = useState("");

  const isMetaMaskInstalled = () =>
    typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      getCurrentWalletConnected();
      addWalletListener();
    } else {
      console.log("Please install MetaMask");
    }
  }, []);

  const connectWallet = async () => {
    if (isMetaMaskInstalled()) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        console.log("Wallet connected: ", accounts[0]);
      } catch (err) {
        console.error("Error connecting to MetaMask: ", err.message);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (isMetaMaskInstalled()) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log("Currently connected account: ", accounts[0]);
        } else {
          console.log("No wallet connected. Please connect using the button.");
        }
      } catch (err) {
        console.error("Error fetching accounts: ", err.message);
      }
    }
  };

  const addWalletListener = () => {
    if (isMetaMaskInstalled()) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log("Account changed to: ", accounts[0]);
        } else {
          setWalletAddress("");
          console.log("No account connected");
        }
      });
    }
  };

  return (
    <div>
      <button className="connect-btn" onClick={connectWallet}>
        <span className="btn-txt">
          {walletAddress
            ? `Connected: ${walletAddress.substring(
                0,
                4
              )}...${walletAddress.substring(38)}`
            : "Connect Wallet"}
        </span>
      </button>
    </div>
  );
};

export default Connectwallet;
