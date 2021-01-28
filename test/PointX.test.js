const PointX = artifacts.require('PointX')
    , TokenX = artifacts.require('TokenX')
    , truffleAssert = require('truffle-assertions')
    , E16 = require('../utils/E16')
    , {Mocks} = require('../utils/mocks')
    , {solToNum, bytesDoSFactory, deepClone} = require('../utils/');

contract('PointX', accounts => {
    let mocks = new Mocks(accounts);
    let { admin, partner1, user1, moderator } = mocks.roles()
        , [mockTask] = mocks.tasks()
        , [mockPartner, mockPartner2] = mocks.partners()
        , [mockReward] = mocks.rewards()
        , [mockUser, mockUser2] = mocks.users()
        , [mockAdmin, mockModerator] = mocks.admins()
        , reasons = mocks.reasons();
    let pointX, tokenX;


    const name = "TokenX";
    const symbol = "PNTX";
    const decimals = 18;
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    mockTask = {
        caption: mockTask.caption,
        description: mockTask.description,
        itemType: mockTask.taskType,
        data: E16.encodePack(E16.encodeArr(mockTask.questions)),
        reward: mockTask.reward,
        totalAmount: mockTask.totalAmount,
        category: mockTask.category
    };

    mockReward = {
        caption: mockReward.caption,
        description: mockReward.description,
        imageLink: mockReward.imageLink,
        price: mockReward.price,
        totalAmount: mockReward.totalAmount,
        category: mockReward.category
    };

    describe('Unit tests', async () => {
        const setup = async () => {
            tokenX = await TokenX.new(name, symbol, decimals);
            pointX = await PointX.new();
            await pointX.setToken(tokenX.address);

            await tokenX.addMinter(pointX.address);
            await tokenX.renounceMinter({from: admin});
            await pointX.increaseContractEthBalance({value:10**18});
            await pointX.addPartner(...Object.values(mockPartner), {from: admin});
        };
        beforeEach(setup);

        describe('setToken', async () => {

            it('should revert if zero address', async () => {
                await truffleAssert.reverts(
                    pointX.setToken(zeroAddress, { from: admin }),
                    'address should not be 0x0'
                );
            });
            it('should revert if not admin', async () => {
                const newToken = await TokenX.new(name, symbol, decimals);
                await truffleAssert.reverts(
                    pointX.setToken(newToken.address, { from: partner1 }),
                    'RolesController: caller does not have a required role and access level.'
                );
                await truffleAssert.reverts(
                    pointX.setToken(newToken.address, { from: user1 }),
                    'RolesController: caller does not have a required role and access level.'
                );
            });
            it('should test set another token', async () => {
                const newToken = await TokenX.new(name, symbol, decimals);
                const tx = await pointX.setToken(newToken.address, { from: admin });
                truffleAssert.eventEmitted(tx, 'SetToken', (ev) => {
                    return ev.caller === admin && ev.tokenAddress === newToken.address;
                });
                const token = await pointX.getTokenAddress();
                assert.equal(newToken.address, token);
            });
        });

        describe('getTokenAddress', async () => {

            it('should get correct token address', async () => {
                const val = await pointX.getTokenAddress();
                assert.equal(val, tokenX.address);
            });
            it('should get correct token address after setting new token', async () => {
                const val = await pointX.getTokenAddress();
                assert.equal(val, tokenX.address);

                const newToken = await TokenX.new(name, symbol, decimals);
                await pointX.setToken(newToken.address, { from: admin });

                const token = await pointX.getTokenAddress();
                assert.equal(newToken.address, token);
            });
        });

        describe('upgradeAdmin', async () => {
            it('should upgrade admin', async () => {
                await pointX.addAdmin(...Object.values(mockModerator), { from: admin });
                let { account, accessLevel, number, name } = await pointX.getAdminByAddress(moderator);
                const count = await pointX.getAdminsCount();

                assert.equal(account, moderator);
                assert.equal(name, mockModerator.name);
                assert.equal(solToNum(count), 2);
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(solToNum(number), 2);
                const tx = await pointX.upgradeAdmin(moderator, {from: admin});
                accessLevel = (await pointX.getAdminByAddress(moderator)).accessLevel;
                truffleAssert.eventEmitted(tx, 'UpgradeAdmin', (ev) => {
                    return ev.caller === admin || ev.acc === moderator;
                });
                assert.equal(solToNum(accessLevel), 2);
            });

            it('should revert if zero address', async () => {
                await truffleAssert.reverts(
                    pointX.upgradeAdmin(zeroAddress, { from: admin }),
                    reasons.zeroAddress
                );
            });
            it('should revert if admin does not exist', async () => {
                await truffleAssert.reverts(
                    pointX.upgradeAdmin(moderator, { from: admin }),
                    reasons.notExist
                );
            });
            it('should revert if sender is not at access level 2', async () => {
                await pointX.addAdmin(...Object.values(mockModerator), { from: admin });
                await truffleAssert.reverts(
                    pointX.upgradeAdmin(moderator, { from: moderator }),
                    reasons.invalidRole
                );
            });
        });

        describe('addTask', async () => {

            it('should revert if no balance', async () => {
                await truffleAssert.reverts(
                    pointX.addTask(...Object.values(mockTask), {from: partner1}),
                    reasons.noBalance
                );
            });
            it('should revert if not partner', async () => {
                await truffleAssert.reverts(
                    pointX.addTask(...Object.values(mockTask), {from: admin}),
                    reasons.invalidRole
                );
            });
            it('should revert if caption is empty', async () => {
                let _mock = deepClone(mockTask);
                _mock.caption = '';
                _mock.data = mockTask.data;
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await truffleAssert.reverts(
                    pointX.addTask(...Object.values(_mock), {from: partner1}),
                    'caption should not be empty'
                );
            });
            it('should revert if description is empty', async () => {
                let _mock = deepClone(mockTask);
                _mock.description = '';
                _mock.data = mockTask.data;
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await truffleAssert.reverts(
                    pointX.addTask(...Object.values(_mock), {from: partner1}),
                    'description should not be empty'
                );
            });
            it('should revert if data is too big', async () => {
                let _mock = deepClone(mockTask);
                _mock.data = bytesDoSFactory();
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await truffleAssert.reverts(
                    pointX.addTask(...Object.values(_mock), {from: partner1}),
                    null
                );
            });
            it('should revert if value is 0', async () => {
                let _mock = deepClone(mockTask);
                _mock.data = mockTask.data;
                _mock.reward = 0;
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await truffleAssert.reverts(
                    pointX.addTask(...Object.values(_mock), {from: partner1}),
                    null
                );
            });
            it('should revert if total amount is 0', async () => {
                let _mock = deepClone(mockTask);
                _mock.data = mockTask.data;
                _mock.totalAmount = 0;
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await truffleAssert.reverts(
                    pointX.addTask(...Object.values(_mock), {from: partner1}),
                    null
                );
            });

            it('should add task', async () => {
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                const tx = await pointX.addTask(...Object.values(mockTask), {from: partner1});
                const { caption, description, image, value, owner, status, itemType, totalAmount, resultsAmount, number, category } = await pointX.getTask(1);
                assert.equal(caption, mockTask.caption);
                assert.equal(description, mockTask.description);
                assert.equal(image, mockTask.image);
                assert.equal(owner, partner1);
                assert.equal(itemType, mockTask.itemType);
                assert.equal(solToNum(value), mockTask.reward);
                assert.equal(solToNum(status), 0);
                assert.equal(solToNum(totalAmount), mockTask.totalAmount);
                assert.equal(solToNum(resultsAmount), 0);
                assert.equal(solToNum(number), 1);
                assert.equal(solToNum(category), mockTask.category);
                truffleAssert.eventEmitted(tx, 'AddTask', (ev) => {
                    return ev.caller === partner1 && ev.task.caption === mockTask.caption
                        && ev.task.description === mockTask.description;
                });
            });
        });

        describe('acceptTask', async () => {

            it('should revert if not admin', async () => {
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await pointX.addTask(...Object.values(mockTask), {from: partner1});

                let status = (await pointX.getTask(1)).status;
                assert.equal(solToNum(status), 0);
                await truffleAssert.reverts(
                    pointX.acceptTask(1, {from: partner1}),
                    reasons.invalidRole
                );
            });
            it('should revert if task already accepted', async () => {
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await pointX.addTask(...Object.values(mockTask), {from: partner1});

                let status = (await pointX.getTask(1)).status;
                assert.equal(solToNum(status), 0);

                await pointX.acceptTask(1, {from: admin});
                status = (await pointX.getTask(1)).status;
                assert.equal(solToNum(status), 1);
                await truffleAssert.reverts(
                    pointX.acceptTask(1, {from: admin}),
                    'status already set'
                );
            });
            it('should accept task', async () => {
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await pointX.addTask(...Object.values(mockTask), {from: partner1});

                let status = (await pointX.getTask(1)).status;
                assert.equal(solToNum(status), 0);

                const tx = await pointX.acceptTask(1, {from: admin});
                status = (await pointX.getTask(1)).status;
                assert.equal(solToNum(status), 1);

                truffleAssert.eventEmitted(tx, 'AcceptTask', (ev) => {
                    return ev.caller === admin && solToNum(ev.id) === 1;
                });
            });
        });

        describe('completeTask', async () => {

            it('should revert if not user', async () => {
                await truffleAssert.reverts(
                    pointX.completeTask(1, '0x1', { from: admin }),
                    reasons.invalidRole
                );
            });
            it('should revert if result is too big', async () => {
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser2), {from: admin});
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await pointX.addTask(...Object.values(mockTask), {from: partner1});
                await truffleAssert.reverts(
                    pointX.completeTask(1, bytesDoSFactory(), { from: mockUser2.address })
                );
            });
            it('should revert if task does not exist', async () => {
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser2), {from: admin});
                await truffleAssert.reverts(
                    pointX.completeTask(55, '0x1', { from: mocks.user2 }),
                    reasons.taskShouldBeAccepted
                );
            });
            it('should add result', async () => {
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await pointX.addTask(...Object.values(mockTask), {from: partner1});
                await pointX.acceptTask(1, {from: admin});
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser2), {from: admin});
                const tx = await pointX.completeTask(1, '0x1', { from: mocks.user2 });
                const {data, number, account, taskId} = await pointX.getTaskResultByAddress(1, mocks.user2);
                assert.equal(data, '0x01');
                assert.equal(solToNum(number), 1);
                assert.equal(account, mocks.user2);
                assert.equal(solToNum(taskId), 1);

                truffleAssert.eventEmitted(tx, 'CompleteTask', (ev) => {
                    return ev.caller === mocks.user2 && solToNum(ev.id) === 1;
                });
            });
        });

        describe('addReward', async () => {

            it('should revert if not partner', async () => {
                await truffleAssert.reverts(
                    pointX.addReward(...Object.values(mockReward), {from: admin}),
                    reasons.invalidRole
                )
            });
            it('should revert if caption is emptry string', async () => {
                let _mock = deepClone(mockReward);
                _mock.caption = '';
                await truffleAssert.reverts(
                    pointX.addReward(...Object.values(_mock), {from: partner1}),
                    'caption should not be empty'
                )
            });

            it('should revert if description is emptry string', async () => {
                let _mock = deepClone(mockReward);
                _mock.description = '';
                await truffleAssert.reverts(
                    pointX.addReward(...Object.values(_mock), {from: partner1}),
                    'description should not be empty'
                )
            });
            it('should revert if value is 0', async () => {
                let _mock = deepClone(mockReward);
                _mock.price = 0;
                await truffleAssert.reverts(
                    pointX.addReward(...Object.values(_mock), {from: partner1}),
                    'value should not be 0'
                )
            });
            it('should revert if total amount is 0', async () => {
                let _mock = deepClone(mockReward);
                _mock.totalAmount = 0;
                await truffleAssert.reverts(
                    pointX.addReward(...Object.values(_mock), {from: partner1}),
                    'total amount should not be 0'
                )
            });
            it('should add reward', async () => {
                const tx = await pointX.addReward(...Object.values(mockReward), {from: partner1});
                const {
                    caption,
                    description,
                    image,
                    value,
                    owner,
                    status,
                    totalAmount,
                    resultsAmount,
                    number,
                    category
                } = await pointX.getReward(1);
                assert.equal(caption, mockReward.caption);
                assert.equal(description, mockReward.description);
                assert.equal(image, mockReward.imageLink);
                assert.equal(owner, partner1);
                assert.equal(solToNum(value), mockReward.price);
                assert.equal(solToNum(status), 0);
                assert.equal(solToNum(totalAmount), mockReward.totalAmount);
                assert.equal(solToNum(resultsAmount), 0);
                assert.equal(solToNum(number), 1);
                assert.equal(solToNum(category), mockReward.category);

                truffleAssert.eventEmitted(tx, 'AddReward', (ev) => {
                    return ev.caller === partner1 && ev.reward.caption === mockReward.caption
                        && ev.reward.description === mockReward.description; // etc...
                });
            });
        });

        describe('completeReward', async () => {

            it('should revert if not user', async () => {
                await truffleAssert.reverts(
                    pointX.completeReward(1, { from: admin }),
                    reasons.invalidRole
                );
            });
            it('should revert if no such reward', async () => {
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                await pointX.unlockRewardsForUser(user1, {from: admin});
                await truffleAssert.reverts(
                    pointX.completeReward(55, { from: user1 }),
                    'item should exist and be accepted before complete'
                )
            });
            it('should revert if user success level is 1', async () => {
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                await truffleAssert.reverts(
                    pointX.completeReward(1, { from: user1 }),
                    reasons.invalidRole
                )
            });
            it('should add result to items', async () => {
                await pointX.addReward(...Object.values(mockReward), {from: partner1});
                await pointX.acceptReward(1, {from: admin});
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                await pointX.unlockRewardsForUser(user1, {from: admin});

                await pointX.addTokenBalance(user1, mockTask.reward * mockTask.totalAmount, { from: admin });
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, { from: user1 });
                const tx = await pointX.completeReward(1, { from: user1 });
                const {resultsAmount} = await pointX.getReward(1);
                assert.equal(solToNum(resultsAmount), 1);
                truffleAssert.eventEmitted(tx, 'CompleteReward', (ev) => {
                   return ev.caller === user1 && solToNum(ev.id) === 1;
                });
            });
        });

        describe('acceptReward', async () => {

            it('should revert if not admin', async () => {
                await truffleAssert.reverts(
                    pointX.acceptReward(1, { from: partner1 }),
                    reasons.invalidRole
                )
            });
            it('should revert if no such reward', async () => {
                await truffleAssert.reverts(
                    pointX.acceptReward(55, { from: admin }),
                    'item not exist'
                );
            });
            it('should revert if item already accepted', async () => {
                await pointX.addReward(...Object.values(mockReward), {from: partner1});
                await pointX.acceptReward(1, {from: admin});
                const {status} = await pointX.getReward(1);
                assert.equal(solToNum(status), 1);

                await truffleAssert.reverts(
                    pointX.acceptReward(1, {from: admin}),
                    'status already set'
                );
            });
            it('should accept reward', async () => {
                await pointX.addReward(...Object.values(mockReward), {from: partner1});
                const tx = await pointX.acceptReward(1, {from: admin});
                const {status} = await pointX.getReward(1);
                assert.equal(solToNum(status), 1);

                truffleAssert.eventEmitted(tx, 'AcceptReward', (ev) => {
                    return ev.caller === admin && solToNum(ev.id) === 1;
                });
            });
        });

        describe('unlockRewardsForUser', async () => {

            it('should revert if user does not exist', async () => {
                await truffleAssert.reverts(
                    pointX.unlockRewardsForUser(user1, {from: admin}),
                    reasons.notExist
                );
            });
            it('should revert if zero address', async () => {
                await truffleAssert.reverts(
                    pointX.unlockRewardsForUser(zeroAddress, {from: admin}),
                    'address should not be 0x0'
                );
            });
            it('should revert if not admin', async () => {
                await truffleAssert.reverts(
                    pointX.unlockRewardsForUser(user1, {from: partner1}),
                    reasons.invalidRole
                );
            });
            it('should unlock rewards', async () => {
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                let { accessLevel, account, number } = await pointX.getUserByAddress(user1);
                assert.equal(account, user1);
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(solToNum(number), 1);

                const tx = await pointX.unlockRewardsForUser(user1);
                accessLevel = (await pointX.getUserByAddress(user1)).accessLevel;
                assert.equal(solToNum(accessLevel), 2);

                truffleAssert.eventEmitted(tx, 'UnlockRewardsForUser', (ev) => {
                    return ev.caller === admin && ev.acc === user1;
                });
            });
        });

        describe('addUserAndUnlockTasks', async () => {

            it('should revert because of zero address', async () => {
                const args = Object.values(mockUser);
                args[0] = zeroAddress;
                await truffleAssert.reverts(
                    pointX.addUserAndUnlockTasks(...args, {from: admin})
                );
            });
            it('should revert if not admin', async () => {
                await truffleAssert.reverts(
                    pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: partner1}),
                    reasons.invalidRole
                );
            });
            it('should ? if adding existing user', async () => {
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                await truffleAssert.reverts(
                    pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin})
                );
            });
            it('should add user', async () => {
                const tx = await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                const { accessLevel, account, number } = await pointX.getUserByAddress(user1);
                const count = await pointX.getUsersCount();
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(solToNum(number), 1);
                assert.equal(solToNum(count), 1);
                assert.equal(account, user1);

                truffleAssert.eventEmitted(tx, 'UnlockTasksForUser', ev => {
                    return ev.caller === admin && ev.acc === user1;
                });
            });
        });

        describe('addPartner', async () => {

            it('should revert because of zero address', async () => {
                let _mock = deepClone(mockPartner2);
                _mock.address = zeroAddress;
                await truffleAssert.reverts(
                    pointX.addPartner(...Object.values(_mock), {from: admin}),
                    'address should not be 0x0'
                );
            });
            it('should revert if not admin', async () => {
                await truffleAssert.reverts(
                    pointX.addPartner(...Object.values(mockPartner2), {from: partner1}),
                    reasons.invalidRole
                );
            });
            it('should ? if adding existing partner', async () => {
                await pointX.addPartner(...Object.values(mockPartner2), {from: admin});

                const {account, name, description, logo, number} = await pointX.getPartnerByAddress(mockPartner2.address);
                const count = await pointX.getPartnersCount();
                assert.equal(account, mockPartner2.address);
                assert.equal(name, mockPartner2.name);
                assert.equal(description, mockPartner2.description);
                assert.equal(logo, mockPartner2.logo);
                assert.equal(solToNum(number), 2);
                assert.equal(solToNum(count), 2);
                await truffleAssert.reverts(
                    pointX.addPartner(...Object.values(mockPartner2), {from: admin})
                );
            });
            it('should add partner', async () => {
                const tx = await pointX.addPartner(...Object.values(mockPartner2), {from: admin});

                const {account, name, description, logo, number} = await pointX.getPartnerByAddress(mockPartner2.address);
                const count = await pointX.getPartnersCount();
                assert.equal(account, mockPartner2.address);
                assert.equal(name, mockPartner2.name);
                assert.equal(description, mockPartner2.description);
                assert.equal(logo, mockPartner2.logo);
                assert.equal(solToNum(number), 2);
                assert.equal(solToNum(count), 2);

                truffleAssert.eventEmitted(tx, 'AddPartner', ev => {
                    return ev.caller === admin && ev.partner.name === mockPartner2.name;
                });
            });
        });

        describe('addAdmin', async () => {

            it('should revert because of zero address', async () => {
                const args = Object.values(mockModerator);
                args[0] = zeroAddress;
                await truffleAssert.reverts(
                    pointX.addAdmin(...args, { from: admin }),
                    'address should not be 0x0'
                );
            });
            it('should revert if not admin', async () => {
                await truffleAssert.reverts(
                    pointX.addAdmin(...Object.values(mockModerator), { from: partner1 }),
                    reasons.invalidRole
                );
            });
            it('should revert if admin but with 1st access level', async () => {
                await pointX.addAdmin(...Object.values(mockModerator), { from: admin });
                await truffleAssert.reverts(
                    pointX.addAdmin(...Object.values(mockUser2), { from: moderator }),
                    reasons.invalidRole
                );
            });
            it('should revert if adding existing admin', async () => {
                await pointX.addAdmin(...Object.values(mockModerator), { from: admin });
                await truffleAssert.reverts(
                    pointX.addAdmin(...Object.values(mockModerator), { from: admin })
                );
            });
            it('should add admin', async () => {
                const tx = await pointX.addAdmin(...Object.values(mockModerator), { from: admin });
                const { account, accessLevel, number } = await pointX.getAdminByAddress(moderator);
                const count = await pointX.getAdminsCount();
                assert.equal(account, moderator);
                assert.equal(solToNum(count), 2);
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(solToNum(number), 2);

                truffleAssert.eventEmitted(tx, 'AddAdmin', ev => {
                   return ev.caller === admin && ev.acc === moderator;
                });
            });
        });

        describe('removeAdmin', () => {

            it('should revert if not admin', async () => {
                await truffleAssert.reverts(
                    pointX.removeAdmin(moderator, {from: partner1}),
                    reasons.invalidRole
                );
            });
            it('should revert if zero address', async () => {
                await truffleAssert.reverts(
                    pointX.removeAdmin(zeroAddress, {from: admin}),
                    'address should not be 0x0'
                );
            });
            it('should revert if admin with access level 1', async () => {
                await pointX.addAdmin(...Object.values(mockModerator), { from: admin });
                await truffleAssert.reverts(
                    pointX.removeAdmin(admin, {from: moderator}),
                    reasons.invalidRole
                );
            });
            it('should ? if remove not existing admin', async () => {
                await truffleAssert.reverts(
                    pointX.removeAdmin(moderator, {from: admin}),
                    reasons.noRole
                );
            });
            it('should remove admin', async () => {
                await pointX.addAdmin(...Object.values(mockModerator), { from: admin });
                let { account, accessLevel, number } = await pointX.getAdminByAddress(moderator);
                let count = await pointX.getAdminsCount();
                assert.equal(account, moderator);
                assert.equal(solToNum(count), 2);
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(solToNum(number), 2);

                const tx = await pointX.removeAdmin(moderator);
                count = await pointX.getAdminsCount();
                assert.equal(solToNum(count), 1);

                truffleAssert.eventEmitted(tx, 'RemoveAdmin', ev => {
                    return ev.caller === admin && ev.acc === moderator;
                });
            });
        });

        describe('getPartnersCount', () => {

            it('should get partners count', async () => {
                const count = await pointX.getPartnersCount();
                assert.equal(solToNum(count), 1);
            });
        });
        describe('getUsersCount', () => {

            it('should get users count', async () => {
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                const count = await pointX.getUsersCount();
                assert.equal(solToNum(count), 1);
            });
        });
        describe('getAdminsCount', () => {

            it('should get admins count', async () => {
                const count = await pointX.getAdminsCount();
                assert.equal(solToNum(count), 1);
            });
        });
        describe('getUserByAddress', () => {

            it('should revert zero address', async () => {
                await truffleAssert.reverts(
                    pointX.getUserByAddress(zeroAddress, {from: admin}),
                    'address should not be 0x0'
                );
            });
            it('should get user by address', async () => {
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                const {account, accessLevel, number} = await pointX.getUserByAddress(user1);
                assert.equal(account, user1);
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(solToNum(number), 1);
            });
        });
        describe('getUserByNumber', () => {

            it('should get user by number', async () => {
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                const {account, accessLevel, number} = await pointX.getUserByNumber(1);
                assert.equal(account, mocks.user1);
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(solToNum(number), 1);
            });
        });
        describe('getAdminByAddress', () => {

            it('should revert zero address', async () => {
                await truffleAssert.reverts(
                    pointX.getAdminByAddress(zeroAddress, {from: admin}),
                    'address should not be 0x0'
                );
            });
            it('should get admin by address', async () => {
                const { account, accessLevel, number } = await pointX.getAdminByAddress(admin);
                assert.equal(account, admin);
                assert.equal(solToNum(accessLevel), 2);
                assert.equal(solToNum(number), 1);
            });
        });
        describe('getAdminByNumber', () => {

            it('should get admin with id', async () => {
                const { account, accessLevel, number } = await pointX.getAdminByNumber(1);
                assert.equal(account, admin);
                assert.equal(solToNum(accessLevel), 2);
                assert.equal(solToNum(number), 1);
            });
        });

        describe('getPartnerByAddress', () => {

            it('should revert zero address', async () => {
                await truffleAssert.reverts(
                    pointX.getPartnerByAddress(zeroAddress, {from: admin}),
                    'Can not get partner by address: account not found'
                );
            });
            it('should get partner by address', async () => {
                const { account, name, description, logo, number } = await pointX.getPartnerByAddress(partner1);
                assert.equal(account, partner1);
                assert.equal(name, mockPartner.name);
                assert.equal(description, mockPartner.description);
                assert.equal(logo, mockPartner.logo);
                assert.equal(solToNum(number), 1);
            });
        });
        describe('getPartnerByNumber', () => {

            it('should get partner by number', async () => {
                const { account, name, description, logo, number } = await pointX.getPartnerByNumber(1);
                assert.equal(account, mocks.partner1);
                assert.equal(name, mockPartner.name);
                assert.equal(description, mockPartner.description);
                assert.equal(logo, mockPartner.logo);
                assert.equal(solToNum(number), 1);
            });
        });


        describe('getReward', () => {

            it('should get reward', async () => {
                await pointX.addReward(...Object.values(mockReward), { from: partner1 });
                const {
                    caption,
                    description,
                    image,
                    value,
                    owner,
                    status,
                    totalAmount,
                    resultsAmount,
                    number,
                    data,
                    category
                } = await pointX.getReward(1);
                assert.equal(caption, mockReward.caption);
                assert.equal(description, mockReward.description);
                assert.equal(image, mockReward.imageLink);
                assert.equal(solToNum(value), mockReward.price);
                assert.equal(solToNum(status), 0);
                assert.equal(data, null);
                assert.equal(owner, partner1);
                assert.equal(solToNum(number), 1);
                assert.equal(solToNum(totalAmount), mockReward.totalAmount);
                assert.equal(solToNum(resultsAmount), 0);
                assert.equal(solToNum(category), mockReward.category);
            });
        });
        describe('getRewardResultByNumber', () => {

            it('should get reward', async () => {
                await pointX.addReward(...Object.values(mockReward), { from: partner1 });
                await pointX.acceptReward(1, { from: admin });
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });
                await pointX.unlockRewardsForUser(user1, { from: admin });

                await pointX.addTokenBalance(user1, mockTask.reward * mockTask.totalAmount, { from: admin });
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, { from: user1 });

                await pointX.completeReward(1, { from: user1 });

                const { number, account, rewardId } = await pointX.getRewardResultByNumber(1, 1);
                assert.equal(solToNum(number), 1);
                assert.equal(account, user1);
                assert.equal(solToNum(rewardId), 1);
            });
        });
        describe('getRewardResultByAddress', () => {

            it('should revert zero address', async () => {
                await truffleAssert.reverts(
                    pointX.getRewardResultByAddress(1, zeroAddress),
                    'address should not be 0x0'
                );
            });
            it('should get reward', async () => {
                await pointX.addReward(...Object.values(mockReward), { from: partner1 });
                await pointX.acceptReward(1, { from: admin });
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });
                await pointX.unlockRewardsForUser(user1, { from: admin });

                await pointX.addTokenBalance(user1, mockTask.reward * mockTask.totalAmount, { from: admin });
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, { from: user1 });

                await pointX.completeReward(1, { from: user1 });

                const { number, account, rewardId } = await pointX.getRewardResultByAddress(1, user1);
                assert.equal(solToNum(number), 1);
                assert.equal(account, user1);
                assert.equal(solToNum(rewardId), 1);
            });
        });
        describe('getRewardsCount', () => {

            it('should get reward', async () => {
                await pointX.addReward(...Object.values(mockReward), { from: partner1 });

                const count = await pointX.getRewardsCount();
                assert.equal(solToNum(count), 1);
            });
        });

        describe('getTask', () => {

            it('should get task', async () => {
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await pointX.addTask(...Object.values(mockTask), {from: partner1});
                const { caption, description, image, value, owner } = await pointX.getTask(1);
                assert.equal(caption, mockTask.caption);
                assert.equal(description, mockTask.description);
                assert.equal(image, mockTask.image);
                assert.equal(solToNum(value), mockTask.reward);
                assert.equal(owner, partner1);
            });
        });
        describe('getTaskResultByNumber', () => {

            it('should get task res by number', async () => {
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await pointX.addTask(...Object.values(mockTask), {from: partner1});
                await pointX.acceptTask(1, {from: admin});
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                await pointX.completeTask(1, '0x1', { from: user1 });
                const {data, number, account, taskId} = await pointX.getTaskResultByNumber(1, 1);
                assert.equal(data, '0x01');
                assert.equal(solToNum(number), 1);
                assert.equal(account, user1);
                assert.equal(solToNum(taskId), 1);
            });
        });
        describe('getTaskResultByAddress', () => {

            it('should revert zero address', async () => {
                await truffleAssert.reverts(
                    pointX.getTaskResultByAddress(1, zeroAddress),
                    'address should not be 0x0'
                );
            });
            it('should get task res by address', async () => {
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await pointX.addTask(...Object.values(mockTask), {from: partner1});
                await pointX.acceptTask(1, {from: admin});
                await pointX.addUserAndUnlockTasks(...Object.values(mockUser), {from: admin});
                await pointX.completeTask(1, '0x1', { from: user1 });
                const {data, number, account, taskId} = await pointX.getTaskResultByAddress(1, user1);
                assert.equal(data, '0x01');
                assert.equal(solToNum(number), 1);
                assert.equal(account, user1);
                assert.equal(solToNum(taskId), 1);
            });
        });
        describe('getTasksCount', () => {

            it('should get tasks count', async () => {
                await pointX.addTokenBalance(
                    partner1,
                    mockTask.reward * mockTask.totalAmount,
                    { from: admin }
                );
                await tokenX.approve(pointX.address, mockTask.reward * mockTask.totalAmount, {from: partner1});
                await pointX.addTask(...Object.values(mockTask), {from: partner1});

                const count = await pointX.getTasksCount();
                assert.equal(solToNum(count), 1);
            });
        });
    });
});
