pragma solidity >=0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./Core.sol";


library Getters {

    function getTask(Core.Store storage core, uint i) public view returns (Core.Task memory task) {
		return Core.Task({
			caption: core.items.kinds[Core.TASK()].items[i].caption,
			description: core.items.kinds[Core.TASK()].items[i].description,
			value: core.items.kinds[Core.TASK()].items[i].value,
			owner: core.items.kinds[Core.TASK()].items[i].owner,
			status: core.items.kinds[Core.TASK()].items[i].status,
			category: core.items.kinds[Core.TASK()].items[i].category,
			itemType: core.items.kinds[Core.TASK()].items[i].itemType,
			data: core.items.kinds[Core.TASK()].items[i].data,
			totalAmount: core.items.kinds[Core.TASK()].items[i].totalAmount,
			resultsAmount: core.items.kinds[Core.TASK()].items[i].resultsAmount,
			number: i
		});
    }

    function getReward(Core.Store storage core, uint i) public view returns (Core.Reward memory reward) {
		return Core.Reward({
			caption: core.items.kinds[Core.REWARD()].items[i].caption,
			description: core.items.kinds[Core.REWARD()].items[i].description,
			image: core.items.kinds[Core.REWARD()].items[i].image,
			value: core.items.kinds[Core.REWARD()].items[i].value,
			category: core.items.kinds[Core.REWARD()].items[i].category,
			owner: core.items.kinds[Core.REWARD()].items[i].owner,
			status: core.items.kinds[Core.REWARD()].items[i].status,
			totalAmount: core.items.kinds[Core.REWARD()].items[i].totalAmount,
			resultsAmount: core.items.kinds[Core.REWARD()].items[i].resultsAmount,
			number: i
		});
    }

	// typo
	function getPartnerByAdress(Core.Store storage core, address account) public view returns(Core.Partner memory partner) {
		uint num = core.roles.roles[Core.PARTNER()].accToNum[account];
		require(num != 0, "Can not get partner by address: account not found");

		string memory name = core.roles.roles[Core.PARTNER()].subjects[account].name;
		string memory description = core.roles.roles[Core.PARTNER()].subjects[account].description;
		string memory logo = core.roles.roles[Core.PARTNER()].subjects[account].logo;

		return Core.Partner({
			account: account,
			name: name,
			description: description,
			logo: logo,
			number: num
		});
	}

	function getPartnerByNumber(Core.Store storage core, uint num) public view returns (Core.Partner memory partner) {
		address account = core.roles.roles[Core.PARTNER()].numToAcc[num];
		require(account != address(0), "Can not get partner by number: account not found");
		string memory name = core.roles.roles[Core.PARTNER()].subjects[account].name;
		string memory description = core.roles.roles[Core.PARTNER()].subjects[account].description;
		string memory logo = core.roles.roles[Core.PARTNER()].subjects[account].logo;

		return Core.Partner({
			account: account,
			name: name,
			description: description,
			logo: logo,
			number: num
		});
	}

	function getTasksCount(Core.Store storage core) public view returns(uint) {
		return core.items.kinds[Core.TASK()].count;
	}

	function getRewardsCount(Core.Store storage core) public view returns(uint) {
		return core.items.kinds[Core.REWARD()].count;
	}

	function getPartnersCount(Core.Store storage core) public view returns(uint) {
		return core.roles.roles[Core.PARTNER()].count;
	}

	function getUsersCount(Core.Store storage core) public view returns(uint) {
		return core.roles.roles[Core.USER()].count;
	}

	function getAdminsCount(Core.Store storage core) public view returns(uint) {
		return core.roles.roles[Core.ADMIN()].count;
	}

	function getUserByAddress(Core.Store storage core, address acc) external view returns(Core.User memory) {
		require(acc != address(0), "address should not be 0x0");
		return Core.User({
			account: acc,
			accessLevel: core.roles.roles[Core.USER()].subjects[acc].accessLevel,
			number: core.roles.roles[Core.USER()].accToNum[acc],
			logo: core.roles.roles[Core.USER()].subjects[acc].logo,
			name: core.roles.roles[Core.USER()].subjects[acc].name,
			description: core.roles.roles[Core.USER()].subjects[acc].description
		});
	}

	function getUserByNumber(Core.Store storage core, uint num) external view returns(Core.User memory) {
		address acc = core.roles.roles[Core.USER()].numToAcc[num];

		return Core.User({
			account: acc,
			accessLevel: core.roles.roles[Core.USER()].subjects[acc].accessLevel,
			logo: core.roles.roles[Core.USER()].subjects[acc].logo,
			name: core.roles.roles[Core.USER()].subjects[acc].name,
			description: core.roles.roles[Core.USER()].subjects[acc].description,
			number: num
		});
	}

	function getAdminByAddress(Core.Store storage core, address acc) external view returns(Core.Admin memory) {
		require(acc != address(0), "address should not be 0x0");
		return Core.Admin({
			account: acc,
			accessLevel: core.roles.roles[Core.ADMIN()].subjects[acc].accessLevel,
			name: core.roles.roles[Core.ADMIN()].subjects[acc].name,
			description: core.roles.roles[Core.ADMIN()].subjects[acc].description,
			logo: core.roles.roles[Core.ADMIN()].subjects[acc].logo,
			number: core.roles.roles[Core.ADMIN()].accToNum[acc]
		});
	}

	function getAdminByNumber(Core.Store storage core, uint num) external view returns(Core.Admin memory) {
		address acc = core.roles.roles[Core.ADMIN()].numToAcc[num];

		return Core.Admin({
			account: acc,
			accessLevel: core.roles.roles[Core.ADMIN()].subjects[acc].accessLevel,
			name: core.roles.roles[Core.ADMIN()].subjects[acc].name,
			description: core.roles.roles[Core.ADMIN()].subjects[acc].description,
			logo: core.roles.roles[Core.ADMIN()].subjects[acc].logo,
			number: num
		});
	}

    function getRewardResultByNumber(Core.Store storage core, uint id, uint num) public view returns(Core.RewardResult memory) {
        address acc = core.items.kinds[Core.REWARD()].items[id].numToAcc[num];

        return Core.RewardResult({
        	status: core.items.kinds[Core.REWARD()].items[id].results[acc],
        	number: num,
        	account: acc,
        	rewardId: id
        });
    }

    function getRewardResultByAddress(Core.Store storage core, uint id, address acc) public view returns(Core.RewardResult memory) {
		require(acc != address(0), "address should not be 0x0");
        return Core.RewardResult({
        	status: core.items.kinds[Core.REWARD()].items[id].results[acc],
        	number: core.items.kinds[Core.REWARD()].items[id].accToNum[acc],
        	account: acc,
        	rewardId: id
        });
    }


    function getTaskResultByNumber(Core.Store storage core, uint id, uint num) public view returns(Core.TaskResult memory) {
        address acc = core.items.kinds[Core.TASK()].items[id].numToAcc[num];

        return Core.TaskResult({
        	data: core.items.kinds[Core.TASK()].items[id].results[acc],
        	number: num,
        	account: acc,
        	taskId: id
        });
    }

    function getTaskResultByAddress(Core.Store storage core, uint id, address acc) public view returns(Core.TaskResult memory) {
		require(acc != address(0), "address should not be 0x0");
        return Core.TaskResult({
        	data: core.items.kinds[Core.TASK()].items[id].results[acc],
        	number: core.items.kinds[Core.TASK()].items[id].accToNum[acc],
        	account: acc,
        	taskId: id
        });
    }
}
