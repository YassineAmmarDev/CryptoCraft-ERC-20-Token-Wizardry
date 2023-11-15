const { expect }  = require('chai')
const { ethers } = require('hardhat')
const { it } = require('mocha')

const convertToWei = (n) => {
    return ethers.parseUnits(n.toString(), 'ether')
}
const YasCoin = convertToWei
const convertToEther = (n) =>{
    return ethers.formatEther(n.toString(), 'ether')
}
describe('Test Token Contract', ()=>{
    let Token, token, Stake, stake
    let accounts = []
    let owner, user1, user2, user3, user4, burner, staker
    

    beforeEach( async()=>{
        // setup accounts
        accounts = await ethers.getSigners()
        owner = accounts[0]
        user1 = accounts[1]
        user2 = accounts[2]
        user3 = accounts[3]
        user4 = accounts[4]
        burner = accounts[5]
        staker = accounts[6]
        // load Contracts 
        Token = await ethers.getContractFactory('Token')
        Stake = await ethers.getContractFactory('Stake')
        // deploy Contract

        
        // Deploy Token contract without a reference to Stake
        token = await Token.deploy('YasCoin', 'YCN', 18, YasCoin(1000));

       
    })


    describe('Deployment 🖹', async()=>{
        it('check totalSupply', async()=>{
            expect(await token.totalSupply()).to.eq(YasCoin(1000))
        })
    })
    describe('****balanceOf Function******', async()=>{
        it('check balanceOf', async()=>{
            expect(await token.balanceOf(owner.address)).to.eq(YasCoin(1000))
            console.log(`owner balance:    ${await token.balanceOf(owner.address)}`);
            console.log(`user1 balance:    ${await token.balanceOf(user1.address)}`);
            console.log(`user2 balance:    ${await token.balanceOf(user2.address)}`);
        })
    })
    describe('****transfer Function****', async()=>{
        it('check transfer', async()=>{
             console.log(`acount 2 balance before txn:    ${await token.balanceOf(user1.address)}`);

            await token.connect(owner).transfer(user1.address, YasCoin(10))
            expect(await token.balanceOf(user1.address)).to.eq(YasCoin(10))
             console.log(`acount 2 balance after txn:    ${await token.balanceOf(user1.address)}`);
        })
    })

    describe('****token allownce prossec****', async()=>{
        beforeEach(async()=>{
        })

        it('excute succeful transaction', async()=>{
            const allawnce = await token.connect(user1).allowance(user1.address, user2.address)
            expect(allawnce).to.eq(YasCoin(0))
            console.log(`allownce has been regesiterd in the mapping`);

            await token.connect(owner).transfer(user1.address, YasCoin(100))
            console.log("user1 get 100 token from the owner");

            await token.connect(user1).approve(user2.address, YasCoin(50))
            expect(await token.allowance(user1.address, user2.address)).to.eq(YasCoin(50))
            console.log("user1 allowed user2 to use 50 tokens of his balance");
        
            await token.connect(user2).transferFrom(user1.address, user2.address, YasCoin(50))
            expect(await token.allowance(user1.address, user2.address)).to.eq(YasCoin(0))
            expect(await token.balanceOf(user1.address)).to.eq(YasCoin(50))
            expect(await token.balanceOf(user2.address)).to.eq(YasCoin(50))
            console.log("user2 get the 50 token from user1 balance");
        })
    
    })
    
        describe('**********Burning processe***********', async()=>{
            it('excute burning', async()=>{
                console.log(`burner default balance:    ${convertToEther(await token.balanceOf(burner.address))}`);
                await token.connect(owner).transfer(burner.address, YasCoin(120))
                console.log(`burner balance after owner transfre:   ${convertToEther(await token.balanceOf(burner.address))}`);
                await token.connect(burner).Burning(YasCoin(100))
                console.log(`burner balance after burn 100 token:    ${convertToEther(await token.balanceOf(burner.address))}`);
                expect(await token.totalSupply()).to.eq(YasCoin(900))
                expect(await token.burnedTokens(burner.address)).to.eq(YasCoin(100))
                console.log("100 token was burned !");
                
                await token.connect(burner).approve(user1.address, YasCoin(20))
                console.log(`burner balance after transaction 1 :    ${convertToEther(await token.balanceOf(burner.address))}`)
                console.log(`RewardCounter : ${ await token.connect(burner).getR()}`);    
                await token.connect(burner).approve(user2.address, YasCoin(20))
                console.log(`burner balance after transaction 2 :    ${convertToEther(await token.balanceOf(burner.address))}`)
                
                await token.connect(burner).approve(user4.address, YasCoin(20))
                console.log(`burner balance after transaction 3 :    ${convertToEther(await token.balanceOf(burner.address))}`)
                
                await token.connect(burner).approve(user3.address, YasCoin(20))
                console.log(`burner balance after transaction 4 :    ${convertToEther(await token.balanceOf(burner.address))}`)
                console.log(`RewardCounter : ${ await token.connect(burner).getR()}`);    
            
            })
        })
        describe('**********Stacking processe***********', async()=>{
            beforeEach(async()=>{
            // Deploy Stake contract without a reference to Token
            stake = await Stake.deploy();

            // Set the Stake contract address in the Token contract
            await token.setStakeContract(stake.target);

            // Set the Token contract address in the Stake contract
            await stake.setTokenContract(token.target);

            })
            it('excute Stacking', async()=>{
                await token.connect(owner).transfer(staker, YasCoin(200))
                console.log(`balnce of staker : ${convertToEther(await token.balanceOf(staker.address))}`);
                await token.connect(staker).staking(YasCoin(50), 1697352447)
                console.log(`balnce of staker after staking is : ${convertToEther(await token.balanceOf(staker.address))}`);
                console.log(` ${await token.getCurrentTime()} vs  1697352447`);
                console.log(`how much it stakes : ${convertToEther(await stake.StakeOf(staker.address))}`);
                
                await token.connect(staker).callReturnStaking()
                console.log(`balnce of staker after return staking is : ${convertToEther(await token.balanceOf(staker.address))}`);


            })

        })    
})