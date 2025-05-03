// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Chat.sol";

contract ChatFactory {
    address[] public chats;
    string[] public chatNames;
    mapping(string => address) public chatNameToAddress;
    mapping(address => string) public walletAddressToAlias;

    function createChat(string memory _name) public {
        require(
            chatNameToAddress[_name] == address(0),
            "Chat with this name already exists"
        );
        require(bytes(_name).length > 0, "Chat name cannot be empty");
        Chat newChat = new Chat();
        chats.push(address(newChat));
        chatNames.push(_name);
        chatNameToAddress[_name] = address(newChat);
    }

    function setAlias(string memory _alias) public {
        require(
            bytes(walletAddressToAlias[msg.sender]).length == 0,
            "Alias already exists"
        );
        require(bytes(_alias).length > 0, "Alias cannot be empty");
        walletAddressToAlias[msg.sender] = _alias;
    }

    function getAlias(
        address _walletAddress
    ) public view returns (string memory) {
        return walletAddressToAlias[_walletAddress];
    }
}
