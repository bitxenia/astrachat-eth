// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Chat.sol";

contract ChatFactory {
    address[] public chats;
    string[] public chatNames;
    mapping(string => address) public chatNameToAddress;
    mapping(address => string) public walletAddressToAlias;
    mapping(string => address) public aliasToWalletAddress;

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
            aliasToWalletAddress[_alias] == address(0),
            "Alias already taken"
        );
        require(bytes(_alias).length > 0, "Alias cannot be empty");

        string memory currentAlias = walletAddressToAlias[msg.sender];
        walletAddressToAlias[msg.sender] = _alias;
        aliasToWalletAddress[_alias] = msg.sender;

        // Clear the previous alias if it exists
        if (bytes(currentAlias).length > 0) {
            delete aliasToWalletAddress[currentAlias];
        }
    }

    function getAlias(
        address _walletAddress
    ) public view returns (string memory) {
        return walletAddressToAlias[_walletAddress];
    }
}
