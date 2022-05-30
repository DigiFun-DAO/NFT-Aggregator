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
  await attachAll()
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
    ["DigiFun Ice Shadow-helmet","DigiFun Ice Shadow-upper body","DigiFun Ice Shadow-9-left base","DigiFun Ice Shadow-8-right base","DigiFun Ice Shadow-7-leg","DigiFun Ice Shadow-6-lower left wing","DigiFun Ice Shadow-5-upper left wing","DigiFun Ice Shadow-4-lower right wing","DigiFun Ice Shadow-3-upper right wing","DigiFun Ice Shadow-chest","DigiFun Ice Shadow-1-head"], 
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
    ["DigiFun Ice Shadow-helmet","DigiFun Ice Shadow-upper body","DigiFun Ice Shadow-9-left base","DigiFun Ice Shadow-8-right base","DigiFun Ice Shadow-7-leg","DigiFun Ice Shadow-6-lower left wing","DigiFun Ice Shadow-5-upper left wing","DigiFun Ice Shadow-4-lower right wing","DigiFun Ice Shadow-3-upper right wing","DigiFun Ice Shadow-chest","DigiFun Ice Shadow-1-head"], 
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

  console.log(await erc1155.safeBatchTransferFrom('0x63a725fEee4C8D89f7064f36785a980bc2AC4ce5', '0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952', 
  [79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53], 
  [99, 100, 100, 100, 100, 100, 100, 866, 100, 865, 99, 99, 99, 99, 99, 99, 99, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100], w3.utils.asciiToHex("test")))
  // console.log(await erc20.mint("0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952", w3.utils.toWei('1000000', 'ether')))

  // console.log(await erc20.approve(aggregator.address, w3.utils.toWei('1000000', 'ether')))
  // console.log(await erc721.setApprovalForAll(aggregator.address, true))
  // console.log(await erc1155.setApprovalForAll(aggregator.address, true))
}

async function deployAll() {

  const Aggregator = await hre.ethers.getContractFactory("Aggregator")
  const aggregator = await Aggregator.deploy('0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952', 0)
  console.log("aggregator deployed to:", aggregator.address)
}

