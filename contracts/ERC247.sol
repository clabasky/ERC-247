// SPDX-License-Identifier: MIT
// Author: Chris Labasky https://chrislabasky.com

pragma solidity ^0.8.24;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
}

contract ERC247 {

    string public name;
    string public baseURI;

    constructor(string memory _name) {
        name = _name;
        emit ERC247Created(_name);
    }

    event ERC247Created (
        string name
    );

    event Post (
        address indexed nftContract,
        uint256 tokenId,
        bytes32 indexed channel,
        string content,
        bytes32 indexed profileId,
        bytes32 postId
    );

    function createPost(address _nftContract, uint256 _tokenId, bytes32 _channel, string memory _content) public {
        address tokenOwner = IERC721(_nftContract).ownerOf(_tokenId);
        require(tokenOwner == msg.sender, "msg.sender does not own this NFT");
        bytes32 _profileId = profileId(_nftContract, _tokenId);
        bytes32 _postId = keccak256(abi.encodePacked(_profileId, _content, block.number));
        emit Post(_nftContract, _tokenId, _channel, _content, _profileId, _postId);
    }

    function profileId(address _nftContract, uint256 _tokenId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_nftContract, _tokenId));
    }

    function uri() public view returns (string memory) {
        require(bytes(baseURI).length != 0,"No baseURI specified");
        return string.concat(baseURI, "{profileId}.json");
    }
}
