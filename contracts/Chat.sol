// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Chat {
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    event MessageSent(
        address indexed sender,
        string content,
        uint256 timestamp
    );

    Message[] public messages;

    function sendMessage(string memory _content) public {
        Message memory newMessage = Message({
            sender: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });
        messages.push(newMessage);
        emit MessageSent(msg.sender, _content, block.timestamp);
    }

    function getMessages() public view returns (Message[] memory) {
        return messages;
    }
}