async function attachAll() {

  const Aggregator = await hre.ethers.getContractFactory("Aggregator")
  const aggregator = await Aggregator.attach('0x994ae7d8adA56468A54035429D560ff0bb5d88CC')
  console.log("aggregator address:", aggregator.address)

  const ERC20Test = await hre.ethers.getContractFactory("ERC20Test")
  const erc20 = await ERC20Test.attach('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174')
  console.log("erc20 address:", erc20.address)

  const ERC721Test = await hre.ethers.getContractFactory("ERC721Test")
  const erc721_ice = await ERC721Test.attach("0x9B0A93EA49955a5ef1878c1a1e8f8645d049e597")
  console.log("erc721_ice address:", erc721_ice.address)

  const erc721_evil = await ERC721Test.attach("0x622A009f894bF7c6Ba069a31217BE23F327e95DE")
  console.log("erc721_evil address:", erc721_evil.address)

  const erc721_baby = await ERC721Test.attach("0xfaA99E11cf1CD37660975ae7F3623114b1e1b7A6")
  console.log("erc721_baby address:", erc721_baby.address)

  const erc721_ninja = await ERC721Test.attach("0xc2c1EFd454d4E8C5F91477f63abC53faE74d2ed3")
  console.log("erc721_ninja address:", erc721_ninja.address)

  const erc721_ninja2 = await ERC721Test.attach("0x7031d12460d50Bc871Eb14c40393bBaa56cD9A60")
  console.log("erc721_ninja2 address:", erc721_ninja2.address)

  const erc721_frog = await ERC721Test.attach("0xbb2B71E685a53550907Fb62524E7d5C72dd37747")
  console.log("erc721_frog address:", erc721_frog.address)

  const erc721_jian = await ERC721Test.attach("0xdc764BF33Db66986775244FEf0cD94014D87C508")
  console.log("erc721_jian address:", erc721_jian.address)

  const erc721_emperor = await ERC721Test.attach("0x7C9FE6d2493f13b0705758c6990De59F09D10F42")
  console.log("erc721_emperor address:", erc721_emperor.address)

  const ERC1155Test = await hre.ethers.getContractFactory("ERC1155Test")
  const erc1155 = await ERC1155Test.attach("0x9eA07c5Ee61e82993B0544CEcEcaDeDD3C9F0fA1")
  console.log("erc1155 address:", erc1155.address)

  const erc1155_baby = await ERC1155Test.attach("0x4aecb483A9C8E76875b914Ca22a168737F01dB32")
  console.log("erc1155_baby address:", erc1155_baby.address)

  console.log(await aggregator.createNFTs(

    [
      10000,10001,10010,10011,10012,10013,10014,10015,10016,10017,10018,
      10100,10101,10110,10111,10112,10113,10114,10115,10116,10117,10118,
      10200,10201,10210,10211,10212,10213,10214,10215,10216,
      10300,10301,10310,10311,10312,10313,10314,10315,10316,10317,10318,
      10400,10401,
      10500,10501,
      10600,10601,
      10700,10701,
      10800,
    ], 

    [
      "Evil Snowman-Head","Evil Snowman-Body","Evil Snowman-Head","Evil Snowman-Upper body","Evil Snowman-Lower body","Evil Snowman-Left hand","Evil Snowman-Right hand","Evil Snowman-Left foot","Evil Snowman-Right foot","Evil Snowman-Lower tail","Evil Snowman-Upper tail",

      "Ice Shadow-Head","Ice Shadow-Body","Ice Shadow-Left base","Ice Shadow-Right base","Ice Shadow-Leg","Ice Shadow-Lower left wing","Ice Shadow-Upper left wing","Ice Shadow-Lower right wing","Ice Shadow-Upper right wing","Ice Shadow-Chest","Ice Shadow-Head",

      "Baby Devil-Head","Baby Devil-Body","Baby Devil-Lower head","Baby Devil-Upper head","Baby Devil-Upper body","Baby Devil-Lower body","Baby Devil-Left hand","Baby Devil-Right hand","Baby Devil-Flame",

      "Ninja-Cloak","Ninja-Pants","Ninja-Head","Ninja-Body","Ninja-Belt","Ninja-Right hand","Ninja-Left hand","Ninja-Left leg","Ninja-Right leg","Ninja-Left foot","Ninja-Right foot",

      "Ninja2-Hair band","Ninja2-Cloak",
    
      "Orange Frog-Head","Orange Frog-Body",

      "JIAN-Dress","JIAN-Glass",

      "Landscape Panorama-Gown","Landscape Panorama-Hat",

      "Emperor's Golden Dragon Robe"
    ], 

    [
      w3.utils.toWei('49', 'ether'), w3.utils.toWei('39', 'ether'), w3.utils.toWei('16', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'),

      w3.utils.toWei('19', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('12', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'), w3.utils.toWei('2', 'ether'),

      w3.utils.toWei('49', 'ether'), w3.utils.toWei('39', 'ether'), w3.utils.toWei('28', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('10', 'ether'), w3.utils.toWei('10', 'ether'),

      w3.utils.toWei('49', 'ether'), w3.utils.toWei('39', 'ether'), w3.utils.toWei('16', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'), w3.utils.toWei('9', 'ether'),

      w3.utils.toWei('9', 'ether'), w3.utils.toWei('19', 'ether'),

      w3.utils.toWei('19', 'ether'), w3.utils.toWei('9', 'ether'),

      w3.utils.toWei('99', 'ether'), w3.utils.toWei('19', 'ether'),

      w3.utils.toWei('59', 'ether'), w3.utils.toWei('29', 'ether'),

      w3.utils.toWei('198', 'ether')
    ],

    [
      1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'), 69, 68, 67, 66, 65, 79, 64, 63, 62,
      1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'), 70, 71, 72, 73, 74, 75, 76, 77, 78,
      1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'), 1, 2, 5, 6, 7, 11, 8,
      1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'), 61, 60, 59, 58, 57, 56, 55, 54, 53,
      1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'),
      1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'),
      1, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'),
      w3.utils.toWei('210624583337114373395836055367340864637790190801098222508621955073', 'wei'), w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977537', 'wei'),
      1
    ], 

    [
      100, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977636', 'wei'), 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000,
      1000, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310978536', 'wei'), 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000,
      100, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977636', 'wei'), 20000, 20000, 20000, 20000, 20000, 20000, 20000,
      100, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977636', 'wei'), 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000,
      1000, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310978536', 'wei'),
      1000, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310978536', 'wei'),
      100, w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310977636', 'wei'),
      w3.utils.toWei('210624583337114373395836055367340864637790190801098222508621956072', 'wei'), w3.utils.toWei('105312291668557186697918027683670432318895095400549111254310978536', 'wei'),
      1000
  ],

    [
      30,30,30,30,30,30,30,30,30,30,30,
      25,25,100,100,100,100,100,100,100,100,100,
      30,30,30,30,30,30,30,30,30,
      10,10,30,30,30,30,30,30,30,30,30,
      30,30,
      30,30,
      10,10,
      12,20,
      18,
    ],

    [
      0,0,1,1,1,1,1,1,1,1,1,
      0,0,1,1,1,1,1,1,1,1,1,
      0,0,1,1,1,1,1,1,1,
      0,0,1,1,1,1,1,1,1,1,1,
      0,0,
      0,0,
      0,0,
      0,0,
      0,
    ],

    [
      erc721_evil.address,erc721_evil.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,

      erc721_ice.address,erc721_ice.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,

      erc721_baby.address,erc721_baby.address,erc1155_baby.address,erc1155_baby.address,erc1155_baby.address,erc1155_baby.address,erc1155_baby.address,erc1155_baby.address,erc1155_baby.address,

      erc721_ninja.address,erc721_ninja.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,

      erc721_ninja2.address,erc721_ninja2.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,erc1155.address,

      erc721_frog.address,erc721_frog.address,

      erc721_jian.address,erc721_jian.address,

      erc721_emperor.address,erc721_emperor.address,

      erc721_emperor.address,
    ],

    [
      erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,

      erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,

      erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,

      erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,erc20.address,

      erc20.address,erc20.address,

      erc20.address,erc20.address,

      erc20.address,erc20.address,

      erc20.address,erc20.address,

      erc20.address,
    ]

  ))

  // console.log(1 + await aggregator.createNFTGroup("Evil Snowman", "dcl", 0, [10000,10001]))
  // console.log(2 + await aggregator.createNFTGroup("Evil Snowman", "cv", 1, [10010,10011,10012,10013,10014,10015,10016,10017,10018]))
  // console.log(3 + await aggregator.createNFTGroup("Ice Shadow", "dcl", 0, [10100,10101]))
  // console.log(4 + await aggregator.createNFTGroup("Ice Shadow", "cv", 1, [10110,10111,10112,10113,10114,10115,10116,10117,10118]))
  // console.log(5 + await aggregator.createNFTGroup("Baby Devil", "dcl", 0, [10200,10201]))
  // console.log(6 + await aggregator.createNFTGroup("Baby Devil", "cv", 1, [10210,10211,10212,10213,10214,10215,10216]))
  // console.log(7 + await aggregator.createNFTGroup("Ninja", "dcl", 0, [10300,10301]))
  // console.log(8 + await aggregator.createNFTGroup("Ninja", "cv", 1, [10310,10311,10312,10313,10314,10315,10316,10317,10318]))
  // console.log(9 + await aggregator.createNFTGroup("Ninja2", "dcl", 0, [10400,10401]))
  // console.log(10 + await aggregator.createNFTGroup("Orange Frog", "dcl", 0, [10500,10501]))
  // console.log(11 + await aggregator.createNFTGroup("JIAN", "dcl", 0, [10600,10601]))
  // console.log(12 + await aggregator.createNFTGroup("Landscape Panorama", "dcl", 0, [10700,10701]))
  // console.log(13 + await aggregator.createNFTGroup("Emperor's Golden Dragon Robe", "dcl", 0, [10800]))

  // console.log(await erc1155.safeBatchTransferFrom('0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952', aggregator.address, 
  // [79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53], 
  // [30, 100, 100, 100, 100, 100, 100, 100, 100, 100, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], 
  // w3.utils.asciiToHex("test")))

  // console.log(await erc1155_baby.safeBatchTransferFrom('0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952', aggregator.address, 
  // [1, 2, 5, 6, 7, 11, 8], 
  // [30, 30, 30, 30, 30, 30, 30], 
  // w3.utils.asciiToHex("test")))

  // var lower100 = []
  // var middle100 = []
  // for (i = 1; i <= 100; i++) {
  //   lower100[i] = i
  //   midlleAddr = new BN('105312291668557186697918027683670432318895095400549111254310977536').add(new BN(i)).toString();
  //   middle100[i] = midlleAddr
  // }

  // var lower1000 = []
  // var middle1000 = []
  // var high1000 = []
  // for (i = 1; i <= 1000; i++) {
  //   lower1000[i] = i
  //   midlleAddr = new BN('105312291668557186697918027683670432318895095400549111254310977536').add(new BN(i)).toString();
  //   middle1000[i] = midlleAddr
  //   high1000 = new BN('210624583337114373395836055367340864637790190801098222508621955073').add(new BN(i)).toString();
  //   high1000[i] = high1000
  // }

  // console.log(await erc721_evil.batchTransferFrom("0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952", aggregator.address, lower100))
  // console.log(await erc721_evil.batchTransferFrom("0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952", aggregator.address, high100))

  // console.log(await erc721_ice.batchTransferFrom("0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952", aggregator.address, lower1000))

  // console.log(await)


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
    ["DigiFun Ice Shadow-helmet","DigiFun Ice Shadow-upper body","DigiFun Ice Shadow-9-left base","DigiFun Ice Shadow-8-right base","DigiFun Ice Shadow-7-leg","DigiFun Ice Shadow-6-lower left wing","DigiFun Ice Shadow-5-upper left wing","DigiFun Ice Shadow-4-lower right wing","DigiFun Ice Shadow-3-upper right wing","DigiFun Ice Shadow-chest","DigiFun Ice Shadow-1-head"], 
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

  async function transferAll() {
  
    const ERC721Test = await hre.ethers.getContractFactory("ERC721Test")
    const erc721_jian = await ERC721Test.attach("0xdc764BF33Db66986775244FEf0cD94014D87C508")
    console.log("erc721_jian address:", erc721_jian.address)
  
    const erc721_emperor = await ERC721Test.attach("0x7C9FE6d2493f13b0705758c6990De59F09D10F42")
    console.log("erc721_emperor address:", erc721_emperor.address)

    for (i = 0; i < 200; i++) {
      console.log(await erc721_emperor.tokenOfOwnerByIndex("0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952", i))
    }
  }