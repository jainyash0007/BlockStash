import React, { useEffect } from "react";
import PropTypes from "prop-types";

const Modal = ({ contract, fileId }) => {
  const shareFile = async () => {
    const address = document.querySelector(".address").value;
    if (!address) {
      alert("Please enter a valid address.");
      return;
    }
    try {
      await contract.shareFile(fileId, address);
      alert("File shared successfully!");
    } catch (error) {
      console.error("Error sharing file:", error);
      alert("Unable to share file.");
    }
  };

  const revokeAccess = async () => {
    const address = document.querySelector(".address").value;
    if (!address) {
      alert("Please enter a valid address.");
      return;
    }
    try {
      await contract.revokeFileAccess(fileId, address);
      alert("Access revoked successfully!");
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Unable to revoke access.");
    }
  };

  useEffect(() => {
    const fetchAccessList = async () => {
      try {
        const accessList = await contract.fileAccessList(fileId);
        const select = document.querySelector("#selectNumber");
        select.innerHTML = ""; // Clear existing options
        const options = accessList;

        for (let i = 0; i < options.length; i++) {
          const opt = options[i].user;
          const e1 = document.createElement("option");
          e1.textContent = opt;
          e1.value = opt;
          select.appendChild(e1);
        }
      } catch (error) {
        console.error("Error fetching access list:", error);
      }
    };

    if (contract && fileId) {
      fetchAccessList();
    }
  }, [contract, fileId]);

  return (
    <>
      <div className="modalBackground">
        <div className="modalContainer">
          <div id="myForm" className="myform">
            <input
              type="text"
              className="address"
              placeholder="Enter Address"
            />
            <div className="footer">
              <button onClick={shareFile} className="share-btn">
                Share
              </button>
              <button onClick={revokeAccess} className="disallow-btn">
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Modal.propTypes = {
  contract: PropTypes.shape({
    shareFile: PropTypes.func.isRequired,
    revokeFileAccess: PropTypes.func.isRequired,
    fileAccessList: PropTypes.func.isRequired,
  }),
  fileId: PropTypes.number.isRequired,
};

export default Modal;
