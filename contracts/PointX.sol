pragma solidity >=0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./Core.sol";
import "./Getters.sol";


contract PointX {
	using Core for Core.Store;
	Core.Store core;

	constructor () public {
		core._constructor();
	}

	// --------------------------- BALANCES ETH/TOKEN ---------------------------
	function increaseContractEthBalance() external payable {}

	function increaseUserEthBalance (address payable acc) public payable {
		acc.transfer(Core.COMPENSATION());
	}

	function setToken(address tokenAddress) external {
		core.setToken(tokenAddress);
	}

	function addTokenBalance(address partnerAddress, uint amount) external {
		core.addTokenBalance(partnerAddress, amount);
	}

	function getTokenBalance(address holder) external view returns(uint balance) {
		return core.getTokenBalance(holder);
	}

	function getTokenAddress() external view returns(address tokenAddress) {
		return core.getTokenAddress();
	}

	// --------------------------- ROLES ---------------------------
	function addPartner(address account, string calldata name, string calldata description, string calldata logo) external {
		core.addPartner(Core.NewPartner({
			account: account,
			name: name,
			description: description,
			logo: logo
		}));
	}

	function addAdmin(address acc, string calldata name, string calldata description, string calldata logo) external {
		core.addAdmin(acc, name, description, logo);
	}

	function removeAdmin(address acc) external {
		 core.removeAdmin(acc);
		}

	function upgradeAdmin(address acc) external {
		core.upgradeAdmin(acc);
	}

	function addUserAndUnlockTasks(address payable acc, string calldata name, string calldata description, string calldata logo) external {
		increaseUserEthBalance(acc);
		core.addUserAndUnlockTasks(acc, name, description, logo);
	}

	function unlockRewardsForUser(address payable acc) external {
		core.unlockRewardsForUser(acc);
	}

	function getPartnersCount() external view returns(uint) {
		return Getters.getPartnersCount(core);
	}

	function getUsersCount() external view returns(uint) {
		return Getters.getUsersCount(core);
	}

	function getAdminsCount() external view returns(uint) {
		return Getters.getAdminsCount(core);
	}

	function getUserByAddress(address acc) external view returns(Core.User memory) {
		return Getters.getUserByAddress(core, acc);
	}

	function getUserByNumber(uint num) external view returns(Core.User memory) {
		return Getters.getUserByNumber(core, num);
	}

	function getAdminByAddress(address acc) external view returns(Core.Admin memory) {
		return Getters.getAdminByAddress(core, acc);
	}

	function getAdminByNumber(uint num) external view returns(Core.Admin memory) {
		return Getters.getAdminByNumber(core, num);
	}

	function getPartnerByAddress(address acc) external view returns(Core.Partner memory) {
		return Getters.getPartnerByAdress(core, acc);
	}

	function getPartnerByNumber(uint num) external view returns(Core.Partner memory) {
		return Getters.getPartnerByNumber(core, num);
	}


	// --------------------------- REWARD ---------------------------
	function addReward(string calldata caption, string calldata description, string calldata image, uint value, uint totalAmount, uint category) external {
		core.addReward(Core.NewReward(caption, description, image, value, totalAmount, category));
	}

	function completeReward(uint id) external {
		core.completeReward(id);
	}

	function acceptReward(uint id) external {
		core.acceptReward(id);
	}

	function getReward(uint id) external view returns (Core.Reward memory reward) {
		return Getters.getReward(core, id);
	}

    function getRewardResultByNumber(uint id, uint num) external view returns(Core.RewardResult memory) {
    	return Getters.getRewardResultByNumber(core, id, num);
    }

    function getRewardResultByAddress(uint id, address acc) external view returns(Core.RewardResult memory) {
    	return Getters.getRewardResultByAddress(core, id, acc);
    }

    function getRewardsCount() public view returns(uint) {
    	return Getters.getRewardsCount(core);
    }


	// --------------------------- TASK ---------------------------
	function addTask(string calldata caption, string calldata description, uint8 itemType, bytes calldata data, uint value, uint totalAmount, uint category) external {
		core.addTask(Core.NewTask(caption, description, itemType, data, value, totalAmount, category));
	}

	function completeTask(uint id, bytes calldata result) external {
		core.completeTask(id, result);
	}

	function acceptTask(uint id) external {
		core.acceptTask(id);
	}

	function getTask(uint id) external view returns (Core.Task memory reward) {
		return Getters.getTask(core, id);
	}

    function getTaskResultByNumber(uint id, uint num) external view returns(Core.TaskResult memory) {
    	return Getters.getTaskResultByNumber(core, id, num);
    }

    function getTaskResultByAddress(uint id, address acc) external view returns(Core.TaskResult memory) {
    	return Getters.getTaskResultByAddress(core, id, acc);
    }

	function getTasksCount() public view returns(uint) {
		return Getters.getTasksCount(core);
	}

}
