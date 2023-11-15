// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20 ;

import {ERC20} from  "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from  "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Dex {

    using SafeERC20 for ERC20;   
    
    address public owner;
    constructor() {
        owner = msg.sender;
    }

    struct Token {
        ERC20 tokenContract;
        uint totalLiquidity;
    }

    mapping (  address => Token ) public tokens;
    mapping(  address => mapping(address token => uint256 amount)) public tokenBalances; // User address -> token address -> token balance
    mapping(address => mapping(address => uint256)) public etherBalances; // User address -> token address -> ether balance



    function addToken(address  _tokenAddress) public {
        require(msg.sender == owner, 'only onwer can add new Tokens');
        ERC20 token = ERC20(_tokenAddress);
        tokens[_tokenAddress] = Token({tokenContract: token, totalLiquidity: 0});
    }

    // Deposit & Withdraw

    // deposit tokens
    function depositToken(address tokenAddress, uint amount)public {
        require(tokenAddress != address(0),'wrong token Address');
        require(tokens[tokenAddress].tokenContract != ERC20(address(0)),'token not supported by DEX !');
        tokens[tokenAddress].tokenContract.safeTransferFrom(msg.sender, address(this), amount);
        tokenBalances[msg.sender][tokenAddress] += amount ;
    }
    // deposit ether
    function deposit()  payable public {
        require(msg.value > 0, 'cant send 0 ether');
        etherBalances[msg.sender][address(0)] += msg.value ;
    }

    // withdraw tokens
    function withdrawToken(address tokenAddress, uint amount)public {
        require(amount > 0, 'you cant withdraw 0 token !');
        require(amount <= tokenBalances[msg.sender][tokenAddress], 'withdraw amount biger than your balnace !');
        require(tokens[tokenAddress].tokenContract != ERC20(address(0)), 'worng token address !');
        tokenBalances[msg.sender][tokenAddress] -= amount;
        tokens[tokenAddress].tokenContract.safeTransfer(msg.sender, amount);
    }
    // withdraw ether
    function withdraw(uint amount) public {
        require(etherBalances[msg.sender][address(0)] >= amount, 'cant withdraw 0 ether');
        require(amount <= etherBalances[msg.sender][address(0)], 'withdraw amount biger than your balnace !');
        etherBalances[msg.sender][address(0)] -= amount;
        payable(msg.sender).transfer(amount);
    }


    // Trading
    struct Order {
        address trader;
        address token;
        uint tokensTotal;
        uint tokensLeft;
        uint etherAmount;
        uint filled;
    }
    
    Order[] public openOrders;
    mapping (address => Order[]) public orderHistories;

    event Orderplaced(uint orderId, address indexed trader, address indexed token, uint tokensTotal, uint etherAmount);

    function placeOrder(address token, uint tokensTotal, uint etherAmount)  public {
        require(tokens[token].tokenContract != ERC20(address(0)), 'token not supported !');
        require(tokenBalances[msg.sender][token]  >= tokensTotal, 'trader does not have sufficient balance !');
        Order memory newOrder = Order({
            trader: msg.sender,
            token: token,
            tokensTotal: tokensTotal,
            tokensLeft: tokensTotal,
            etherAmount: etherAmount,
            filled: 0
        });
        openOrders.push(newOrder);
        tokenBalances[msg.sender][token]  -= tokensTotal;
        emit Orderplaced(openOrders.length -1, msg.sender, token, tokensTotal, etherAmount);
        
    }

    // fillOrder
    event OrderFilled(uint orderId, address indexed trader, uint tokensFilled, uint etherTransferred);
    
    function fillOrder(uint orderId) public {
        Order storage order = openOrders[orderId];
        uint tokensToFill = order.tokensLeft;
        uint etherToFill = (tokensToFill * order.etherAmount) / order.tokensLeft;

        require(etherBalances[msg.sender][address(0)] >= etherToFill, "Insufficient ether balance");

        etherBalances[order.trader][address(0)] += etherToFill;
        etherBalances[msg.sender][address(0)] -= etherToFill;
        tokenBalances[msg.sender][order.token] += tokensToFill;
        order.tokensLeft = 0;
        order.filled = tokensToFill;

        orderHistories[msg.sender].push(order);
        if (order.trader != msg.sender) orderHistories[order.trader].push(order);
        delete openOrders[orderId];

    }

}
