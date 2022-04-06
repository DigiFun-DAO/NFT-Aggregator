// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Aggregator is ERC1155Holder{

    address private owner;          // contract address
    address private officialWallet; // official address
    uint256 transferFee;            // need to divide 10000

    struct NFT{
        string desc;
        uint256 price;
        uint256 lowerBound;
        uint256 upperBound;
        uint256 balance;
        uint nftType; // 0 for ERC721, 1 for ERC1155
        address nftAddr;
        address erc20Addr;
    }
    mapping(uint256 => NFT) private NFTs; // NFT name -> NFT
    

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address incomeAddress, uint256 fee) {
        owner = msg.sender;
        officialWallet = incomeAddress;
        transferFee = fee;
    }

    function createNFT(
        uint256 nid, 
        string memory desc, 
        uint256 price, 
        uint256 lowerBound, 
        uint256 upperBound, 
        uint256 balance, 
        uint nftType,
        address nftAddr,
        address erc20Addr) public onlyOwner{
            require(NFTs[nid].nftAddr == address(0), "nft already exists");
            require(nftType < 2, "nft type not support");
            NFTs[nid] = NFT(desc, price, lowerBound, upperBound, balance, nftType, nftAddr, erc20Addr);
    }

    function increaseNFT(
        uint256 nid,
        uint256 increasement) public onlyOwner{
            NFTs[nid].balance += increasement;
    }

    function getNFT(uint256 nid) public view returns (string memory, uint256, uint256, uint256, uint256, uint, address, address) {
        NFT memory nft = NFTs[nid];
        return (nft.desc, nft.price, nft.lowerBound, nft.upperBound, nft.balance, nft.nftType, nft.nftAddr, nft.erc20Addr);
    }

    function buyNFTs(address to, uint256[] memory nids, uint256[] memory amounts) public {
        require(nids.length > 0, "nft number == 0");
        uint256[] memory nfts = new uint256[](nids.length);
        uint256 sum;
        for (uint256 i = 0; i < nids.length; i++) {
            require(NFTs[nids[i]].balance >= amounts[i], "nft not enough");
            if (i < nids.length - 1) {
                require(NFTs[nids[i]].nftType == NFTs[nids[i+1]].nftType, "nft type should be same");
                require(NFTs[nids[i]].nftAddr == NFTs[nids[i+1]].nftAddr, "nft addr should be same");
                require(NFTs[nids[i]].erc20Addr == NFTs[nids[i+1]].erc20Addr, "erc20 addr should be same");
            }
            nfts[i] = nids[i];
            sum += NFTs[nids[i]].price * amounts[i];
        }

        if (NFTs[nids[0]].nftType == 0) {
            _transferNFT721(to, nfts, amounts);
        } else {
            _transferNFT1155(to, nfts, amounts);
        }

        _transferERC20(address(this), officialWallet, sum, NFTs[nids[0]].erc20Addr);

        return;
    }

    function transferERC20(address _to, uint256 amt, address erc20Addr) public onlyOwner {
        require(amt > 0);
        IERC20 erc20 = IERC20(erc20Addr);
        erc20.transfer(_to, amt);
    }

    function transferNFTs(address to, uint256[] memory nids) public onlyOwner {
        require(nids.length > 0, "len(nids) == 0");
        for (uint256 i = 0; i < nids.length; i++) {
            require(NFTs[nids[i]].balance > 0, "nft not enough");
            if (i < nids.length - 1) {
                require(NFTs[nids[i]].nftType == NFTs[nids[i+1]].nftType, "nft type should be same");
                require(NFTs[nids[i]].nftAddr == NFTs[nids[i+1]].nftAddr, "nft addr should be same");
                require(NFTs[nids[i]].erc20Addr == NFTs[nids[i+1]].erc20Addr, "erc20 addr should be same");
            }
        }

        if (NFTs[nids[0]].nftType == 0) {
            _transferAllNFT721(to, nids);
        } else {
            _transferAllNFT1155(to, nids);
        }
    }

    function _transferERC20(address _to, address _feeTo, uint256 price, address erc20Addr) internal {
        uint256 fee = price * transferFee / 10000;
        require(price - fee > 0);
        IERC20 erc20 = IERC20(erc20Addr);
        if (price - fee > 0) {
            erc20.transferFrom(msg.sender, _to, price - fee);
        }
        if (fee > 0) {
            erc20.transferFrom(msg.sender, _feeTo, fee);
        }
    }
 
     // only for the same nft address
    function _transferNFT721(address to, uint256[] memory nids, uint256[] memory amounts) internal {
        require(nids.length > 0, "len(nids) == 0");

        IERC721Enumerable erc721 = IERC721Enumerable(NFTs[nids[0]].nftAddr);
        uint256 total = erc721.balanceOf(address(this));
        require(total >= nids.length, "nft not enough");

        for (uint256 i = 0; i < nids.length; i++) {
            for(uint256 j = 0; j < total;) {
                uint256 tokenId = erc721.tokenOfOwnerByIndex(address(this), j);
                if (tokenId >= NFTs[nids[i]].lowerBound && tokenId <= NFTs[nids[i]].upperBound) {
                    erc721.transferFrom(address(this), to, tokenId);
                    NFTs[nids[i]].balance--;
                    amounts[i]--;
                    total--;
                    if (amounts[i] == 0) {
                        break;
                    }
                } else {
                    j++;
                }
            }
        }
    }

    // only for the same nft address
    function _transferNFT1155(address to, uint256[] memory nids, uint256[] memory amounts) internal {
        require(nids.length > 0, "len(nids) == 0");
        require(nids.length == amounts.length, "len(nids) != len(amounts)");
        uint256[] memory ids = new uint256[](nids.length);
        IERC1155 erc1155 = IERC1155(NFTs[nids[0]].nftAddr);
        for (uint256 i = 0; i < nids.length; i++) {
            require(NFTs[nids[i]].nftType == 1, "nft type is not erc1155");
            require(NFTs[nids[i]].balance >= amounts[i], "nft not enough");
            if (i < nids.length - 1) {
                require(NFTs[nids[i]].nftAddr == NFTs[nids[i+1]].nftAddr, "nft addr not same");
            }
            ids[i] = NFTs[nids[i]].lowerBound;
            NFTs[nids[i]].balance -= amounts[i];
        }
        bytes memory bs;
        erc1155.safeBatchTransferFrom(address(this), to, ids, amounts, bs);
    }

         // only for the same nft address
    function _transferAllNFT721(address to, uint256[] memory nids) internal {
        require(nids.length > 0, "len(nids) == 0");

        IERC721Enumerable erc721 = IERC721Enumerable(NFTs[nids[0]].nftAddr);
        uint256 total = erc721.balanceOf(address(this));

        while(total > 0) {
            uint256 tokenId = erc721.tokenOfOwnerByIndex(address(this), 0);
            erc721.transferFrom(address(this), to, tokenId);
            total--;
        }
    }

    function _transferAllNFT1155(address to, uint256[] memory nids) internal {
        require(nids.length > 0, "len(nids) == 0");
        uint256[] memory ids = new uint256[](nids.length);
        uint256[] memory amounts = new uint256[](nids.length);
        IERC1155 erc1155 = IERC1155(NFTs[nids[0]].nftAddr);
        for (uint256 i = 0; i < nids.length; i++) {
            require(NFTs[nids[i]].nftType == 1, "nft type is not erc1155");
            if (i < nids.length - 1) {
                require(NFTs[nids[i]].nftAddr == NFTs[nids[i+1]].nftAddr, "nft addr not same");
            }
            ids[i] = NFTs[nids[i]].lowerBound;
            amounts[i] = NFTs[nids[i]].balance;
            NFTs[nids[i]].balance = 0;
        }
        bytes memory bs;
        erc1155.safeBatchTransferFrom(address(this), to, ids, amounts, bs);
    }
}