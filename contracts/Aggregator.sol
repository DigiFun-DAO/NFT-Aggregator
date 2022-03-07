// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Aggregator{
    IERC20 private MANA;

    address private creator;
    address private officialWallet;

    uint256 transferFee;

    struct NFT{
        uint id;
        string name;
        string desc;
        uint256 price;
        uint256 lowerBound;
        uint256 upperBound;
        uint balance;
        address addr;
    }
    mapping(string => NFT[]) private NFTGroup;

    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    constructor(address incomeAddress, address manaAddress, uint256 fee) {
        creator = msg.sender;
        officialWallet = incomeAddress;
        MANA = IERC20(manaAddress);
        transferFee = fee;
    }

    function createNFT(
        string memory groupKey, 
        uint id, 
        string memory name, 
        string memory desc, 
        uint price, 
        uint256 lowerBound, 
        uint256 upperBound, 
        uint256 balance, 
        address addr) public {
        require(creator == msg.sender);
        NFTGroup[groupKey].push(NFT(id, name, desc, price, lowerBound, upperBound, balance, addr));
    }

    function increaseNFT(
        string memory groupKey, 
        uint id,
        uint256 increasement) public {
        require(creator == msg.sender);
        for(uint i = 0; i < NFTGroup[groupKey].length; i++) {
            if(NFTGroup[groupKey][i].id == id) {
                NFTGroup[groupKey][i].balance += increasement;
                return;
            }
        }
        revert("NFT not found");
    }

    function getNFTName(string memory groupKey, uint id) public view returns (string memory) {
        for(uint i = 0; i < NFTGroup[groupKey].length; i++) {
            if (NFTGroup[groupKey][i].id == id) {
                return NFTGroup[groupKey][i].name;
            }
        }
        revert("NFT not found");
    }

    function getNFTAddress(string memory groupKey, uint id) public view returns (address) {
        for(uint i = 0; i < NFTGroup[groupKey].length; i++) {
            if (NFTGroup[groupKey][i].id == id) {
                return NFTGroup[groupKey][i].addr;
            }
        }
        revert("NFT not found");
    }

    function buyNFT(address to, string memory groupKey, uint id) public {
        for(uint i = 0; i < NFTGroup[groupKey].length; i++) {
            if (NFTGroup[groupKey][i].id == id) {
                require(NFTGroup[groupKey][i].balance > 0);
                _transferNFT(to, NFTGroup[groupKey][i]);
                _transferERC20(address(this), officialWallet, NFTGroup[groupKey][i].price);
                return;
            }
        }
        revert("NFT not found");
    }

    function buyNFTGroup(address to, string memory groupKey) public {
        for(uint i = 0; i < NFTGroup[groupKey].length; i++) {
            require(NFTGroup[groupKey][i].balance > 0);
        }

        uint256 sum = 0;
        for(uint i = 0; i < NFTGroup[groupKey].length; i++) {
            sum += NFTGroup[groupKey][i].price;
        }
        if (sum == 0) {
            revert("NFT not found");
        }

        _transferERC20(address(this), officialWallet, sum);
        
        for(uint i = 0; i < NFTGroup[groupKey].length; i++) {
            _transferNFT(to, NFTGroup[groupKey][i]);
        }
    }

    function _transferERC20(address _to, address _feeTo, uint256 price) internal {
        uint256 fee = (price * transferFee / 100);
        MANA.transferFrom(msg.sender, _to, price - fee);
        MANA.transferFrom(msg.sender, _feeTo, fee);
    }

    function _transferNFT(address to, NFT memory nft) internal {
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
        revert("NFT not found");
    }

    // function _safeTransfer(address to, uint value) private {
    //     (bool success, bytes memory data) = MANA.call(abi.encodeWithSelector(SELECTOR, to, value));
    //     require(success && (data.length == 0 || abi.decode(data, (bool))), 'TRANSFER_FAILED');
    // }
}
