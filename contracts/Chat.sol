// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ChatFactory.sol";

contract Chat {
    struct Message {
        bytes32 id;
        bytes32 parentId;
        address sender;
        string senderAlias;
        string content;
        uint256 timestamp;
    }

    event MessageSent(
        bytes32 indexed id,
        bytes32 indexed parentId,
        address indexed sender,
        string senderAlias,
        string content,
        uint256 timestamp
    );

    Message[] public messages;
    ChatFactory public factory;

    constructor() {
        factory = ChatFactory(msg.sender);
    }

    function sendMessage(string memory _content, bytes32 _parentId) public {
        // Generate a pseudo-unique ID for the message
        bytes32 messageId = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, messages.length)
        );

        Message memory newMessage = Message({
            id: messageId,
            parentId: _parentId,
            sender: msg.sender,
            senderAlias: factory.getAlias(msg.sender),
            content: _content,
            timestamp: block.timestamp
        });
        messages.push(newMessage);
        emit MessageSent(
            newMessage.id,
            newMessage.parentId,
            newMessage.sender,
            newMessage.senderAlias,
            newMessage.content,
            newMessage.timestamp
        );
    }

    function getMessages() public view returns (Message[] memory) {
        uint256 messageCount = messages.length;
        Message[] memory allMessages = new Message[](messageCount);
        for (uint256 i = 0; i < messageCount; i++) {
            // Copy the message to the new array without referencing the original
            allMessages[i].id = messages[i].id;
            allMessages[i].parentId = messages[i].parentId;
            allMessages[i].sender = messages[i].sender;
            allMessages[i].content = messages[i].content;
            allMessages[i].timestamp = messages[i].timestamp;
            // Update the senderAlias for each message without modifying the original
            allMessages[i].senderAlias = factory.getAlias(messages[i].sender);
        }
        return allMessages;
    }
}
