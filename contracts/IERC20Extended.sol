pragma solidity >=0.4.0 <0.7.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface of the ERC20 standard as defined in the EIP. Does not include
 * the optional functions; to access them see {ERC20Detailed}.
 */
interface IERC20Extended {
	// Mintable
    function mint(address account, uint256 amount) external returns (bool);

    // Burnable
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;

    // ERC20Extended
	function name() external view returns (string memory);
	function symbol() external view returns (string memory);
	function decimals() external view returns (uint8);

	// ERC20
	function totalSupply() external view returns (uint256);
	function balanceOf(address account) external view returns (uint256);
	function transfer(address recipient, uint256 amount) external returns (bool);
	function allowance(address owner, address spender) external view returns (uint256);
	function approve(address spender, uint256 amount) external returns (bool);
	function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}