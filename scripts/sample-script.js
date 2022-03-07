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
  console.log("addr1: %s, addr2: %s", addr1.address, addr2.address)

  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.deploy('Evil Snowman', 'ES')
  await nft.deployed()
  console.log("NFT deployed to:", nft.address)
  console.log("Total supply:", await nft.totalSupply())

  // await nft.mint(addr1.address, )

  const MANA = await hre.ethers.getContractFactory("MANA")
  const mana = await MANA.deploy('MANA', 'MN')
  await mana.deployed()
  console.log("MANA deployed to:", mana.address)

  await mana.mint(addr1.address, 100000)
  await mana.mint(addr2.address, 100000)
  // check mint amount
  expect(await mana.balanceOf(addr1.address)).to.equal(100000)
  expect(await mana.balanceOf(addr2.address)).to.equal(100000)

  const Aggregator = await hre.ethers.getContractFactory("Aggregator")
  const aggregator = await Aggregator.deploy('0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952', 
  '0x17A6ba0B9Cc209ec061BA117769Ec7e9a30A0952', mana.address, 5)
  await aggregator.deployed()
  console.log("Aggregator deployed to:", aggregator.address)

  // mint 1-10 and 10000000-10000010 to addr1
  for (let i = 1; i <= 10; i++) {
    await nft.mint(addr1.address, i)
    await nft.mint(addr1.address, i + 10000000)
  }
  console.log("Mint 20 nfts to address:", addr1.address)

  // check mint amount
  const nftNum = await nft.balanceOf(addr1.address)
  expect(nftNum).to.equal(20)

  // check token id
  for (let i = 0; i < nftNum; i++) {
    const tokenId = await nft.tokenOfOwnerByIndex(addr1.address, i)
    console.log("Index: %d, tokenId: %d", i, tokenId)
  }

  aggregator.createNFT("group1", 0, "evil snawman1", "desc1", 100, 1, 10, 10, addr1.address)
  aggregator.createNFT("group1", 1, "evil snawman2", "desc2", 100, 10000001, 10000010, 10, addr1.address)

  aggregator.connect(addr2).buyNFTGroup(addr2.address, "group1")
  const nftNum1 = await nft.balanceOf(addr1.address)
  const nftNum2 = await nft.balanceOf(addr2.address)
  console.log("addr1 own %d nft.", nftNum1)
  console.log("addr2 own %d nft.", nftNum2)


}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
