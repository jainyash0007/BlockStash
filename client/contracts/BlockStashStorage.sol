// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract BlockStashStorage {
    struct File {
        string fileName;
        address owner;
        bool isShared;
    }

    struct Access {
        address user;
        bool hasAccess;
    }

    mapping(uint => File) public files;
    mapping(address => uint[]) public userFiles;
    mapping(uint => mapping(address => bool)) public fileAccess;
    mapping(uint => Access[]) public fileAccessList;
    mapping(uint => string) public encryptedFileHashes;
    mapping(uint => bool) public isPublic;
    uint public fileCount;
}
