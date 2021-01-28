pragma solidity >=0.4.0 <0.7.0;


library RolesLib {

    struct Role {
        uint count;
        mapping (uint => address) numToAcc; // from 1 to Inf
        mapping (address => uint) accToNum;
        mapping (address => Subject) subjects;
    }

    struct Store {
        uint8 count;
        mapping (uint8 => string) roleNames; // from 1 to Inf
        mapping (string => Role) roles;
    }

    struct Subject {
        uint8 accessLevel;
        string name;
        string description;
        string logo;
    }

    function _addRole(Store storage s, string memory name) internal {
        s.count += 1;
        s.roleNames[s.count] = name;
    }

    function _addSubject(Store storage s, string memory r, address account, uint8 accessLevel, string memory name, string memory description, string memory logo) internal {
        require(!exist(s, r, account), "Roles: account already has role");

        s.roles[r].count += 1;

        s.roles[r].subjects[account] = Subject(accessLevel, name, description, logo);
        s.roles[r].numToAcc[s.roles[r].count] = account;
        s.roles[r].accToNum[account] = s.roles[r].count;
    }

    function _removeSubject(Store storage s, string memory r, address account) internal {
        require(exist(s, r, account), "Roles: account do not have a role");

        s.roles[r].numToAcc[s.roles[r].accToNum[account]] = s.roles[r].numToAcc[s.roles[r].count];
        s.roles[r].accToNum[s.roles[r].numToAcc[s.roles[r].count]] = s.roles[r].accToNum[account];
        s.roles[r].accToNum[account] = 0;

        s.roles[r].count -= 1;
    }

    function _updateAccessLevel(Store storage s, string memory r, address account, uint8 accessLevel) internal {
        require(exist(s, r, account), "Roles: can not update account: not exist");

        s.roles[r].subjects[account].accessLevel = accessLevel;
    }

    function exist(Store storage s, string memory r, address account) public view returns (bool) {
        require(account != address(0), "address should not be 0x0");

        return s.roles[r].accToNum[account] > 0;
    }

    function haveRoleAndAccess(Store storage s, string memory r, address account, uint8 requiredLevel) public view returns (bool) {
        require(account != address(0), "address should not be 0x0");

        return exist(s, r, account)
            && (s.roles[r].accToNum[account] > 0)
            && (s.roles[r].subjects[account].accessLevel >= requiredLevel);
    }

    function _setDescription(Store storage s, string memory r, address account, string memory description) internal {
        require(exist(s, r, account), "Roles: account does not have a role");

        s.roles[r].subjects[account].description = description;
    }

    function _setName(Store storage s, string memory r, address account, string memory name) internal {
        require(exist(s, r, account), "Roles: account does not have a role");

        s.roles[r].subjects[account].name = name;
    }

    function _setLogo(Store storage s, string memory r, address account, string memory logo) internal {
        require(exist(s, r, account), "Roles: account does not have a role");

        s.roles[r].subjects[account].logo = logo;
    }
}

