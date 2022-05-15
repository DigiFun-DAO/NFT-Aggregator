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
  await debug()
    // await transferERC1155()
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
  const aggregator = await Aggregator.deploy(office.address, 0)
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

  nftNum = 10

  await aggregator.createNFTs(
    [0,1,10,11,12,13,14,15,16,17,18], 
    ["DigiFun Ice Shadow-helmet","DigiFun Ice Shadow-upper body","DigiFun Ice Shadow-9-left base","DigiFun Ice Shadow-8-right base","DigiFun Ice Shadow-7-leg","DigiFun Ice Shadow-6-lower left wing","DigiFun Ice Shadow-5-upper left wing","DigiFun Ice Shadow-4-lower right wing","DigiFun Ice Shadow-3-upper right wing","DigiFun Ice Shadow-2-chest","DigiFun Ice Shadow-1-head"], 
    [w3.utils.toWei('9', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('3', 'ether')],
    [1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'), 70, 71, 72, 73, 74, 75, 76, 77, 78], 
    [1000, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310978536', 'wei'), 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
    [nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum], 
    [0,0,1,1,1,1,1,1,1,1,1],
    [erc721.address,erc721.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address],
    [mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address])

  for (i = 1; i <= nftNum; i++) {
    await erc721.mint(aggregator.address, i)
    newAddr = new BN('105312291668557186697918027683670432318895095400549111254310977536').add(new BN(i)).toString();
    await erc721.mint(aggregator.address, w3.utils.toWei(newAddr, 'wei'))
  }
  console.log("mint 10 erc721 nft group to address:", aggregator.address)

  for (i = 0; i < 9; i++) {
    await erc1155.mint(aggregator.address, 70 + i, nftNum, w3.utils.asciiToHex("test"))
  }
  console.log("mint 10 erc1155 nft group to address:", aggregator.address)

  await mana.mint(user.address, w3.utils.toWei('1000', 'ether'))
  console.log("mint %d mana to user", await mana.balanceOf(user.address))

  async function query() {
    // Query balance
    erc721Balance = await erc721.balanceOf(aggregator.address)
    erc721UserBalance = await erc721.balanceOf(user.address)
    console.log("erc721 balance of aggregator: ", erc721Balance)
    console.log("erc721 balance of user: ", erc721UserBalance)

    for (i = 0; i < 9; i++) {
      erc1155Balance = await erc1155.balanceOf(aggregator.address, 70 + i)
      erc1155UserBalance = await erc1155.balanceOf(user.address, 70 + i)
      console.log("erc1155 %d balance of aggregator: %d", i, erc1155Balance)
      console.log("erc1155 %d balance of user: %d", i, erc1155UserBalance)
    }

    contractManaBalance = await mana.balanceOf(aggregator.address)
    userManaBalance = await mana.balanceOf(user.address)
    officeManaBalance = await mana.balanceOf(office.address)
    console.log("contract owns %d mana.", contractManaBalance)
    console.log("user owns %d mana.", userManaBalance)
    console.log("office owns %d mana.", officeManaBalance)
  }

  await query()

  console.log("user buy nft")
  await mana.connect(user).approve(aggregator.address, w3.utils.toWei('1000', 'ether'))
  await aggregator.connect(user).buyNFTs(user.address, [0, 1], [5, 5])

  await query()

  await aggregator.connect(user).buyNFTs(user.address, [10, 11, 13, 14], [5, 5, 5, 5])

  await query()

  await aggregator.createNFTGroup("Ice Shadow", "dcl", 0, [0, 1])
  await aggregator.createNFTGroup("Ice Shadow", "cv", 1, [10, 11, 12, 13, 14, 15, 16, 17, 18])

  await erc721.connect(user).setApprovalForAll(aggregator.address, true)
  await erc1155.connect(user).setApprovalForAll(aggregator.address, true)
  await aggregator.connect(user).transferNFTGroup(user.address, "Ice Shadow", "dcl", "cv")

  await query()

  await aggregator.connect(user).transferNFTGroup(user.address, "Ice Shadow", "cv", "dcl")

  await query()

  await aggregator.transferERC20(user.address, w3.utils.toWei('135', 'ether'), mana.address)
  await aggregator.transferNFTs(user.address, [0, 1])
  await aggregator.transferNFTs(user.address, [10, 11, 12, 13, 14, 15, 16, 17, 18])

  await query()

}

async function deploy() {

  const Aggregator = await hre.ethers.getContractFactory("Aggregator")
  const aggregator = await Aggregator.deploy('0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952', 0)
  console.log("aggregator deployed to:", aggregator.address)

  const ERC20Test = await hre.ethers.getContractFactory("ERC20Test")
  const erc20 = await ERC20Test.deploy('USDT', 'usdt')
  console.log("erc20 deployed to:", erc20.address)

  const ERC721Test = await hre.ethers.getContractFactory("ERC721Test")
  const erc721 = await ERC721Test.attach("0x9B0A93EA49955a5ef1878c1a1e8f8645d049e597")
  console.log("erc721 address:", erc721.address)

  const ERC1155Test = await hre.ethers.getContractFactory("ERC1155Test")
  const erc1155 = await ERC1155Test.attach("0x9eA07c5Ee61e82993B0544CEcEcaDeDD3C9F0fA1")
  console.log("erc1155 address:", erc1155.address)

  nftNum = 10

  console.log(await aggregator.createNFTs(
    [0,1,10,11,12,13,14,15,16,17,18], 
    ["DigiFun Ice Shadow-helmet","DigiFun Ice Shadow-upper body","DigiFun Ice Shadow-9-left base","DigiFun Ice Shadow-8-right base","DigiFun Ice Shadow-7-leg","DigiFun Ice Shadow-6-lower left wing","DigiFun Ice Shadow-5-upper left wing","DigiFun Ice Shadow-4-lower right wing","DigiFun Ice Shadow-3-upper right wing","DigiFun Ice Shadow-2-chest","DigiFun Ice Shadow-1-head"], 
    [w3.utils.toWei('9', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('3', 'ether')],
    [1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'), 70, 71, 72, 73, 74, 75, 76, 77, 78], 
    [1000, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310978536', 'wei'), 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
    [nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum], 
    [0,0,1,1,1,1,1,1,1,1,1],
    [erc721.address,erc721.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address],
    [erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address]
  ))

  console.log(await aggregator.createNFTGroup("Ice Shadow", "dcl", 0, [0, 1]))
  console.log(await aggregator.createNFTGroup("Ice Shadow", "cv", 1, [10, 11, 12, 13, 14, 15, 16, 17, 18]))

  for (i = 0; i < 9; i++) {
    console.log(await erc1155.mint(aggregator.address, 70 + i, nftNum, w3.utils.asciiToHex("test")))
  }
  console.log(await erc20.mint("0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952", w3.utils.toWei('1000000', 'ether')))

  console.log(await mana.approve(aggregator.address, w3.utils.toWei('1000000', 'ether')))
  console.log(await erc721.setApprovalForAll(aggregator.address, true))
  console.log(await erc1155.setApprovalForAll(aggregator.address, true))
}

async function attach() {

  const Aggregator = await hre.ethers.getContractFactory("Aggregator")
  const aggregator = await Aggregator.attach('0xEed89F6728E1c5E1B685ba6BC87335F8fAe4200b')
  console.log("aggregator address:", aggregator.address)

  const ERC20Test = await hre.ethers.getContractFactory("ERC20Test")
  const erc20 = await ERC20Test.attach('0x575239873D4EEcf855033cA1aeE96D1DC6325009')
  console.log("erc20 address:", erc20.address)

  const ERC721Test = await hre.ethers.getContractFactory("ERC721Test")
  const erc721 = await ERC721Test.attach("0x9B0A93EA49955a5ef1878c1a1e8f8645d049e597")
  console.log("erc721 address:", erc721.address)

  const ERC1155Test = await hre.ethers.getContractFactory("ERC1155Test")
  const erc1155 = await ERC1155Test.attach("0x9eA07c5Ee61e82993B0544CEcEcaDeDD3C9F0fA1")
  console.log("erc1155 address:", erc1155.address)

  nftNum = 10

  // console.log(await aggregator.createNFTs(
  //   [0,1,10,11,12,13,14,15,16,17,18], 
  //   ["DigiFun Ice Shadow-helmet","DigiFun Ice Shadow-upper body","DigiFun Ice Shadow-9-left base","DigiFun Ice Shadow-8-right base","DigiFun Ice Shadow-7-leg","DigiFun Ice Shadow-6-lower left wing","DigiFun Ice Shadow-5-upper left wing","DigiFun Ice Shadow-4-lower right wing","DigiFun Ice Shadow-3-upper right wing","DigiFun Ice Shadow-2-chest","DigiFun Ice Shadow-1-head"], 
  //   [w3.utils.toWei('9', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('3', 'ether')],
  //   [1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'), 70, 71, 72, 73, 74, 75, 76, 77, 78], 
  //   [1000, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310978536', 'wei'), 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
  //   [nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum], 
  //   [0,0,1,1,1,1,1,1,1,1,1],
  //   [erc721.address,erc721.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address],
  //   [erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address]
  // ))

  // console.log(await aggregator.createNFTGroup("Ice Shadow", "dcl", 0, [0, 1]))
  // console.log(await aggregator.createNFTGroup("Ice Shadow", "cv", 1, [10, 11, 12, 13, 14, 15, 16, 17, 18]))

  // console.log(await erc1155.safeBatchTransferFrom('0x63a725fEee4C8D89f7064f36785a980bc2AC4ce5', aggregator.address, [70, 71, 72, 73, 74, 75, 76, 77, 78], [10, 10, 10, 10, 10, 10, 10, 10, 10], w3.utils.asciiToHex("test")))
  // console.log(await erc20.mint("0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952", w3.utils.toWei('1000000', 'ether')))

  // console.log(await erc20.approve(aggregator.address, w3.utils.toWei('1000000', 'ether')))
  // console.log(await erc721.setApprovalForAll(aggregator.address, true))
  // console.log(await erc1155.setApprovalForAll(aggregator.address, true))
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
    ["DigiFun Ice Shadow-helmet","DigiFun Ice Shadow-upper body","DigiFun Ice Shadow-9-left base","DigiFun Ice Shadow-8-right base","DigiFun Ice Shadow-7-leg","DigiFun Ice Shadow-6-lower left wing","DigiFun Ice Shadow-5-upper left wing","DigiFun Ice Shadow-4-lower right wing","DigiFun Ice Shadow-3-upper right wing","DigiFun Ice Shadow-2-chest","DigiFun Ice Shadow-1-head"], 
    [w3.utils.toWei('9', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('3', 'ether')],
    [1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'), 70, 71, 72, 73, 74, 75, 76, 77, 78], 
    [1000, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310978536', 'wei'), 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000],
    [3,5,2,4,4,4,4,4,4,4,2], 
    [0,0,1,1,1,1,1,1,1,1,1],
    [erc721.address,erc721.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address],
    [mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address,mana.address])

    for (i = 0; i < 9; i++) {
      await erc1155.mint(aggregator.address, 70 + i, nftNum, w3.utils.asciiToHex("test"))
    }
    
}

async function transferERC1155() {
  const ERC1155Test = await hre.ethers.getContractFactory("ERC1155Test")
  const erc1155 = await ERC1155Test.attach("0x9eA07c5Ee61e82993B0544CEcEcaDeDD3C9F0fA1")
  console.log("erc1155 address:", erc1155.address)

  nftNum = 10
  await erc1155.safeBatchTransferFrom("0x63a725fEee4C8D89f7064f36785a980bc2AC4ce5", "0xbED2387034955B9B94528FCd1F65af0288ebbB74", [70,71,72,73,74,75,76,77,78], [nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum,nftNum], w3.utils.asciiToHex("test"))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });