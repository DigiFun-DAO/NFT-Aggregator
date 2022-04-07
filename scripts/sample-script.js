// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
var w3 = require('web3')
var BN = w3.utils.BN;

const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = require('hardhat');

async function main() {
  await release()
}

async function erc20() {
  const MANA = await hre.ethers.getContractFactory("ERC20Test")
  const mana = await MANA.deploy('MANA', 'MN')
  await mana.deployed()
  console.log("MANA deployed to:", mana.address)

  await mana.mint("0xf0A3FdF9dC875041DFCF90ae81D7E01Ed9Bc2033", w3.utils.toWei('100000000', 'ether'))
}

async function debug() {
  const [owner, user, office] = await ethers.getSigners()

  const Aggregator = await hre.ethers.getContractFactory("Aggregator")
  const aggregator = await Aggregator.deploy(office.address, 1000)
  await aggregator.deployed()
  console.log("aggregator deployed to:", aggregator.address)

  const ERC721Test = await hre.ethers.getContractFactory("ERC721Test")
  const erc721 = await ERC721Test.deploy("Ice Shadow", "IS")
  await erc721.deployed()
  console.log("erc721 deployed to:", erc721.address)

  const ERC1155Test = await hre.ethers.getContractFactory("ERC1155Test")
  const erc1155 = await ERC1155Test.deploy("test_uri")
  await erc1155.deployed()
  console.log("erc1155 deployed to:", erc1155.address)

  const MANA = await hre.ethers.getContractFactory("ERC20Test")
  const mana = await MANA.deploy('MANA', 'MN')
  await mana.deployed()
  console.log("MANA deployed to:", mana.address)

  const bana = await MANA.deploy('BANA', 'BN')
  await bana.deployed()
  console.log("BANA deployed to:", bana.address)

  nftNum = 10

  await aggregator.createNFT(0, "desc0", 90, 1, 1000, nftNum, 0, erc721.address, mana.address)
  await aggregator.createNFT(1, "desc1", 90, 10001, 11000, nftNum, 0, erc721.address, mana.address)
  await aggregator.createNFT(10, "desc0", 20, 20000, 20000, nftNum, 1, erc1155.address, bana.address)
  await aggregator.createNFT(11, "desc1", 20, 20001, 20001, nftNum, 1, erc1155.address, bana.address)
  await aggregator.createNFT(12, "desc2", 20, 20002, 20002, nftNum, 1, erc1155.address, bana.address)
  await aggregator.createNFT(13, "desc3", 20, 20003, 20003, nftNum, 1, erc1155.address, bana.address)
  await aggregator.createNFT(14, "desc4", 20, 20004, 20004, nftNum, 1, erc1155.address, bana.address)
  await aggregator.createNFT(15, "desc5", 20, 20005, 20005, nftNum, 1, erc1155.address, bana.address)
  await aggregator.createNFT(16, "desc6", 20, 20006, 20006, nftNum, 1, erc1155.address, bana.address)
  await aggregator.createNFT(17, "desc7", 20, 20007, 20007, nftNum, 1, erc1155.address, bana.address)
  await aggregator.createNFT(18, "desc8", 20, 20008, 20008, nftNum, 1, erc1155.address, bana.address)

  for (i = 1; i <= nftNum; i++) {
    await erc721.mint(aggregator.address, i)
    await erc721.mint(aggregator.address, i + 10000)
  }
  console.log("mint 10 erc721 nft group to address:", aggregator.address)

  for (i = 0; i < 9; i++) {
    await erc1155.mint(aggregator.address, 20000 + i, nftNum, w3.utils.asciiToHex("test"))
  }
  console.log("mint 10 erc1155 nft group to address:", aggregator.address)

  await mana.mint(user.address, 10000)
  console.log("mint %d mana to user", await mana.balanceOf(user.address))
  await bana.mint(user.address, 10000)
  console.log("mint %d bana to user", await bana.balanceOf(user.address))

  // Query balance
  erc721Balance = await erc721.balanceOf(aggregator.address)
  erc721UserBalance = await erc721.balanceOf(user.address)
  console.log("erc721 balance of aggregator: ", erc721Balance)
  console.log("erc721 balance of user: ", erc721UserBalance)

  for (i = 0; i < 9; i++) {
    erc1155Balance = await erc1155.balanceOf(aggregator.address, 20000 + i)
    erc1155UserBalance = await erc1155.balanceOf(user.address, 20000 + i)
    console.log("erc1155 %d balance of aggregator: %d", i, erc1155Balance)
    console.log("erc1155 %d balance of user: %d", i, erc1155UserBalance)
  }

  contractManaBalance = await mana.balanceOf(aggregator.address)
  userManaBalance = await mana.balanceOf(user.address)
  officeManaBalance = await mana.balanceOf(office.address)
  console.log("contract owns %d mana.", contractManaBalance)
  console.log("user owns %d mana.", userManaBalance)
  console.log("office owns %d mana.", officeManaBalance)

  contractBanaBalance = await bana.balanceOf(aggregator.address)
  userBanaBalance = await bana.balanceOf(user.address)
  officeBanaBalance = await bana.balanceOf(office.address)
  console.log("contract owns %d bana.", contractBanaBalance)
  console.log("user owns %d bana.", userBanaBalance)
  console.log("office owns %d bana.", officeBanaBalance)
  // =======

  console.log("user buy nft")
  await mana.connect(user).approve(aggregator.address, 10000)
  await bana.connect(user).approve(aggregator.address, 10000)

  await aggregator.connect(user).buyNFTs(user.address, [0, 1], [4, 6])


  // Query balance
  erc721Balance = await erc721.balanceOf(aggregator.address)
  erc721UserBalance = await erc721.balanceOf(user.address)
  console.log("erc721 balance of aggregator: ", erc721Balance)
  console.log("erc721 balance of user: ", erc721UserBalance)

  for (i = 0; i < 9; i++) {
    erc1155Balance = await erc1155.balanceOf(aggregator.address, 20000 + i)
    erc1155UserBalance = await erc1155.balanceOf(user.address, 20000 + i)
    console.log("erc1155 %d balance of aggregator: %d", i, erc1155Balance)
    console.log("erc1155 %d balance of user: %d", i, erc1155UserBalance)
  }

  contractManaBalance = await mana.balanceOf(aggregator.address)
  userManaBalance = await mana.balanceOf(user.address)
  officeManaBalance = await mana.balanceOf(office.address)
  console.log("contract owns %d mana.", contractManaBalance)
  console.log("user owns %d mana.", userManaBalance)
  console.log("office owns %d mana.", officeManaBalance)

  contractBanaBalance = await bana.balanceOf(aggregator.address)
  userBanaBalance = await bana.balanceOf(user.address)
  officeBanaBalance = await bana.balanceOf(office.address)
  console.log("contract owns %d bana.", contractBanaBalance)
  console.log("user owns %d bana.", userBanaBalance)
  console.log("office owns %d bana.", officeBanaBalance)
  // =======

  await aggregator.connect(user).buyNFTs(user.address, [10, 11, 15, 18], [5, 5, 7, 3])

  // Query balance
  erc721Balance = await erc721.balanceOf(aggregator.address)
  erc721UserBalance = await erc721.balanceOf(user.address)
  console.log("erc721 balance of aggregator: ", erc721Balance)
  console.log("erc721 balance of user: ", erc721UserBalance)

  for (i = 0; i < 9; i++) {
    erc1155Balance = await erc1155.balanceOf(aggregator.address, 20000 + i)
    erc1155UserBalance = await erc1155.balanceOf(user.address, 20000 + i)
    console.log("erc1155 %d balance of aggregator: %d", i, erc1155Balance)
    console.log("erc1155 %d balance of user: %d", i, erc1155UserBalance)
  }

  contractManaBalance = await mana.balanceOf(aggregator.address)
  userManaBalance = await mana.balanceOf(user.address)
  officeManaBalance = await mana.balanceOf(office.address)
  console.log("contract owns %d mana.", contractManaBalance)
  console.log("user owns %d mana.", userManaBalance)
  console.log("office owns %d mana.", officeManaBalance)

  contractBanaBalance = await bana.balanceOf(aggregator.address)
  userBanaBalance = await bana.balanceOf(user.address)
  officeBanaBalance = await bana.balanceOf(office.address)
  console.log("contract owns %d bana.", contractBanaBalance)
  console.log("user owns %d bana.", userBanaBalance)
  console.log("office owns %d bana.", officeBanaBalance)


  // await aggregator.connect(user).buyNFTs(user.address, [0], [20])
  // await aggregator.connect(user).buyNFTs(user.address, [10], [6])
  await aggregator.transferERC20(user.address, 810, mana.address)
  await aggregator.transferERC20(user.address, 360, bana.address)
  await aggregator.transferNFTs(user.address, [0, 1])
  await aggregator.transferNFTs(user.address, [10, 11, 12, 13, 14, 15, 16, 17, 18])

  // Query balance
  erc721Balance = await erc721.balanceOf(aggregator.address)
  erc721UserBalance = await erc721.balanceOf(user.address)
  console.log("erc721 balance of aggregator: ", erc721Balance)
  console.log("erc721 balance of user: ", erc721UserBalance)

  for (i = 0; i < 9; i++) {
    erc1155Balance = await erc1155.balanceOf(aggregator.address, 20000 + i)
    erc1155UserBalance = await erc1155.balanceOf(user.address, 20000 + i)
    console.log("erc1155 %d balance of aggregator: %d", i, erc1155Balance)
    console.log("erc1155 %d balance of user: %d", i, erc1155UserBalance)
  }

  contractManaBalance = await mana.balanceOf(aggregator.address)
  userManaBalance = await mana.balanceOf(user.address)
  officeManaBalance = await mana.balanceOf(office.address)
  console.log("contract owns %d mana.", contractManaBalance)
  console.log("user owns %d mana.", userManaBalance)
  console.log("office owns %d mana.", officeManaBalance)

  contractBanaBalance = await bana.balanceOf(aggregator.address)
  userBanaBalance = await bana.balanceOf(user.address)
  officeBanaBalance = await bana.balanceOf(office.address)
  console.log("contract owns %d bana.", contractBanaBalance)
  console.log("user owns %d bana.", userBanaBalance)
  console.log("office owns %d bana.", officeBanaBalance)
}

