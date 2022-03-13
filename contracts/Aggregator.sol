// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Aggregator{
    IERC20 private MANA; // mana address
    address private owner; // contract address
    address private officialWallet; // official address
    uint256 transferFee; // need to divide 10000

    struct NFT{
        string desc;
        uint256 price;
        uint256 lowerBound;
        uint256 upperBound;
        uint256 balance;
        address addr;
    }
    mapping(string => string[]) private NFTGroups; // groupName -> NFT name array
    mapping(string => NFT) private NFTs; // NFT name -> NFT

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address incomeAddress, address manaAddress, uint256 fee) {
        owner = msg.sender;
        officialWallet = incomeAddress;
        MANA = IERC20(manaAddress);
        transferFee = fee;
    }

    function putNFTsIntoGroup(string[] memory nftNames, string memory groupName) public onlyOwner {
        for (uint256 i = 0; i < nftNames.length; i++) {
            NFTGroups[groupName].push(nftNames[i]);
        }
    }

    function deleteNFTFromGroup(string memory nftName, string memory groupName) public onlyOwner {
        uint len = NFTGroups[groupName].length;
        for(uint i = 0; i < len; i++) {
            if(keccak256(abi.encodePacked(NFTGroups[groupName][i])) == keccak256(abi.encodePacked(nftName))) {
                delete NFTGroups[groupName][i];
                if (i != len - 1) {
                    NFTGroups[groupName][i] = NFTGroups[groupName][len - 1];
                    NFTGroups[groupName].pop();
                }
                return;
            }
        }
    }

    function createNFT(
        string memory name, 
        string memory desc, 
        uint256 price, 
        uint256 lowerBound, 
        uint256 upperBound, 
        uint256 balance, 
        address addr) public onlyOwner{
            require(NFTs[name].addr == address(0), "nft already exists");
            NFTs[name] = NFT(desc, price, lowerBound, upperBound, balance, addr);
    }

    function increaseNFT(
        string memory name,
        uint256 increasement) public onlyOwner{
            NFTs[name].balance += increasement;
    }

    function getNFT(string memory name) public view returns (string memory, uint256, uint256, uint256, uint256, address) {
        NFT memory nft = NFTs[name];
        return (nft.desc, nft.price, nft.lowerBound, nft.upperBound, nft.balance, nft.addr);
    }

    function getNFTGroup(string memory groupName) public view returns (string [] memory) {
        return NFTGroups[groupName];
    }

    function buyNFT(address to, string memory nftName) public {
        require(NFTs[nftName].balance > 0, "nft not enough");
        _transferNFT(to, NFTs[nftName]);
        _transferERC20(address(this), officialWallet, NFTs[nftName].price);
        return;
    }

    function buyNFTGroup(address to, string memory groupName) public {
        string[] memory nftgroup = NFTGroups[groupName];
        require(nftgroup.length > 0, "no nft in such nftgroup");
        uint256 sum = 0;
        for(uint i = 0; i < nftgroup.length; i++) {
            require(NFTs[nftgroup[i]].balance > 0, "nft not enough");
            sum += NFTs[nftgroup[i]].price;
        }
        _transferERC20(address(this), officialWallet, sum);
        for(uint i = 0; i < nftgroup.length; i++) {
            _transferNFT(to, NFTs[nftgroup[i]]);
        }
    }

    function transferERC20(address _to, uint256 amt) public onlyOwner {
        require(amt > 0);
        MANA.transfer(_to, amt);
    }

    function _transferERC20(address _to, address _feeTo, uint256 price) internal {
        uint256 fee = price * transferFee / 10000;
        require(fee > 0);
        require(price - fee > 0);
        MANA.transferFrom(msg.sender, _to, price - fee);
        MANA.transferFrom(msg.sender, _feeTo, fee);
    }

    function transferNFT(address to, string memory name, uint256 num) public onlyOwner {
        NFT memory nft = NFTs[name];
        require (nft.addr != address(0), "nft not found");
        require (nft.balance >= num, "nft not enough");
        NFTs[name].balance -= num;
        IERC721Enumerable nftContract = IERC721Enumerable(nft.addr);
        uint256 total = nftContract.balanceOf(address(this));
        for(uint i = 0; i < total; i++) {
            uint256 tokenId = nftContract.tokenOfOwnerByIndex(address(this), i);
            if (tokenId <= nft.upperBound && tokenId >= nft.lowerBound) {
                nftContract.transferFrom(address(this), to, tokenId);
                i--;
                total--;
                num--;
                if(num == 0) {
                    return;
                }
            }
        }
    }

    function _transferNFT(address to, NFT storage nft) internal {
        IERC721Enumerable nftContract = IERC721Enumerable(nft.addr);
        uint256 total = nftContract.balanceOf(address(this));
        for(uint i = 0; i < total; i++) {
            uint256 tokenId = nftContract.tokenOfOwnerByIndex(address(this), i);
            if (tokenId <= nft.upperBound && tokenId >= nft.lowerBound) {
                nft.balance -= 1;
                nftContract.transferFrom(address(this), to, tokenId);
                return;
            }
        }
        revert("nft not found");
    }

}