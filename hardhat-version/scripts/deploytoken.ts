import { ethers } from 'hardhat'

async function deployERC20() {
    console.log('Deploying ERC20 contract...')
    const ERC20_CONTRACT_NAME = 'MockToken';
    const tokenSymbol = 'Token0';
    const tokenName = 'Token0';
    const myERC20Contract = await ethers.deployContract(ERC20_CONTRACT_NAME, [
        tokenName,
        tokenSymbol,
    ])
    await myERC20Contract.waitForDeployment()
    console.log('Deployed Mock Token:', await myERC20Contract.getAddress())
}

async function main() {
    await deployERC20()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})