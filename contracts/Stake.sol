// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20 ;
import {Token} from "./Token.sol";

contract Stake {
    Token private token;
    mapping (address user => uint amount) stakeOf;
    
    function setTokenContract(address _token) public {
        token = Token(_token);
    }

    function StakeOf(address _account) public view returns (uint) {
        return stakeOf[_account];
    }

    function stakeTokens(address _staker, uint _amount) external {
        stakeOf[_staker] += _amount;
    }

    
    function returnStaking(address _staker) external returns (bool) {
        require(stakeOf[_staker] > 0, "No staked tokens to return");
        uint amount = stakeOf[_staker];
        stakeOf[_staker] = 0;
        token.paidStackback(_staker, amount);

        return true;
    }
    
}