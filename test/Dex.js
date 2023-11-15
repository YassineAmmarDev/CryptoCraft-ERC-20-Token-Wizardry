const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dex", function () {
    let accounts = []
  let owner, trader1, trader2;
  let dex;
  let token;
  const YasCoin = (n)=>{
    return (ethers.parseUnits(n.toString(), 'ether'))
  }

  const RyasCoin = (n) =>{
    return ethers.formatEther(n?.toString(), 'ether')
}
  beforeEach(async function () {
    accounts = await ethers.getSigners();
    owner = accounts[0]
    trader1 = accounts[1]
    trader2 = accounts[2]

    // Deploy the Token contract
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("MyToken", "MTK", 18, YasCoin(1000000));    

    // Deploy the Dex contract
    const Dex = await ethers.getContractFactory("Dex");
    dex = await Dex.deploy();

    // add token
    await dex.addToken(token.target);
  });

  it("deposit token", async function () {

    await token.approve(dex.target, YasCoin(100));
    await dex.depositToken(token.target, YasCoin(100))
    expect(await dex.tokenBalances(owner, token.target)).to.eq(YasCoin(100))    
    console.log(`owner balance in dex :  ${RyasCoin(await dex.tokenBalances(owner, token.target))}`);
  })

  it("deposit Ether", async function () {
    await dex.deposit({value: YasCoin(32)})
    expect(await dex.etherBalances(owner, '0x0000000000000000000000000000000000000000')).to.eq(YasCoin(32))    
    console.log(`owner Ether balance in dex :  ${RyasCoin(await dex.etherBalances(owner, '0x0000000000000000000000000000000000000000'))}`);
  })

  it("withdraw tokens", async function () {
    // user deposit 100 Yascoin 
    await token.approve(dex.target, YasCoin(100));
    await dex.depositToken(token.target, YasCoin(100))
    
    console.log(`user balance of YasCoin before withdraw : ${RyasCoin(await dex.tokenBalances(owner, token.target))}`);
    await dex.withdrawToken(token.target, YasCoin(50))
    expect(await dex.tokenBalances(owner, token.target)).to.eq(YasCoin(50))    
  })


  it("withdraw Ether", async function () {
    // user deposit 100 Ether 
    await dex.deposit({value: YasCoin(100)})
    console.log(`owner Ether balance in dex before withdraw:  ${RyasCoin(await dex.etherBalances(owner, '0x0000000000000000000000000000000000000000'))}`);

    await dex.withdraw(YasCoin(70))
    expect(await dex.etherBalances(owner, '0x0000000000000000000000000000000000000000')).to.eq(YasCoin(30))    
  
    console.log(`owner Ether balance in dex after withdraw:  ${RyasCoin(await dex.etherBalances(owner, '0x0000000000000000000000000000000000000000'))}`);

  })

      // Trading

  it("start new trading order", async ()=> {
    //send yascoin to the user aka owner
    await token.approve(dex.target, YasCoin(100));
    await dex.depositToken(token.target, YasCoin(100))

    await dex.placeOrder(token.target, YasCoin(50), YasCoin(1))
    expect(await dex.tokenBalances(owner, token.target)).to.eq(YasCoin(50))
    let order = await dex.openOrders(0)
    console.log(order.trader)
    console.log(RyasCoin(order.token));
  })

  it("complite order", async ()=> {

    // trading scenario : trader1 has 50 token for sale with 0.5 ether for each, trader 2 will buy  token
    
    console.log("trader1 $$$$$$$$$$$$$$$$$$$$$$$");
    // owner deposit funds to the trader 
    await token.connect(owner).transfer(trader1.address, YasCoin(150))
    let trader1Balance = RyasCoin(await token.balanceOf(trader1))
    console.log(`trader1 balnce:    ${trader1Balance}`);
    // trader 1 deposit
    await token.connect(trader1).approve(dex.target, YasCoin(50));
    await dex.connect(trader1).depositToken(token.target, YasCoin(50))
    let trader1DepositAmount = RyasCoin(await dex.connect(trader1).tokenBalances(trader1, token.target))
    console.log(`trader1 Deposit Amount:    ${trader1DepositAmount}`);

    console.log("trader1 place sell order");
    await dex.connect(trader1).placeOrder(token.target, YasCoin(50), YasCoin(0.5))
    let trader1Order = await dex.openOrders(0)
    expect(trader1Order.tokensTotal).to.eq(YasCoin(50))
    let trader1EtherBalance = RyasCoin(await dex.etherBalances(trader1, '0x0000000000000000000000000000000000000000'))
    console.log(`trader1 Ether Balance:     ${trader1EtherBalance}`);

    console.log("trader2 $$$$$$$$$$$$$$$$$$$$$$$");

    let trader2Balance = RyasCoin(await ethers.provider.getBalance(trader2.address))
    console.log(`trader2 ether balnce:    ${trader2Balance}`);
    // trader 2 deposit
    await dex.connect(trader2).deposit({value:YasCoin(100)})
    let trader2DepositEther = RyasCoin(await dex.connect(trader2).etherBalances(trader2, '0x0000000000000000000000000000000000000000'))
    console.log(`trader2 Deposit Ether:    ${trader2DepositEther}`);

    console.log(`trader2 YasCoin Blance before buy:  ${await dex.tokenBalances(trader2, token.target)}`);
    // trader 2 buy the tokens


    await dex.connect(trader2).fillOrder(0)
    // expect(YasCoin(trader2Balance)).to.eq(YasCoin(9975))
    
    expect(await dex.tokenBalances(trader2, token.target)).to.eq(YasCoin(50))
    console.log(`trader2 YasCoin Blance after buy:  ${await dex.tokenBalances(trader2, token.target)}`);





  })
  
});
