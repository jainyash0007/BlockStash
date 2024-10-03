import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "./Secondfile.css";
import "./FileUpload.css";
import FileUpload from "./FileUpload";
import Display from "./Display";
import axios from "axios";
import { ethers } from "ethers";

const Secondpage = ({ contract, account, provider, setFileId }) => {
  const [data, setData] = useState([]);
  const [showData, setShowData] = useState(false);

  const fetchUserFiles = async () => {
    try {
      const fileIds = await contract.getFilesByUser(account);
      const fileElements = await Promise.all(
        fileIds.map(async (fileId) => {
          try {
            const [encryptedHash, fileName, owner] = await contract.getFile(fileId);
            const isPublic = await contract.isPublic(fileId);
            const uploadDate = new Date().toLocaleString();

            const response = await axios.post(`${process.env.REACT_APP_GET_KEY_API}`, {
              fileId: fileId.toString(),
              walletAddress: account,
            });

            if (!response || !response.data || !response.data.encryptionKey) {
              throw new Error("Decryption key not found");
            }

            const decryptedHash = response.data.encryptionKey;
            if (decryptedHash && typeof decryptedHash === 'string') {
              const fileUrl = `https://gateway.pinata.cloud/ipfs/${decryptedHash.substring(6)}`;

              return {
                fileId,
                fileUrl,
                fileName,
                uploadDate,
                owner,
                isPublic,
                encryptedHash,
              };
            } else {
              throw new Error("Decrypted hash is invalid");
            }
          } catch (e) {
            console.error("Error fetching file details:", e);
            return null;
          }
        })
      );

      setData(fileElements.filter(Boolean));
      setShowData(true);
    } catch (e) {
      console.error("Error fetching user files:", e);
      alert("Unable to fetch files.");
    }
  };

  // Use the useEffect hook to fetch files when the component mounts
  useEffect(() => {
    if (contract && account) {
      fetchUserFiles();
    }
  }, [contract, account]);

  const togglePublicAccess = async (fileId) => {
    try {
      const tx = await contract.togglePublicAccess(fileId);
      await tx.wait();
      alert("File access updated successfully!");
      fetchUserFiles();
    } catch (e) {
      console.error("Error toggling file access:", e);
      alert("Unable to toggle file access.");
    }
  };

  const deleteFile = async (fileId, encryptedHash) => {
    try {
      const fileIdString = fileId.toString();

      const response = await axios.post(`${process.env.REACT_APP_GET_KEY_API}`, {
        fileId: fileIdString,
        walletAddress: account,
      });

      if (!response || !response.data || !response.data.encryptionKey) {
        throw new Error("Decryption key not found");
      }

      const decryptedHash = response.data.encryptionKey;
      if (!decryptedHash) {
        throw new Error("Failed to decrypt the IPFS hash");
      }

      const gasLimit = await contract.estimateGas.deleteFile(fileId);
      const maxPriorityFeePerGas = ethers.utils.parseUnits('30', 'gwei');
      const maxFeePerGas = ethers.utils.parseUnits('50', 'gwei');

      const tx = await contract.deleteFile(fileId, {
        gasLimit: ethers.utils.hexlify(gasLimit),
        maxPriorityFeePerGas,
        maxFeePerGas,
      });
      await tx.wait();

      const cid = decryptedHash.replace("ipfs://", "");
      const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
      const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

      // Make a DELETE request to Pinata's unpinning API
      const unpinResponse = await axios.delete(
        `https://api.pinata.cloud/pinning/unpin/${cid}`,
        {
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        }
      );

      if (unpinResponse.status === 200) {
        alert("File unpinned from Pinata and deleted successfully");
      } else {
        throw new Error("Failed to unpin file from Pinata");
      }

      await axios.post(`${process.env.REACT_APP_DELETE_KEY_API}`, {
        fileId: fileIdString,
      });

      alert("File deleted successfully");
      fetchUserFiles();
    } catch (e) {
      console.error("Error deleting file:", e);
      alert("Error deleting file");
    }
  };

  return (
    <>
      {/* Navbar section */}
      <div className="navbar-section">
        <Navbar />
      </div>

      <div className="file-container">
        <h1> Store and Share Your Files with Ease</h1>
        <FileUpload
          account={account}
          provider={provider}
          contract={contract}
          setFileId={setFileId}
          fetchUserFiles={fetchUserFiles}
        />
      </div>

      <div className="upload-check-section">
        <h2 className="check-head">My Uploads</h2>
        <p className="check-para">
          The &apos;My Uploads &apos; section of our decentralized image storage platform
          allows you to view all the images you have uploaded by clicking the
          search button. If someone has shared an image with you, you can also
          view it by entering the account address of the user who shared it into
          the search bar field. This will display all the images that have been
          shared with you by that user.
        </p>
        <Display
          data={data}
          togglePublicAccess={togglePublicAccess}
          deleteFile={deleteFile}
          showData={showData}
          account={account}
        />
      </div>

      <div className="footer-section">
        <div className="column1">
          <h2 className="column1-heading">Contact Me</h2>
          <p className="column1-para">jainyash2108@gmail.com</p>
        </div>

        <div className="column3">
          <p className="Column3-text">
            © 2024 BlockStash. All rights reserved
          </p>
        </div>
      </div>
    </>
  );
};

export default Secondpage;
