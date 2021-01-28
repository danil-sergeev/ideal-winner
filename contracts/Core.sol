pragma solidity >=0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./ItemsLib.sol";
import "./RolesLib.sol";
import "./IERC20Extended.sol";

library Core {

	struct Store {
		ItemsLib.Store items;
		RolesLib.Store roles;
		IERC20Extended tokenX;
	}

	struct Reward {
		string caption;
		string description;
		string image;
		uint value;
		address owner;
		uint8 status;
		uint totalAmount;
		uint resultsAmount;
		uint number;
		ItemsLib.Category category;
	}

	struct NewReward {
		string caption;
		string description;
		string image;
		uint value;
		uint totalAmount;
		uint category;
	}

	struct Task {
		string caption;
		string description;
		uint value;
		address owner;
		uint8 status;
		uint8 itemType;
		bytes data;
		uint totalAmount;
		uint resultsAmount;
		uint number;
		ItemsLib.Category category;
	}

	struct NewTask {
		string caption;
		string description;
		uint8 itemType;
		bytes data;
		uint value;
		uint totalAmount;
		uint category;
	}


	struct RewardResult {
		address account;
		bytes status;
		uint number;
		uint rewardId;
	}

	struct TaskResult {
		address account;
		bytes data;
		uint number;
		uint taskId;
	}

	struct Partner {
		string name;
		string description;
		string logo;
		address account;
		uint number;
	}

	struct NewPartner {
		string name;
		string description;
		string logo;
		address account;
	}

	struct User {
		address account;
		string name;
		string description;
		string logo;
		uint8 accessLevel;
		uint number;
	}

	struct Admin {
		address account;
		string name;
		string description;
		string logo;
		uint8 accessLevel;
		uint number;
	}

	string constant public _REWARD = "Reward";
	string constant public _TASK = "Task";
	string constant public _ADMIN = "Admin";
	string constant public _USER = "User";
	string constant public _PARTNER = "Partner";
	uint constant public _COMPENSATION = 1_000_000_000_000_000;
	bytes constant public BYTES_ZERO = "";

	event IncreaseContractEthBalance(address caller);
	event IncreaseUserEthBalance(address caller, address payable acc);

	event SetToken(address caller, address tokenAddress);
	event AddTokenBalance(address caller, address partnerAddress, uint amount);

	event AddUser(address caller, address acc);
	event AddPartner(address caller, Core.NewPartner partner);
	event AddAdmin(address caller, address acc);
	event RemoveAdmin(address caller, address acc);
	event UpgradeAdmin(address caller, address acc);
	event UnlockTasksForUser(address caller, address payable acc);
	event UnlockRewardsForUser(address caller, address payable acc);

	event AddReward(address caller, Core.NewReward reward);
	event CompleteReward(address caller, uint id);
	event AcceptReward(address caller, uint id);

	event AddTask(address caller, Core.NewTask task);
	event CompleteTask(address caller, uint id);
	event AcceptTask(address caller, uint id);

	modifier only(Store storage core, string memory role, uint8 accessLevel) {
		require(RolesLib.haveRoleAndAccess(core.roles, role, msg.sender, accessLevel), "RolesController: caller does not have a required role and access level");
		_;
	}

	function _constructor (Store storage core) public {
		ItemsLib._addKind(core.items, _REWARD);
		ItemsLib._addKind(core.items,  _TASK);

		RolesLib._addRole(core.roles, _ADMIN);
		RolesLib._addRole(core.roles, _USER);
		RolesLib._addRole(core.roles, _PARTNER);
		RolesLib._addSubject(core.roles, _ADMIN, msg.sender, 2, "Admin", "Main admin", "");
	}

	function REWARD() public pure returns(string memory){ return _REWARD; }
	function TASK() public pure returns(string memory){ return _TASK; }
	function ADMIN() public pure returns(string memory){ return _ADMIN; }
	function USER() public pure returns(string memory){ return _USER; }
	function PARTNER() public pure returns(string memory){ return _PARTNER; }
	function COMPENSATION() public pure returns(uint){ return _COMPENSATION; }


	function setToken (Store storage core, address tokenAddress) external only(core, _ADMIN, 2) {
		require(tokenAddress != address(0), "address should not be 0x0");
		emit SetToken(msg.sender, tokenAddress);
		core.tokenX = IERC20Extended(tokenAddress);
	}

	function addTokenBalance (Store storage core, address partnerAddress, uint amount) external only(core, _ADMIN, 1) {
		emit AddTokenBalance(msg.sender, partnerAddress, amount);
		// require amount > 0 ?
		core.tokenX.mint(partnerAddress, amount);
	}

	function getTokenBalance (Store storage core, address holder) external view returns(uint balance) {
		return core.tokenX.balanceOf(holder);
	}

	function getTokenAddress (Store storage core) external view returns(address tokenAddress) {
		return address(core.tokenX);
	}

	function _addUser(Store storage core, address userAddress, string memory name, string memory description, string memory logo) internal only(core, _ADMIN, 1) {
		emit AddUser(msg.sender, userAddress);
		RolesLib._addSubject(core.roles, _USER, userAddress, 1, name, description, logo);
	}

	function addPartner(Store storage core, NewPartner memory partner) public only(core, _ADMIN, 1) {
		emit AddPartner(msg.sender, partner);
		RolesLib._addSubject(core.roles, _PARTNER, partner.account, 1, partner.name, partner.description, partner.logo);
	}

	function addAdmin(Store storage core, address adminAddress, string memory name, string memory description, string memory logo) public only(core, _ADMIN, 2) {
		emit AddAdmin(msg.sender, adminAddress);
		RolesLib._addSubject(core.roles, _ADMIN, adminAddress, 1, name, description, logo);
	}

	function removeAdmin(Store storage core, address adminAddress) public only(core, _ADMIN, 2) {
		emit RemoveAdmin(msg.sender, adminAddress);
		RolesLib._removeSubject(core.roles, _ADMIN, adminAddress);
	}

	function upgradeAdmin(Store storage core, address adminAddress) public only(core, _ADMIN, 2) {
		emit UpgradeAdmin(msg.sender, adminAddress);
		RolesLib._updateAccessLevel(core.roles, _ADMIN, adminAddress, 2);
	}

	function addUserAndUnlockTasks(Store storage core, address payable userAddress, string calldata name, string calldata description, string calldata logo) external only(core, _ADMIN, 1) {
		_addUser(core, userAddress, name, description, logo);
		emit UnlockTasksForUser(msg.sender, userAddress);
		RolesLib._updateAccessLevel(core.roles, _USER, userAddress, 1);
	}

	function unlockRewardsForUser (Store storage core, address payable userAddress) external only(core, _ADMIN, 1) {
		emit UnlockRewardsForUser(msg.sender, userAddress);
		// require(rolesStore.roles[core, _USER].subjects[userAddress].accessLevel == 1, "Roles: user should get 1 level first");
		RolesLib._updateAccessLevel(core.roles, _USER, userAddress, 2);
	}



	function addReward(Store storage core, NewReward calldata reward) external only(core, _PARTNER, 1) {
		emit AddReward(msg.sender, reward);
		ItemsLib._addItem(core.items, _REWARD,
			reward.caption,
			reward.description,
			reward.image,
			reward.value,
			reward.category,
			msg.sender,
			0,
			BYTES_ZERO,
			reward.totalAmount
		);
	}

	function completeReward(Store storage core, uint id) external only(core, _USER, 2) {
		emit CompleteReward(msg.sender, id);
		require(core.tokenX.allowance(msg.sender, address(this)) >= core.items.kinds[_REWARD].items[id].value, "User should have enough balance");
		core.tokenX.burnFrom(msg.sender, core.items.kinds[_REWARD].items[id].value); // $$$ сжигаем баланс у юзера

		ItemsLib._addResult(core.items, _REWARD, id, msg.sender, BYTES_ZERO);
	}

	function acceptReward(Store storage core, uint id) external only(core, _ADMIN, 1) {
		emit AcceptReward(msg.sender, id);
		ItemsLib._setStatus(core.items, _REWARD, id, 1);
	}

	function addTask(Store storage core, NewTask calldata task) external only(core, _PARTNER, 1) {
		emit AddTask(msg.sender, task);
		// $$$ забираем у Partner деньги на rewards за выполненные таски
		core.tokenX.transferFrom(msg.sender, address(this), task.value * task.totalAmount);
		ItemsLib._addItem(core.items, _TASK,
			task.caption,
			task.description,
			"",
			task.value,
			task.category,
			msg.sender,
			task.itemType,
			task.data,
			task.totalAmount
		);
	}

	function completeTask(Store storage core, uint id, bytes calldata result) external only(core, _USER, 1) {
		emit CompleteTask(msg.sender, id);

		core.tokenX.transfer(msg.sender, core.items.kinds[_TASK].items[id].value); // $$$ User получает reward и может потратить его на rewards
		ItemsLib._addResult(core.items, _TASK, id, msg.sender, result);
	}

	function acceptTask(Store storage core, uint id) external only(core, _ADMIN, 1) {
		emit AcceptTask(msg.sender, id);
		ItemsLib._setStatus(core.items, _TASK, id, 1);
	}


	function isIncorrectTaskResultT0 (bytes memory data, bytes memory result) public pure returns (bool isIncorrect) {
		bytes memory b;
		uint8 qAmount;
		uint8 standardAnsAmount;

		uint8[5] memory ansArr;
		bytes memory customAnsArr;

		uint8 customAnsAmount;
		uint i;

		(qAmount, standardAnsAmount, b) = abi.decode(data, (uint8, uint8, bytes));
		(ansArr, customAnsArr) = abi.decode(result, (uint8[5], bytes));

		for (i = 0; i < uint(qAmount); i++) {
			if (ansArr[i] > standardAnsAmount) isIncorrect = true;
			if (ansArr[i] == standardAnsAmount) customAnsAmount += 1;
			if (i > uint(qAmount - 1) && ansArr[i] > 0) isIncorrect = true;
		}

		uint8 realCustomAnsAmount;
		if (customAnsAmount > 0) {
			for (i = 0; i < customAnsArr.length; i++) {
				if (customAnsArr[i] == bytes1("\n")) realCustomAnsAmount += 1;
			}

			if (realCustomAnsAmount != customAnsAmount) isIncorrect = true;
		}
	}

	function isIncorrectTaskResultT1 (bytes memory result) public pure returns (bool isIncorrect) {
		if (result.length > 1) isIncorrect = true;
		uint8 res = uint8(result[0]);
		if (res >= 5) isIncorrect = true;
		// return isIncorrect ?
	}

	function isIncorrectTaskResultT2 (bytes memory result) public pure returns (bool isIncorrect) {
		uint8 rate;
		string memory ansStr;
		(rate, ansStr) = abi.decode(result, (uint8, string));
		if (rate >= 10) isIncorrect = true;
		// return isIncorrect ?
	}
}
