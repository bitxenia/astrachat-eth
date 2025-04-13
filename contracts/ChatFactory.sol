// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Chat.sol";

contract ChatFactory {
    address[] public chats;
    string[] public chatNames;
    mapping(string => address) public chatNameToAddress;

    function createChat(string memory _name) public {
        require(
            chatNameToAddress[_name] == address(0),
            "Chat with this name already exists"
        );
        Chat newChat = new Chat();
        chats.push(address(newChat));
        chatNames.push(_name);
        chatNameToAddress[_name] = address(newChat);
    }
}
