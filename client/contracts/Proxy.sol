// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Proxy {
    address public implementation;
    event Upgraded(address indexed newImplementation);

    constructor(address _initialImplementation) {
        implementation = _initialImplementation;
    }

    function upgradeTo(address _newImplementation) public {
        implementation = _newImplementation;
        emit Upgraded(_newImplementation);
    }

    fallback() external payable {
        address impl = implementation;
        require(impl != address(0), "Implementation contract not set");

        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
            returndatacopy(ptr, 0, returndatasize())
            switch result
            case 0 { revert(ptr, returndatasize()) }
            default { return(ptr, returndatasize()) }
        }
    }

    receive() external payable {}
}