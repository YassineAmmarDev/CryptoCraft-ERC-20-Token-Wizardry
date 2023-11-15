// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20 ;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Stake} from "./Stake.sol";
// import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


contract Token is IERC20, ReentrancyGuard {

    // AggregatorV3Interface internal priceFeed;

    string private Name;
    string private Sympol;
    uint private Decimal;
    uint private TotalSupply;

    address public owner;
    mapping (address user  => uint balance ) BalanceOf;
    mapping (address tokenOwner  => mapping (address spender  => uint amount )) Allowed;
    mapping (address burner  => uint amount ) public burnedTokens;

    
    mapping (address burner  => uint  number) RewardCounter;


    Stake private stake;
    mapping(address => uint256 dateOfstackingEndsInUnixTimesStamp) public stakingPeriod;

    
    constructor(string memory _name, string memory _sympol, uint _decimal, uint _totalSupply) {
        Name = _name;
        Sympol = _sympol;
        Decimal = _decimal;
        TotalSupply = _totalSupply;
        BalanceOf[msg.sender] = _totalSupply;
        owner = msg.sender;
        // priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function setStakeContract(address _stake) public {
        require(owner == msg.sender, "Only the owner can set the Stake contract");
        stake = Stake(_stake);
    }

    function getR() public view returns (uint) {
        return RewardCounter[msg.sender];
    }
    
    function totalSupply() external view returns (uint256){
        return TotalSupply;
    }

    function balanceOf(address account) external view returns (uint256){
        return BalanceOf[account];
    }
    
    function transfer(address to, uint256 value) public returns (bool){
        require( BalanceOf[msg.sender] >= value, 'sender dont have enugh Tokens !' );
        BalanceOf[msg.sender] -= value;
        BalanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        BurningReward(msg.sender, burnedTokens[msg.sender] / 10);
        return true ;
    }

    function allowance(address _owner, address spender) external view returns (uint256){
        return Allowed[_owner][spender];
    }

    function approve(address spender, uint256 value) external returns (bool){
        require( BalanceOf[msg.sender] >= value, 'sender doesnt have enough Tokens!' );
        Allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        BurningReward(msg.sender, burnedTokens[msg.sender] / 10);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool){
        require(value <= Allowed[from][msg.sender], "Not enough allowance");
        require( BalanceOf[from] >= value, 'sender dont have enugh Tokens !' );
        BalanceOf[from] -= value;
        BalanceOf[to] += value;
        Allowed[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        BurningReward(msg.sender, burnedTokens[msg.sender] / 10);
        return true;
    }

    // Mint & Burning & Staking

    function Burning(uint _amount) public returns (bool) {
        require(_amount <= BalanceOf[msg.sender], 'Not enough suffecient');
        BalanceOf[msg.sender] -= _amount;
        TotalSupply -= _amount;
        burnedTokens[msg.sender] += _amount;
        RewardCounter[msg.sender] = 3 ;
        return true;
    }

    function BurningReward(address _burner, uint reward) private {
        if (RewardCounter[_burner] > 0 && burnedTokens[_burner] > 5) {
            BalanceOf[owner] -= reward;
            BalanceOf[_burner] += reward;
            RewardCounter[_burner] --;
            emit Transfer(owner, _burner, reward);
        }
    }

    function getCurrentTime() public view returns (uint256) {
        return block.timestamp;
    }


    function staking(uint _amount, uint256 _stakingPeriod) public returns (bool) {
        address _staker = msg.sender;
        require(BalanceOf[_staker] >= _amount, "Not enough tokens");
        require(stakingPeriod[_staker] == 0, "You have already staked");
        BalanceOf[_staker] -= _amount;
        stakingPeriod[_staker] = _stakingPeriod;
        stake.stakeTokens(_staker, _amount);
        return true;
    }

    function paidStackback(address _user, uint _amount) external {
        BalanceOf[_user] += _amount;
        
        delete stakingPeriod[msg.sender];
    }

    function callReturnStaking() public returns (bool) {
        require(getCurrentTime() >= stakingPeriod[msg.sender], "Staking period has not ended yet");
        stake.returnStaking(msg.sender);
        return true;
    }


}