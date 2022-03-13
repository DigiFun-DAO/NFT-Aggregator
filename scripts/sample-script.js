// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { expect } = require("chai");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy


  // product environment
  // const Aggregator = await hre.ethers.getContractFactory("Aggregator")
  // const aggregator = await Aggregator.deploy("0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952", "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942", 5)
  // await aggregator.deployed()
  // console.log("Aggregator deployed to:", aggregator.address)

  // test environment
  const [owner, user, office] = await ethers.getSigners()
  console.log("=========== create acounts ===========")
  console.log("user: %s, official account: %s", user.address, office.address)

  console.log("=========== deploy contracts ===========")
  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.deploy('Evil Snowman', 'ES')
  await nft.deployed()
  console.log("NFT deployed to:", nft.address)

  const MANA = await hre.ethers.getContractFactory("MANA")
  const mana = await MANA.deploy('MANA', 'MN')
  await mana.deployed()
  console.log("MANA deployed to:", mana.address)

  const Aggregator = await hre.ethers.getContractFactory("Aggregator")
  const aggregator = await Aggregator.deploy(office.address, mana.address, 1000)
  await aggregator.deployed()
  console.log("Aggregator deployed to:", aggregator.address)

  console.log("=========== mint 100,0000 mana to user ===========")
  await mana.mint(user.address, 1000000)
  // check mint amount
  // expect(await mana.balanceOf(user.address)).to.equal(1000000)
  console.log("mint %d mana to user", await mana.balanceOf(user.address))

  console.log("=========== mint 20 NFT(10 suits) to contract ===========")
  // mint 1-10 and 10000000-10000010 to user
  for (let i = 1; i <= 9; i++) {
    await nft.mint(aggregator.address, i)
    await nft.mint(aggregator.address, i + 10000000000)
  }
  console.log("mint 18 nfts to address:", aggregator.address)

  // check mint amount
  nftNum = await nft.balanceOf(aggregator.address)
  console.log("contract owns %d nft:", nftNum)
  // expect(nftNum).to.equal(20)

  console.log("=========== search all token id ===========")
  for (let i = 0; i < nftNum; i++) {
    tokenId = await nft.tokenOfOwnerByIndex(aggregator.address, i)
    console.log("Index: %d, tokenId: %d", i, tokenId)
  }

  console.log("=========== create NFT ===========")
  await aggregator.createNFT("evil snowman1", "desc1", 100000, 1, 10, 9, nft.address)
  await aggregator.createNFT("evil snowman2", "desc2", 100000, 10000000000, 10000000010, 9, nft.address)

  nft1Info = await aggregator.getNFT("evil snowman1")
  console.log("evil snowman1 info", nft1Info)
  nft2Info = await aggregator.getNFT("evil snowman2")
  console.log("evil snowman2 info", nft2Info)

  console.log("=========== put NFTs into NFTGroup ===========")
  await aggregator.putNFTsIntoGroup(["evil snowman1", "evil snowman2"], "group1")
  console.log("put nft into nftgroup %s", "group1")

  group1Info = await aggregator.getNFTGroup("group1")
  console.log("group1 contains: ", group1Info)

  // error test
  // console.log("=========== test illegal user create NFT ===========")
  // await aggregator.connect(user).createNFT("evil snowman3", "desc1", 100000, 1, 10, 10, nft.address)

  // console.log("=========== test create existed NFT ===========")
  // await aggregator.createNFT("evil snowman1", "desc1", 100000, 1, 10, 10, nft.address)

  console.log("=========== increase NFT ===========")
  await nft.mint(aggregator.address, 10)
  await nft.mint(aggregator.address, 10000000010)
  console.log("mint 2 nfts to address:", aggregator.address)

  // check mint amount
  nftNum = await nft.balanceOf(aggregator.address)
  console.log("contract owns %d nft:", nftNum)

  console.log("=========== search all token id ===========")
  for (let i = 0; i < nftNum; i++) {
    const tokenId = await nft.tokenOfOwnerByIndex(aggregator.address, i)
    console.log("Index: %d, tokenId: %d", i, tokenId)
  }
  await aggregator.increaseNFT("evil snowman1", 1)
  await aggregator.increaseNFT("evil snowman2", 1)
  nft1Info = await aggregator.getNFT("evil snowman1")
  console.log("evil snowman1 info", nft1Info)
  nft2Info = await aggregator.getNFT("evil snowman2")
  console.log("evil snowman2 info", nft2Info)

  console.log("=========== user buy group1 ===========")
  console.log("user buy nft group: %s", "group1")
  await mana.connect(user).approve(aggregator.address, 200000)
  await aggregator.connect(user).buyNFTGroup(user.address, "group1")
  contractNftNum = await nft.balanceOf(aggregator.address)
  userNftNum = await nft.balanceOf(user.address)
  console.log("contract owns %d nft.", contractNftNum)
  console.log("user owns %d nft.", userNftNum)

  contractBalance = await mana.balanceOf(aggregator.address)
  userBalance = await mana.balanceOf(user.address)
  officeBalance = await mana.balanceOf(office.address)

  console.log("contract owns %d mana.", contractBalance)
  console.log("user owns %d mana.", userBalance)
  console.log("official wallet owns %d mana.", officeBalance)

  console.log("=========== user buy evil snowman1 ===========")
  console.log("%s buy nft: %s", user.address, "group1")
  await mana.connect(user).approve(aggregator.address, 100000)
  await aggregator.connect(user).buyNFT(user.address, "evil snowman1")
  contractNftNum = await nft.balanceOf(aggregator.address)
  userNftNum = await nft.balanceOf(user.address)
  console.log("contract owns %d nft.", contractNftNum)
  console.log("user owns %d nft.", userNftNum)

  contractBalance = await mana.balanceOf(aggregator.address)
  userBalance = await mana.balanceOf(user.address)
  officeBalance = await mana.balanceOf(office.address)

  console.log("contract owns %d mana.", contractBalance)
  console.log("user owns %d mana.", userBalance)
  console.log("office owns %d mana.", officeBalance)

  console.log("=========== user buy 1 NFT group ===========")
  console.log("%s buy nft group: %s", user.address, "group1")
  await mana.connect(user).approve(aggregator.address, 200000)
  await aggregator.connect(user).buyNFTGroup(user.address, "group1")
  contractNftNum = await nft.balanceOf(aggregator.address)
  userNftNum = await nft.balanceOf(user.address)
  console.log("contract owns %d nft.", contractNftNum)
  console.log("user owns %d nft.", userNftNum)

  contractBalance = await mana.balanceOf(aggregator.address)
  userBalance = await mana.balanceOf(user.address)
  officeBalance = await mana.balanceOf(office.address)

  console.log("contract owns %d mana.", contractBalance)
  console.log("user owns %d mana.", userBalance)
  console.log("office owns %d mana.", officeBalance)

  console.log("=========== transfer NFT to office ===========")
  await aggregator.transferNFT(office.address, "evil snowman1", 7)
  contractNftNum = await nft.balanceOf(aggregator.address)
  userNftNum = await nft.balanceOf(user.address)
  officeNftNum = await nft.balanceOf(office.address)
  console.log("contract owns %d nft.", contractNftNum)
  console.log("user owns %d nft.", userNftNum)
  console.log("office owns %d nft.", officeNftNum)

  console.log("=========== transfer 450000 MANA to office ===========")
  await aggregator.transferERC20(office.address, 450000)
  contractBalance = await mana.balanceOf(aggregator.address)
  userBalance = await mana.balanceOf(user.address)
  officeBalance = await mana.balanceOf(office.address)
  console.log("contract owns %d mana.", contractBalance)
  console.log("user owns %d mana.", userBalance)
  console.log("office owns %d mana.", officeBalance)

  console.log("=========== user buy 1 NFT group ===========")
  console.log("%s buy nft group: %s", user.address, "group1")
  await mana.connect(user).approve(aggregator.address, 200000)
  await aggregator.connect(user).buyNFTGroup(user.address, "group1")
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
