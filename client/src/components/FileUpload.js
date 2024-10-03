import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Modal from "./Modal";
import FormData from "form-data";
import { ethers } from "ethers";

const FileUpload = ({ contract, account, provider, setFileId, fetchUserFiles }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [backendFileId, setBackendFileId] = useState(null);
  const [currentButton, setCurrentButton] = useState("upload");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      let ipfsHash = "";
      let backendFileId = null;
      try {
        const formData = new FormData();
        formData.append("file", file);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progressPercentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progressPercentage);
          },
        });

        ipfsHash = `ipfs://${resFile.data.IpfsHash}`;
        const signer = provider.getSigner();

        const storeResponse = await axios.post(`${process.env.REACT_APP_STORE_KEY_API}`, {
          fileName,
          walletAddress: account,
          ipfsHash: ipfsHash,
        });
        
        const encryptedHash = storeResponse.data.encryptedHash;
        backendFileId = storeResponse.data.fileId;
        setBackendFileId(backendFileId);

        const gasLimit = await contract.estimateGas.uploadFile(encryptedHash, fileName);
        const tx = await contract.connect(signer).uploadFile(encryptedHash, fileName, {
          gasLimit: ethers.utils.hexlify(gasLimit),
        });

        const receipt = await tx.wait();
        if (!receipt || !receipt.events) {
          throw new Error("Transaction failed, no events found");
        }
        const event = receipt.events.find(event => event.event === "FileUploaded");
        const fileId = event.args.fileId.toNumber();

        setFileId(fileId);

        setFileName("No file selected");
        setFile(null);
        setUploadProgress(0);

        alert("File uploaded successfully!");
        fetchUserFiles();
      } catch (e) {
        console.error("Error uploading file:", e);
        const backendFileIdStr = backendFileId.toString();

        if (backendFileId && ipfsHash) {
          try {
            await axios.post(`${process.env.REACT_APP_DELETE_KEY_API}`, {
              fileId: backendFileIdStr,
            });
          const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
          const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;
          const cid = ipfsHash.replace("ipfs://", "");

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
            alert("Failed to upload on-chain. File unpinned from Pinata and record deleted.");
          } else {
            console.error("Failed to unpin file from Pinata");
          }
          } catch (deleteError) {
            console.error("Error deleting file record:", deleteError);
          }
        }
      }
    }
  };

  const retrieveFile = (e) => {
    const input = e.target;
    const label = document.getElementById("fileLabel");
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      setFile(file);
      setFileName(file.name);
      label.textContent = "";
    } else if (!file) {
      label.innerHTML = '<i class="fa-solid fa-cloud-arrow-up fa-bounce"></i>';
      document.getElementById("upload-para").style.display = "block";
    }
  };

  const renderPreview = () => {
    if (file) {
      const fileType = file.type.split("/")[0];

      switch (fileType) {
        case "image":
          return (
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded file"
              className="preview-image"
            />
          );
        case "video":
          return (
            <video
              src={URL.createObjectURL(file)}
              className="preview-video"
              controls
              height={150}
              width={320}
            />
          );
        case "audio":
          return (
            <audio
              src={URL.createObjectURL(file)}
              className="preview-audio"
              controls
            />
          );
        case "application":
          if (file.type === "application/pdf") {
            return (
              <div className="preview-file">
                <i className="fa-solid fa-file-pdf"></i>
                <p>PDF FILE</p>
              </div>
            );
          } else {
            return (
              <div className="preview-file">
                <i className="fa-solid fa-file"></i>
                <p>{fileType.toUpperCase()} FILE</p>
              </div>
            );
          }
        default:
          return (
            <div className="preview-file">
              <i className="fa-solid fa-file"></i>
              <p>{fileType.toUpperCase()} FILE</p>
            </div>
          );
      }
    }

    return null;
  };

  return (
    <>
      <div className="upload-share-container">
        <div className="toggleWrapper">
          <input type="checkbox" className="dn" id="dn" />
          <label
            htmlFor="dn"
            className="toggle"
            onClick={() =>
              setCurrentButton(currentButton === "share" ? "upload" : "share")
            }
          >
            <span className="toggle__handler"></span>
          </label>
        </div>
        {currentButton === "upload" && (
          <div className="wrapper">
            <h3>Upload Your Files</h3>
            <p className="first-desc">
              File supported type : Images, MP3, MP4, PDFs{" "}
            </p>
            <div
              className="form"
              onClick={() => document.getElementById("my-file").click()}
              onSubmit={handleSubmit}
            >
              <label htmlFor="my-file" id="fileLabel" className="custom-file-upload">
                <i className="fa-solid fa-cloud-arrow-up fa-bounce"></i>
              </label>
              <input
                type="file"
                id="my-file"
                name="myfile"
                disabled={!account}
                onChange={(e) => {
                  retrieveFile(e);
                  document.getElementById("upload-para").style.display = "none";
                }}
              />
              {file && renderPreview()}

              <p id="upload-para" className="upload-para">
                Browse or Drag here to upload
              </p>
              {uploadProgress > 0 && ( <progress value={uploadProgress} max={100} />)}
            </div>
            <button type="submit" className="upload" disabled={!file} onClick={handleSubmit}>
              Upload
            </button>
          </div>
        )}
        {currentButton === "share" && (
          <div className="share-wrapper">
            <Modal contract={contract} />
          </div>
        )}
      </div>
    </>
  );
};

FileUpload.propTypes = {
  contract: PropTypes.shape({
    connect: PropTypes.func,
  }),
  account: PropTypes.string,
  provider: PropTypes.shape({
    getSigner: PropTypes.func,
  }),
  setFileId: PropTypes.func.isRequired,
  fetchUserFiles: PropTypes.func.isRequired,
};
export default FileUpload;
