const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

contract = null;
test721 = null;
gatedContract = null;

describe("ERC247", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
  async function deployERC247() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Example_ERC247 = await ethers.getContractFactory("Example_ERC247");
    contract = await Example_ERC247.deploy();
  }

  async function deployERC721() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const ERC721 = await ethers.getContractFactory("Test721");
    test721 = await ERC721.deploy("Test721","TEST");
  }

  describe("Deployment", function () {
    it("Should deploy ERC247 STRING", async function () {
      await loadFixture(deployERC247);
      const name = await contract.name();
      const baseURI = await contract.baseURI();
      expect(name).to.equal("Example_ERC247");
      expect(baseURI).to.equal("https://www.erc-247.com/");
    });
    it("Should deploy ERC721 TEST", async function () {
      await loadFixture(deployERC721);
    });
  });

  describe("Mint721", function () {
    it("Should let mint 721 NFTs", async function () {
        const [owner, account2] = await ethers.getSigners();

        await test721.mintTo(owner.address);
        await test721.mintTo(account2.address);

        const ownerOf1 = await test721.ownerOf('1');
        const ownerOf2 = await test721.ownerOf('2');
        expect(ownerOf1).to.equal(owner);
        expect(ownerOf2).to.equal(account2);
    });
  });

  describe("Posting", function () {
    it("Should let me createPost w/ account 1", async function () {
        const nftContract = await test721.getAddress();
        const tokenId = '1';
        const channel = ethers.encodeBytes32String("default");
        const postData = '{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}{"m":"love tests"}';

        const txData = await contract.createPost(nftContract,tokenId,channel,postData);
        const receipt = await txData.wait();
        const log = receipt.logs[0];
        expect(log.fragment.name).to.equal("Post");
        expect(log.args[3]).to.equal(postData);
    });
    it("Should let me createPost w/ account 2", async function () {
        const accounts = await ethers.getSigners();
        const account2 = accounts[1];
        const contract2 = contract.connect(account2);

        const nftContract = await test721.getAddress();
        const tokenId = '2';
        const channel = ethers.encodeBytes32String("secondly");
        const postData = '{"m":"love tests"}';

        const txData = await contract2.createPost(nftContract,tokenId,channel,postData);
        const receipt = await txData.wait();
        const log = receipt.logs[0];
        // console.log('receipt: ',log);
        expect(log.fragment.name).to.equal("Post");
        expect(log.args[3]).to.equal(postData);
    });
    it("Should error if posting from NFT I dont own", async function () {
        const accounts = await ethers.getSigners();
        const badAccount = accounts[5];
        const badContract = contract.connect(badAccount);

        const nftContract = await test721.getAddress();
        const tokenId = '1';
        const channel = ethers.encodeBytes32String("default");
        const postData = '{"m":"love tests"}';

        var error = false;
        try{
            const txData = await badContract.createPost(nftContract,tokenId,channel,postData);
        }
        catch(err){
            error = true;
        }
        expect(error).to.equal(true);
    });
    it("Should error if posting w/ invalid NFT data", async function () {
        const nftContract = "0x00";
        const tokenId = '1';
        const channel = ethers.encodeBytes32String("default");
        const postData = '{"m":"love tests"}';

        var error = false;
        try{
            const txData = await contract.createPost(nftContract,tokenId,channel,postData);
        }
        catch(err){
            error = true;
        }
        expect(error).to.equal(true);
    });
    it("Should error if posting w/ miss postData", async function () {
        const nftContract = await test721.getAddress();
        const tokenId = '1';
        const channel = ethers.encodeBytes32String("default");
        const postData = null;

        var error = false;
        try{
            const txData = await contract.createPost(nftContract,tokenId,channel,postData);
        }
        catch(err){
            error = true;
        }
        expect(error).to.equal(true);
    });
  });

  describe("Reading", function () {
    it("Should let me read posts", async function () {

        const events = await contract.queryFilter('Post');
        const post = events[0].args;
        const [nftContract, tokenId, channel, content, profileId, postId] = post;

        const address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
        let encodePacked =  ethers.concat([
            address,
            '0x0000000000000000000000000000000000000000000000000000000000000001'
        ]);

        const testProfileId = ethers.keccak256(encodePacked);
        // console.log('testProfileId: ',testProfileId);
        const baseURI = await contract.baseURI();
        // console.log('baseURI: ',baseURI);
        const profileIdCheck = await contract.profileId(address,1);
        // console.log('profileIdCheck: ',profileIdCheck);
        const uri = await contract.uri();
        // console.log('uri: ',uri);

        expect(testProfileId).to.equal(profileId)
        expect(profileIdCheck).to.equal(profileId);
        expect(baseURI).to.equal("https://www.erc-247.com/");
        expect(uri).to.equal("https://www.erc-247.com/{profileId}.json");
        expect(postId).to.equal("0xa16caf0aa568908428dc5b0a22b2c098a8289d8b5f2baa987c803fa7fb94085a");
        console.log('postId: ',postId);
    });
  });
});
