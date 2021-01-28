pragma solidity >=0.4.0 <0.7.0;


library ItemsLib {

	enum Category {
		NO_CATEGORY,
		SHOPPING,
		TRANSPORT,
		TRAVEL,
		ENTERTAINMENT,
		COMMUNAL,
		HEALTH,
		SERVICES,
		GENERAL,
		INSURANCE
	}

    struct Kind {
        uint count;
        mapping (uint => Item) items;
    }

    struct Store {
        uint8 count;
        mapping (uint8 => string) names;
        mapping (string => Kind) kinds;
    }

    struct Item {
		string caption;
		string description;
		string image;
		uint value;
		Category category;
		address owner;
		uint8 itemType;
		uint8 status;
		bytes data;
		uint totalAmount;
		uint resultsAmount;
		mapping (address => uint) accToNum;
		mapping (uint => address) numToAcc;
		mapping (address => bytes) results;
    }

    function _addKind(Store storage s, string memory name) internal {
        s.count += 1;
        s.names[s.count] = name;
    }

    function _addItem(Store storage s, string memory k,
		string memory caption,
		string memory description,
		string memory image,

		uint value,
		uint category,
		address owner,
		uint8 itemType,
		bytes memory data,
		uint totalAmount
    	) internal
    {
		require(bytes(caption).length > 0, "caption should not be empty");
		require(bytes(caption).length <= 144, "caption should not be longer than 144 symbols");
		require(bytes(description).length > 0, "description should not be empty");
		require(value != 0, "value should not be 0");
		require(totalAmount != 0, "total amount should not be 0");

		s.kinds[k].count += 1;

		Category category_ = Category(category);

        s.kinds[k].items[s.kinds[k].count] = Item(
        	caption, description, image,
        	value, category_, owner, itemType, 0, data, totalAmount, 0);
    }

    function _addResult(Store storage s, string memory k, uint i, address account, bytes memory data) internal {
		require(s.kinds[k].items[i].status == 1, "item should exist and be accepted before complete");
    	s.kinds[k].items[i].resultsAmount += 1;
    	uint num = s.kinds[k].items[i].resultsAmount;
    	s.kinds[k].items[i].accToNum[account] = num;
    	s.kinds[k].items[i].numToAcc[num] = account;

		s.kinds[k].items[i].results[account] = data;
    }

    function _setStatus(Store storage s, string memory k, uint i, uint8 status) internal {
		require(s.kinds[k].items[i].owner != address(0), "item not exist");
		require(status != s.kinds[k].items[i].status, "status already set");
    	s.kinds[k].items[i].status = status;
    }

    function _exist(Store storage s, string memory k, uint i) internal view returns (bool) {
        require(i != 0, "Items: zero number");

        return s.kinds[k].items[i].status > 0;
    }
}
