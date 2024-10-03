import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Navbar from "./Navbar";
import "./AccessList.css";

const AccessListPage = ({ contract, fileId }) => {
  const [accessList, setAccessList] = useState([]);

  useEffect(() => {
    const fetchAccessList = async () => {
      try {
        const list = await contract.fileAccessList(fileId);
        setAccessList(list);
      } catch (error) {
        console.error("Error fetching access list:", error);
      }
    };
    contract && fileId && fetchAccessList();
  }, [contract, fileId]);

  const handleAllow = async (address) => {
    try {
      await contract.shareFile(fileId, address);
      const addressObj = { user: address, access: true };
      if (accessList.some(item => item.user === address)) {
        setAccessList(
          accessList.map((item) => {
            if (item.user === address) {
              return { ...item, access: true };
            }
            return item;
          })
        );
      } else {
        setAccessList([...accessList, addressObj]);
      }
    } catch (error) {
      console.error("Error allowing access:", error);
    }
  };


  const handleDisallow = async (address) => {
    try {
      await contract.revokeFileAccess(fileId, address);
      setAccessList(
        accessList.map((item) => {
          if (item.user === address) {
            return { ...item, access: false };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error disallowing access:", error);
    }
  };


  return (
    <div>
      {/* Navbar section */}
      <div className="navbar-section">
        <Navbar />
      </div>
      <div className="accesslist-section">
        <h1 className="accesslist-h1">Access List</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const address = e.target.address.value;
            handleAllow(address);
            e.target.reset();
          }}
          className="accesslist-form"
        >
          <input
            className="accesslist-input"
            type="text"
            name="address"
            placeholder="Enter Address"
          />
          <button type="submit" className="accesslist-button">
            Allow
          </button>
        </form>

        {accessList.length > 0 ? (
          <ul>
            {accessList.map((item) => (
              <li key={item.user} className="accesslist-container">
                <div className="address">{item.user}</div>
                <div className="status">
                  {item.access ? "Allowed" : "Disallowed"}
                </div>
                {item.access ? (
                  <button
                    className="accesslist-button"
                    onClick={() => handleDisallow(item.user)}
                  >
                    Disallow
                  </button>
                ) : (
                  <button
                    className="accesslist-button"
                    onClick={() => handleAllow(item.user)}
                  >
                    Allow
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="error-text">No addresses with access.</p>
        )}
      </div>

      <div className="footer-section">
        <div className="column1">
          <h2 className="column1-heading">Contact Me</h2>
          <p className="column1-para">jainyash2108@gmail.com@gmail.com</p>
        </div>

        <div className="column3">
          <p className="Column3-text">
            © 2024 BlockStash. All rights reserved
          </p>
        </div>
      </div>

    </div>
  );
};

AccessListPage.propTypes = {
  contract: PropTypes.shape({
    fileAccessList: PropTypes.func.isRequired,
    shareFile: PropTypes.func.isRequired,
    revokeFileAccess: PropTypes.func.isRequired,
  }).isRequired,
  fileId: PropTypes.number.isRequired,
};

export default AccessListPage;

