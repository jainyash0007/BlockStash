import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./Secondfile.css";

const Display = ({ data, togglePublicAccess, deleteFile, showData, account }) => {
  return (
    <>
      {showData && data.length > 0 ? (
        <div className="blank-container">
          <table className="file-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Date Uploaded</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(({ fileId, fileUrl, fileName, uploadDate, owner, isPublic, encryptedHash }) => (
                <tr key={fileId}>
                  <td>
                    <a href={fileUrl} target="_blank" rel="noreferrer">
                      {fileName}
                    </a>
                  </td>
                  <td>{uploadDate}</td>
                  <td>{owner}</td>
                  <td>
                    {owner === account && (
                      <button onClick={() => togglePublicAccess(fileId)}>
                        {isPublic ? "Make Private" : "Make Public"}
                      </button>
                    )}
                    <button
                      className="delete-button"
                      onClick={() => deleteFile(fileId, encryptedHash)}
                    >
                      <i className="fa-solid fa-trash fa-beat" style={{ color: "#007bff" }}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No files to display</p>
      )}
    </>
  );
};

Display.propTypes = {
  data: PropTypes.array.isRequired,
  togglePublicAccess: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  showData: PropTypes.bool.isRequired,
  account: PropTypes.string.isRequired,
};

export default Display;
