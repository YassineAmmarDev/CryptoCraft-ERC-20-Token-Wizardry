const { ethers } = require('hardhat');

async function main() {
  let accounts = []
  const contractAddress = '0x65430Afa550929763cf7af4c16C81f95E9C7BAEA';
  accounts = await ethers.getSigners()
  let signer = accounts[0]
  const contract = await ethers.getContractAt('Token', contractAddress, signer);

  const recipientAddress = '0xf84A963996b445926fc2919fb3Bc30758B0FBbb5'; // Replace with the actual recipient address
  const amountToTransfer = ethers.parseUnits('10', 'ether'); // Specify the amount of tokens to transfer

  // Check the signer's balance before the transfer
  const balanceBefore = await contract.balanceOf(signer.address);
  console.log(`contract address: ${contract.address}`);
  console.log(`sender balance: ${signer.address}`);
  console.log('sender balance:', ethers.formatEther(balanceBefore, 'ether'));

  // Send tokens from your wallet to the recipient address
  const tx = await contract.connect(signer).transfer(recipientAddress, amountToTransfer);
  await tx.wait();
  console.log('Transfer successful!');

  // Check the signer's balance after the transfer
  const balanceAfter = await contract.balanceOf(signer.address);
  console.log('Balance after transfer:', ethers.formatUnits(balanceAfter, 'ether'));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
