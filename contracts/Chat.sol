// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Chat {
    struct Message {
        bytes32 id;
        bytes32 parentId;
        address sender;
        string content;
        uint256 timestamp;
    }

    event MessageSent(
        bytes32 indexed id,
        bytes32 indexed parentId,
        address indexed sender,
        string content,
        uint256 timestamp
    );

    Message[] public messages;

    function sendMessage(string memory _content, bytes32 _parentId) public {
        // Generate a pseudo-unique ID for the message
        bytes32 messageId = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, messages.length)
        );

        Message memory newMessage = Message({
            id: messageId,
            parentId: _parentId,
            sender: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });
        messages.push(newMessage);
        emit MessageSent(
            messageId,
            _parentId,
            msg.sender,
            _content,
            block.timestamp
        );
    }

    function getMessages() public view returns (Message[] memory) {
        return messages;
    }
}
