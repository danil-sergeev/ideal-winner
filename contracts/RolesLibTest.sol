pragma solidity >=0.4.0 <0.7.0;

import "./RolesLib.sol";

contract RolesLibTest {
    RolesLib.Store private _store;

    function addRole(string calldata name) external {
        RolesLib._addRole(_store, name);
    }

    function addSubject(string calldata roleName, address account, uint8 accessLevel, string calldata name, string calldata description, string calldata logo) external {
        RolesLib._addSubject(_store, roleName, account, accessLevel, name, description, logo);
    }

    function removeSubject(string calldata roleName, address account) external {
        RolesLib._removeSubject(_store, roleName, account);
    }

    function updateAccessLevel(string calldata roleName, address account, uint8 accessLevel) external {
        RolesLib._updateAccessLevel(_store, roleName, account, accessLevel);
    }

    function setLogo(string calldata roleName, address account, string calldata logo) external {
        RolesLib._setLogo(_store, roleName, account, logo);
    }

    function setName(string calldata roleName, address account, string calldata name) external {
        RolesLib._setName(_store, roleName, account, name);
    }

    function setDescription(string calldata roleName, address account, string calldata description) external {
        RolesLib._setDescription(_store, roleName, account, description);
    }

    function checkStoreRoleNames(uint8 num) external view returns(string memory) {
        return _store.roleNames[num];
    }

    function getStoreCount() external view returns (uint) {
        return _store.count;
    }

    function getRoleCount(string calldata role) external view returns (uint) {
        return _store.roles[role].count;
    }

    function getRoleNumToAcc(string calldata role, uint n) external view returns (address) {
        return _store.roles[role].numToAcc[n];
    }

    function getRoleAccToNum(string calldata role, address acc) external view returns (uint) {
        return _store.roles[role].accToNum[acc];
    }

    function getRoleSubjects(string calldata role, address acc) external view returns (uint8 accessLevel, string memory name, string memory description, string memory logo) {
        RolesLib.Subject memory subject = _store.roles[role].subjects[acc];
        return (subject.accessLevel, subject.name, subject.description, subject.logo);
    }

    function haveRoleAndAccess(string calldata role, address acc, uint8 requiredLvl) external view returns (bool) {
        return RolesLib.haveRoleAndAccess(_store, role, acc, requiredLvl);
    }

    function exist(string calldata role, address acc) external view returns (bool) {
        return RolesLib.exist(_store, role, acc);
    }
}
