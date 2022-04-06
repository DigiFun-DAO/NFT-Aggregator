// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract ERC721Test is ERC721Enumerable {
    
    address private creator;

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {
        creator = msg.sender;
    }

    function mint(address to, uint256 tokenId) public returns (bool) {
        require(creator == msg.sender);
        _mint(to, tokenId);
        return true;
    }
}