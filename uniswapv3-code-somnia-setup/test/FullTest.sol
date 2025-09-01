// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.14;

import "forge-std/Test.sol";
import "./ERC20Mintable.sol";
import "./TestUtils.sol";
import "../src/interfaces/IUniswapV3Pool.sol";
import "../src/UniswapV3Factory.sol";
import "../src/UniswapV3Pool.sol";
import "../src/UniswapV3Manager.sol";
import "../src/UniswapV3Quoter.sol";

contract FullTest is Test, TestUtils {
    ERC20Mintable weth;
    ERC20Mintable usdc;
    ERC20Mintable uni;
    UniswapV3Factory factory;
    UniswapV3Manager manager;
    UniswapV3Quoter quoter;
    UniswapV3Pool wethUSDC;
    address deployer;
    bytes extra;

    function setUp() public {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(privateKey);

        // Deploy tokens
        weth = new ERC20Mintable("Ether", "ETH", 18);
        usdc = new ERC20Mintable("USDC", "USDC", 18);
        uni  = new ERC20Mintable("Uniswap Coin", "UNI", 18);

        // Mint tokens to deployer
        weth.mint(deployer, 100 ether);
        usdc.mint(deployer, 100 ether);
        uni.mint(deployer, 100 ether);

        // Deploy Uniswap infra
        factory = new UniswapV3Factory();
        manager = new UniswapV3Manager(address(factory));
        quoter = new UniswapV3Quoter(address(factory));

        // Deploy pool ~5000 price
        wethUSDC = deployPool(factory, address(weth), address(usdc), 3000, 5000);
        console.log("Pool address:", address(wethUSDC));

        // Approvals
        vm.startPrank(deployer);
        weth.approve(address(manager), 100 ether);
        usdc.approve(address(manager), 100 ether);
        uni.approve(address(manager), 100 ether);
        extra = encodeExtra(address(weth), address(usdc), deployer);
        vm.stopPrank();
    }

    function testFullSwap() public {
        vm.startPrank(deployer);

        // --- Get current pool info ---
        (uint160 sqrtPriceX96, int24 tick,, ,) = wethUSDC.slot0();
        uint24 tickSpacing = wethUSDC.tickSpacing();

        // --- Mint liquidity in a small range ---
        int24 lowerTick = (tick / int24(tickSpacing)) * int24(tickSpacing);
        int24 upperTick = lowerTick + 8 * int24(tickSpacing);

        manager.mint(
            IUniswapV3Manager.MintParams({
                tokenA: address(weth),
                tokenB: address(usdc),
                fee: 3000,
                lowerTick: lowerTick,
                upperTick: upperTick,
                amount0Desired: 20 ether,
                amount1Desired: 20 ether,
                amount0Min: 0,
                amount1Min: 0
            })
        );

        manager.mint(
            IUniswapV3Manager.MintParams({
                tokenA: address(usdc),
                tokenB: address(weth),
                fee: 3000,
                lowerTick: lowerTick,
                upperTick: upperTick,
                amount0Desired: 20 ether,
                amount1Desired: 20 ether,
                amount0Min: 0,
                amount1Min: 0
            })
        );

        // --- Quote swap via Uniswap Quoter ---
        (uint256 amountOut, uint160 sqrtPriceX96After, int24 tickAfter) = quoter.quoteSingle(
            UniswapV3Quoter.QuoteSingleParams({
                tokenIn: address(weth),
                tokenOut: address(usdc),
                fee: 3000,
                amountIn: 1 ether,
                sqrtPriceLimitX96: 0
            })
        );

        // console.log("Quoted amountOut:", amountOut);
        // console.log("Next sqrtPriceX96:", sqrtPriceX96After);
        // console.log("Next tick:", tickAfter);

        // --- Determine correct sqrtPriceLimit for swap ---
   

        // --- Perform swap safely ---
        uint256 swapAmount = 1 ether;
        (int256 amount0Delta, int256 amount1Delta) = wethUSDC.swap(
            deployer,
            false, // exact direction
            swapAmount,
            sqrtP(5004),
            extra
        );

        // console.log("Swap amount0Delta:", amount0Delta);
        // console.log("Swap amount1Delta:", amount1Delta);

        vm.stopPrank();
    }
}
