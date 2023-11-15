
async function main() {
  // Define constructor arguments
 const name = 'YasCoin';
 const symbol = 'YCN';
 const decimal = 18;

 const totalSupply = ethers.parseUnits('1000000', 'ether');

 const [deployer] = await ethers.getSigners();

 console.log("Deploying contracts with the account:", deployer.address);

 const token = await ethers.deployContract("Token", [name, symbol, decimal, totalSupply]);

 console.log("Token address:", await token.getAddress());
}

main()
 .then(() => process.exit(0))
 .catch((error) => {
   console.error(error);
   process.exit(1);
 });