async function release() {

  const Aggregator = await hre.ethers.getContractFactory("Aggregator")
  // const aggregator = await Aggregator.deploy('0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952', 0)
  // await aggregator.deployed()
  const aggregator = await Aggregator.attach('0xE1Cf0dDAAF53e79d0126a377981482D39D799f6E')
  console.log("aggregator deployed to:", aggregator.address)

  const ERC721Test = await hre.ethers.getContractFactory("ERC721Test")
  const erc721 = await ERC721Test.attach("0x9B0A93EA49955a5ef1878c1a1e8f8645d049e597")
  console.log("erc721 address:", erc721.address)

  const ERC1155Test = await hre.ethers.getContractFactory("ERC1155Test")
  const erc1155 = await ERC1155Test.attach("0x9eA07c5Ee61e82993B0544CEcEcaDeDD3C9F0fA1")
  console.log("erc1155 address:", erc1155.address)

  const MANA = await hre.ethers.getContractFactory("ERC20Test")
  const mana = await MANA.attach("0x308a6B4974264Ddc9e1a51C32A081a8ec507b675")
  console.log("MANA address:", mana.address)

  nftNum = 10

  await aggregator.createNFTs([0,1,10,11,12,13,14,15,16,17,18], 
    ["desc0","desc1","desc10","desc11","desc12","desc13","desc14","desc15","desc16","desc17","desc18"], 
    [w3.utils.toWei('9', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('3', 'ether')],
    [1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'), 70, 71, 72, 73, 74, 75, 76, 77, 78], 
    [1000, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310978536', 'wei'), 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
    [nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum], 
    [0,0,1,1,1,1,1,1,1,1,1],
    [erc721.address,erc721.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address],
    [mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address])

  // await erc1155.safeBatchTransferFrom("0x63a725fEee4C8D89f7064f36785a980bc2AC4ce5", aggregator.address, [70,71,72,73,74,75,76,77,78], [nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum], w3.utils.asciiToHex("test"))
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });