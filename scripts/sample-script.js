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

  const [owner, addr1, addr2] = await ethers.getSigners()
  console.log("=========== create acounts ===========")
  console.log("addr1: %s, official account: %s", addr1.address, addr2.address)

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
  const aggregator = await Aggregator.deploy(addr2.address, mana.address, 5)
  await aggregator.deployed()
  console.log("Aggregator deployed to:", aggregator.address)

  console.log("=========== mint 100000 mana to addr1 ===========")
  await mana.mint(addr1.address, 100000)
  // check mint amount
  expect(await mana.balanceOf(addr1.address)).to.equal(100000)
  console.log("mint %d mana to %s", 100000, addr1.address)

  console.log("=========== mint 20 NFT(10 sets) to addr1 ===========")
  // mint 1-10 and 10000000-10000010 to addr1
  for (let i = 1; i <= 10; i++) {
    await nft.mint(aggregator.address, i)
    await nft.mint(aggregator.address, i + 10000000)
  }
  console.log("mint 20 nfts to address:", aggregator.address)

  // check mint amount
  const nftNum = await nft.balanceOf(aggregator.address)
  console.log("contract owns %d nft:", nftNum)
  expect(nftNum).to.equal(20)

  console.log("=========== search all token id ===========")
  for (let i = 0; i < nftNum; i++) {
    const tokenId = await nft.tokenOfOwnerByIndex(aggregator.address, i)
    console.log("Index: %d, tokenId: %d", i, tokenId)
  }

  console.log("=========== create NFT group ===========")
  await aggregator.createNFT("group1", 0, "evil snawman1", "desc1", 100, 1, 10, 10, nft.address)
  await aggregator.createNFT("group1", 1, "evil snawman2", "desc2", 100, 10000001, 10000010, 10, nft.address)
  console.log("create nft group %s", "group1")

  console.log("=========== addr1 buy 1 NFT group ===========")
  console.log("%s buy nft group: %s", addr1.address, "group1")
  await mana.connect(addr1).approve(aggregator.address, 200)
  await aggregator.connect(addr1).buyNFTGroup(addr1.address, "group1")
  let nftNum1 = await nft.balanceOf(aggregator.address)
  let nftNum2 = await nft.balanceOf(addr1.address)
  console.log("contract owns %d nft.", nftNum1)
  console.log("addr1 owns %d nft.", nftNum2)

  let balance1 = await mana.balanceOf(aggregator.address)
  let balance2 = await mana.balanceOf(addr1.address)
  let balance3 = await mana.balanceOf(addr2.address)

  console.log("contract owns %d mana.", balance1)
  console.log("addr1 owns %d mana.", balance2)
  console.log("official wallet owns %d mana.", balance3)

  console.log("=========== addr1 buy 1 NFT ===========")
  console.log("%s buy nft: %s", addr1.address, "group1")
  await mana.connect(addr1).approve(aggregator.address, 200)
  await aggregator.connect(addr1).buyNFT(addr1.address, "group1", 0)
  nftNum1 = await nft.balanceOf(aggregator.address)
  nftNum2 = await nft.balanceOf(addr1.address)
  console.log("contract owns %d nft.", nftNum1)
  console.log("addr1 owns %d nft.", nftNum2)

  balance1 = await mana.balanceOf(aggregator.address)
  balance2 = await mana.balanceOf(addr1.address)
  balance3 = await mana.balanceOf(addr2.address)

  console.log("contract owns %d mana.", balance1)
  console.log("addr1 owns %d mana.", balance2)
  console.log("official wallet owns %d mana.", balance3)


}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
