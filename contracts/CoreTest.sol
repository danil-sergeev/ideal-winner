pragma solidity >=0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./Core.sol";
import "./RolesLib.sol";
import "./ItemsLib.sol";
import "./IERC20Extended.sol";

contract CoreTest {
    using Core for Core.Store;
    Core.Store _core;

    constructor () public {
        _core._constructor();
    }

    function setToken(address tokenAddress) external {
        Core.setToken(_core, tokenAddress);
    }

    function addTokenBalance(address partnerAddress, uint amount) external {
        Core.addTokenBalance(_core, partnerAddress, amount);
    }

    function getTokenBalance(address holder) external view returns (uint) {
        return Core.getTokenBalance(_core, holder);
    }

    function getTokenAddress() external view returns(address) {
        return address(_core.tokenX);
    }

    function addUser(address userAddress, string calldata name, string calldata description, string calldata logo) external {
        return Core._addUser(_core, userAddress, name, description, logo);
    }

    function addPartner(Core.NewPartner calldata partner) external {
        return Core.addPartner(_core, partner);
    }

    function addAdmin(address adminAddress, string calldata name, string calldata description, string calldata logo) external {
        return Core.addAdmin(_core, adminAddress, name, description, logo);
    }

    function removeAdmin(address adminAddress) external {
        return Core.removeAdmin(_core, adminAddress);
    }

    function upgradeAdmin(address adminAddress) external {
        return Core.upgradeAdmin(_core, adminAddress);
    }

    function addUserAndUnlockTasks(address payable userAddress, string calldata name, string calldata description, string calldata logo) external {
        return Core.addUserAndUnlockTasks(_core, userAddress, name, description, logo);
    }

    function unlockRewardsForUser(address payable userAddress) external {
        return Core.unlockRewardsForUser(_core, userAddress);
    }

    function addReward(Core.NewReward calldata reward) external {
        return Core.addReward(_core, reward);
    }

    function completeReward(uint id) external {
        return Core.completeReward(_core, id);
    }

    function acceptReward(uint id) external {
        return Core.acceptReward(_core, id);
    }

    function addTask(Core.NewTask calldata task) external {
        return Core.addTask(_core, task);
    }

    function completeTask(uint id, bytes calldata result) external {
        return Core.completeTask(_core, id, result);
    }

    function acceptTask(uint id) external {
        return Core.acceptTask(_core, id);
    }

    function getTokenSupply() external view returns(uint256) {
        return _core.tokenX.totalSupply();
    }

    function getKindItem(string calldata k, uint i) external view returns(string memory caption, string memory description, string memory image, uint value, address owner, uint8 itemType, uint8 status, bytes memory data, uint totalAmount, uint resultsAmount, ItemsLib.Category category) {
        ItemsLib.Item memory task = _core.items.kinds[k].items[i];
        return ( task.caption, task.description, task.image, task.value, task.owner, task.itemType, task.status, task.data, task.totalAmount, task.resultsAmount, task.category );
    }

    function getItemResults(string calldata k, uint i, address acc) external view returns (bytes memory) {
        return _core.items.kinds[k].items[i].results[acc];
    }

    function getRoleCount(string calldata role) external view returns (uint) {
        return _core.roles.roles[role].count;
    }

    function getRoleSubjects(string calldata role, address acc) external view returns (uint8 accessLevel, string memory name, string memory description, string memory logo) {
        RolesLib.Subject memory subject = _core.roles.roles[role].subjects[acc];
        return (subject.accessLevel, subject.name, subject.description, subject.logo);
    }

    function getRoleNumToAcc(string calldata role, uint n) external view returns (address) {
        return _core.roles.roles[role].numToAcc[n];
    }

    function checkStoreRoleNames(uint8 num) external view returns(string memory) {
        return _core.roles.roleNames[num];
    }

    function roleExist(string calldata r, address account) external view returns(bool) {
        return RolesLib.exist(_core.roles, r, account);
    }

    function increaseContractEthBalance() external payable {}
}
