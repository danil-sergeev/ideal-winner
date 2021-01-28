pragma solidity >=0.4.0 <0.7.0;

import "./IERC20Extended.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";


contract TokenX is IERC20Extended, ERC20Detailed, ERC20Mintable, ERC20Burnable {

	constructor(string memory name, string memory symbol, uint8 decimals)
		ERC20Detailed(name, symbol, decimals) public {}
}
