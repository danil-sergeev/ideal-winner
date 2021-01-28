pragma solidity >=0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./ItemsLib.sol";

contract ItemsLibTest {
    ItemsLib.Store private _store;

    function addKind(string calldata name) external {
        ItemsLib._addKind(_store, name);
    }

    function addItem(
        string calldata k,
        uint value,
        uint8 itemType,
        bytes calldata data,
        uint totalAmount,
        uint category
    ) external {
        ItemsLib._addItem(_store, k, "testCaption", "testDescription", "testImage", value, category, msg.sender, itemType, data, totalAmount);
    }

    function addResult(string calldata k, uint i, address account, bytes calldata data) external {
        ItemsLib._addResult(_store, k, i, account, data);
    }

    function setStatus(string calldata k, uint i, uint8 status) external {
        ItemsLib._setStatus(_store, k, i, status);
    }

    function getStoreCount() external view returns (uint) {
        return _store.count;
    }

    function checkStoreNames(uint8 n) external view returns (string memory) {
        return _store.names[n];
    }
    function getKindItem(string calldata k, uint i) external view returns(string memory caption, string memory description, string memory image, uint value, address owner, uint8 itemType, uint8 status, bytes memory data, uint totalAmount, uint resultsAmount, ItemsLib.Category category) {
        ItemsLib.Item memory task = _store.kinds[k].items[i];
        return ( task.caption, task.description, task.image, task.value, task.owner, task.itemType, task.status, task.data, task.totalAmount, task.resultsAmount, task.category );
    }

    function getItemAccToNum(string calldata k, uint i, address acc) external view returns (uint) {
        return _store.kinds[k].items[i].accToNum[acc];
    }

    function getItemNumToAcc(string calldata k, uint i, uint n) external view returns (address) {
        return _store.kinds[k].items[i].numToAcc[n];
    }

    function getItemResults(string calldata k, uint i, address acc) external view returns (bytes memory) {
        return _store.kinds[k].items[i].results[acc];
    }

    function getKindCount(string calldata k) external view returns(uint) {
        return _store.kinds[k].count;
    }

    function exist(string calldata k, uint i) external view returns (bool) {
        return ItemsLib._exist(_store, k, i);
    }
}
