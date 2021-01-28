const ItemsLibTest = artifacts.require('ItemsLibTest')
    , web3 = require('web3')
    , truffleAssert = require('truffle-assertions')
    , { bytesDoSFactory, solToNum, deepClone } = require('../utils/')
    , { Mocks } = require('../utils/mocks')
    , E16 =  require('../utils/E16');

const BN = web3.utils.BN;

contract("ItemsLibTest", (accounts) => {
    let items;
    let [acc] = accounts;
    let mocks = new Mocks(accounts);

    let [mockItem] = mocks.tasks()
        , TEST_KIND = 'test'
        , zeroAddress = '0x0000000000000000000000000000000000000000';


    mockItem = {
        value: mockItem.reward,
        itemType: mockItem.taskType,
        data: E16.encodePack(E16.encodeArr(mockItem.questions)),
        totalAmount: mockItem.totalAmount,
        category: mockItem.category
    };

    beforeEach(async () => {
        items = await ItemsLibTest.new();
    });

    describe('Unit', function () {
        describe('addKind', function () {
            it('should add kind', async function () {
                await items.addKind(TEST_KIND);
                const [count, kind] = await Promise.all([
                    items.getStoreCount(),
                    items.checkStoreNames(1)
                ]);
                assert.equal(solToNum(count), 1);
                assert.equal(kind, TEST_KIND);
            });
            it('should revert if kind is emptry string', async function () {
                await truffleAssert.reverts(
                    items.addKind(''),
                    null
                );
            });
            it('should revert if adding same kind', async function () {
                await items.addKind(TEST_KIND);
                await truffleAssert.reverts(
                  items.addKind(TEST_KIND),
                  null
                );
            });
        });

        describe('addItem', function () {
            it('should add item', async function () {
                await items.addKind(TEST_KIND);
                await items.addItem(TEST_KIND, ...Object.values(mockItem));
                const {
                    value,
                    itemType,
                    status,
                    data,
                    totalAmount,
                    resultsAmount,
                    category
                } = await items.getKindItem(TEST_KIND, 1);
                assert.equal(data, web3.utils.bytesToHex(mockItem.data));
                assert.equal(solToNum(category), mockItem.category);
                assert.equal(solToNum(value), mockItem.value);
                assert.equal(solToNum(itemType), mockItem.itemType);
                assert.equal(solToNum(status), 0);
                assert.equal(solToNum(totalAmount), mockItem.totalAmount);
                assert.equal(solToNum(resultsAmount), 0);
            });
            it('should revert add item if not existing kind', async function () {
                await items.addKind(TEST_KIND);
                await truffleAssert.reverts(
                    items.addItem('ANOTHER_TEST_KIND', ...Object.values(mockItem)),
                    null
                );
            });
            it('should revert too big data', async function () {
                await items.addKind(TEST_KIND);
                const args = deepClone(mockItem);
                args.data = bytesDoSFactory();
                await truffleAssert.fails(
                    items.addItem(TEST_KIND, ...Object.values(args)),
                    truffleAssert.ErrorType.OUT_OF_GAS
                );
            });
        });

        describe('addResult', function () {
            it('should add result', async function () {
                await items.addKind(TEST_KIND);
                await items.addItem(TEST_KIND, ...Object.values(mockItem));
                await items.addResult(TEST_KIND, 1, acc, '0x1');
                const id = await items.getItemAccToNum(TEST_KIND, 1, acc);
                const _acc = await items.getItemNumToAcc(TEST_KIND, 1, 1);
                const results = await items.getItemResults(TEST_KIND, 1, acc);
                assert.equal(solToNum(id), "1");
                assert.equal(_acc.toString(), acc);
                assert.equal(results, '0x01');
            });
            it('should revert if not existing kind', async function () {
                await items.addKind(TEST_KIND);
                await items.addItem(TEST_KIND, ...Object.values(mockItem));
                await truffleAssert.reverts(
                    items.addResult('ANOTHER_TEST_KIND', 1, acc, '0x1'),
                    null
                );
            });
            it('should revert if result data is too big', async function () {
                await items.addKind(TEST_KIND);
                await items.addItem(TEST_KIND, ...Object.values(mockItem));
                await truffleAssert.fails(
                    items.addResult(TEST_KIND, 1, acc, bytesDoSFactory()),
                    truffleAssert.ErrorType.OUT_OF_GAS
                );
            });
            it('should revert if data is empty', async function () {
                await items.addKind(TEST_KIND);
                await items.addItem(TEST_KIND, ...Object.values(mockItem));
                await truffleAssert.reverts(
                    items.addResult(TEST_KIND, 1, acc, '0x0'),
                    null
                );
            });
        });

        describe('setStatus', function () {
            it('should set status', async function () {
                await items.addKind(TEST_KIND);
                await items.addItem(TEST_KIND, ...Object.values(mockItem));
                await items.setStatus(TEST_KIND, 1, 1);
                const { status } = await items.getKindItem(TEST_KIND, 1);
                assert.equal(solToNum(status), 1);
            });
            it('should revert not existing item id', async function () {
                await items.addKind(TEST_KIND);
                await items.addItem(TEST_KIND, ...Object.values(mockItem));
                await truffleAssert.reverts(
                    items.setStatus(TEST_KIND, 55, 1),
                    null
                );
            });
        });
        describe('exist', function () {
            it('should return correct exist', async function () {
                await items.addKind(TEST_KIND);
                await items.addItem(TEST_KIND, ...Object.values(mockItem));

                let res = await items.exist(TEST_KIND, 1);
                assert.equal(res, false);

                await items.setStatus(TEST_KIND, 1, 1);
                res = await items.exist(TEST_KIND, 1);
                assert.equal(res, true);
            });
            it('should throw if require condition is not correct', async function () {
                await truffleAssert.reverts(
                    items.exist(TEST_KIND, 0),
                    null
                );
            });
        });
    });
});
