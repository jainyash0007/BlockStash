// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./BlockStashStorage.sol";

contract BlockStashV1 is BlockStashStorage {

    event FileUploaded(uint fileId, string fileName, address owner, bool isShared);
    event FileDeleted(uint fileId, address owner);
    event FileShared(uint fileId, address sharedWith, bool accessGranted);
    event PublicAccessToggled(uint fileId, bool isPublic);
    event AccessRevoked(uint fileId, address user);

    // Function to upload files
    function uploadFile(string memory _encryptedHash, string memory _fileName) public {
        fileCount++;
        files[fileCount] = File(_fileName, msg.sender, false);
        encryptedFileHashes[fileCount] = _encryptedHash;
        userFiles[msg.sender].push(fileCount);
        fileAccess[fileCount][msg.sender] = true; // Grant access to the owner by default
        emit FileUploaded(fileCount, _fileName, msg.sender, false);
    }

    // Function to toggle public access to a file
    function togglePublicAccess(uint _fileId) public {
        require(files[_fileId].owner == msg.sender, "Only the owner can modify access.");
        isPublic[_fileId] = !isPublic[_fileId];  // Toggle public/private status
        emit PublicAccessToggled(_fileId, isPublic[_fileId]);
    }

    // Function to share file with another user
    function shareFile(uint _fileId, address _user) public {
        require(files[_fileId].owner == msg.sender, "Only the owner can share this file.");
        fileAccess[_fileId][_user] = true;
        
        // Initialize fileAccessList if it's the first time sharing
        if (fileAccessList[_fileId].length == 0) {
            fileAccessList[_fileId].push(Access(_user, true));  // Start with the first user
        } else {
            // Add the user to the access list
            fileAccessList[_fileId].push(Access(_user, true));
        }

        emit FileShared(_fileId, _user, true);
    }

    // Function to revoke file access from a user
    function revokeFileAccess(uint _fileId, address _user) public {
        require(files[_fileId].owner == msg.sender, "Only the owner can revoke access.");
        fileAccess[_fileId][_user] = false;  // Revoke access
        emit AccessRevoked(_fileId, _user);
    }

    // Function to retrieve file information and IPFS hash (only for authorized users)
    function getFile(uint _fileId) public view returns (string memory, string memory, address) {
        require(
            files[_fileId].owner == msg.sender || fileAccess[_fileId][msg.sender] || isPublic[_fileId],
            "You don't have access to this file."
        );
        return (
            encryptedFileHashes[_fileId],
            files[_fileId].fileName,
            files[_fileId].owner
        );
    }

    // Function to get all files uploaded by a user
    function getFilesByUser(address _user) public view returns (uint[] memory) {
        return userFiles[_user];
    }

    // Function to delete a file
    function deleteFile(uint _fileId) public {
        require(files[_fileId].owner == msg.sender, "Only the owner can delete this file.");

        // Revoke access for all users
        if (fileAccessList[_fileId].length > 0) {
            Access[] storage accessList = fileAccessList[_fileId];
            for (uint i = 0; i < accessList.length; i++) {
                address user = accessList[i].user;
                fileAccess[_fileId][user] = false;
                emit AccessRevoked(_fileId, user);  // Log access revocation
            }
        }

        uint[] storage userFileList = userFiles[msg.sender];
        for (uint i = 0; i < userFileList.length; i++) {
            if (userFileList[i] == _fileId) {
                userFileList[i] = userFileList[userFileList.length - 1]; // Move the last element to the deleted spot
                userFileList.pop(); // Remove the last element
                break;
            }
        }
        
        // Remove the file from storage
        delete files[_fileId];
        delete encryptedFileHashes[_fileId];  // Remove IPFS hash as well
        delete fileAccessList[_fileId];

        emit FileDeleted(_fileId, msg.sender);
    }
}
