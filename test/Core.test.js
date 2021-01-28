const CoreTest = artifacts.require("CoreTest")
    , TokenX = artifacts.require('TokenX')
    , web3 = require('web3')
    , truffleAssert = require('truffle-assertions')
    , E16 = require('../utils/E16')
    , {Mocks} = require('../utils/mocks')
    , {solToNum, shouldThrow, deepClone} = require('../utils');


contract('CoreTest', accounts => {
    let zeroAddress = '0x0000000000000000000000000000000000000000';
    let mocks = new Mocks(accounts);
    let core, tokenX;
    let [ mockPartner ] = mocks.partners()
        , [ mockUser, mockUser2 ] = mocks.users()
        , [ reward ] = mocks.rewards()
        , [ mockTask ] = mocks.tasks()
        , [ mockAdmin, mockModerator ] = mocks.admins()
        , { admin, moderator, partner1 } = mocks.roles();

    mockTask = {
        caption: mockTask.caption,
        description: mockTask.description,
        itemType: mockTask.taskType,
        data: E16.encodePack(E16.encodeArr(mockTask.questions)),
        reward: mockTask.reward,
        totalAmount: mockTask.totalAmount,
        category: mockTask.category
    };

    mockPartner = {
        name: mockPartner.name,
        description: mockPartner.description,
        logo: mockPartner.logo,
        account: mockPartner.address,
    };

    let roles = {
        ADMIN: "Admin",
        USER: "User",
        PARTNER: "Partner"
    };
    let kinds = {
        REWARD: "Reward",
        TASK: "Task"
    };

    beforeEach(async () => {
        const name = "TokenX";
        const symbol = "PNTX";
        const decimals = 18;

        tokenX = await TokenX.new(name, symbol, decimals);
        core = await CoreTest.new();

        await core.setToken(tokenX.address);
        await tokenX.addMinter(core.address);
        await tokenX.renounceMinter({from: admin});

        await core.increaseContractEthBalance({from: admin, value:10**18});
        await core.addPartner(Object.values(mockPartner));

        await core.addTokenBalance(partner1, mockTask.reward * mockTask.totalAmount, { from: admin });
        await tokenX.approve(core.address, mockTask.reward * mockTask.totalAmount, { from: partner1 });
    });

    describe('Core units', function () {

        describe('setToken', function () {
            it('should test set token', async function () {
                const newToken = await TokenX.new("TokenX", "PNTX", 18);
                await core.setToken(newToken.address, { from: admin });
                const token = await core.getTokenAddress();
                assert.equal(newToken.address, token);
            });

            it('should revert zero address', async function () {
                await truffleAssert.reverts(
                    core.setToken(zeroAddress, {from: admin}),
                    null
                );
            });

            it('should revert set token if admin is not access level 2', async function ( ) {
                const newToken = await TokenX.new("TokenX", "PNTX", 18);
                await truffleAssert.reverts(
                    core.setToken(newToken.address, { from: moderator }),
                    null
                );
            });
            it('should revert if not admin', async function () {
                const newToken = await TokenX.new("TokenX", "PNTX", 18);
                await truffleAssert.reverts(
                    core.setToken(newToken.address, { from: partner1 }),
                    null
                );
                await truffleAssert.reverts(
                    core.setToken(newToken.address, { from: mocks.user1 }),
                    null
                );
            });
        });

        describe('getTokenBalance', () => {
            it('should correctly get token balance', async function () {
                const balance = await core.getTokenBalance(partner1);
                assert.equal(solToNum(balance), 500);
            });
        });

        describe('addTokenBalance', () => {
            it('should add token balance and then get it correctly', async function () {
                await core.addTokenBalance(partner1, 100, { from: admin });
                const val = await core.getTokenBalance(partner1);
                assert.equal(solToNum(val), 600);
            });
            it('should revert zero address', async function () {
                await truffleAssert.reverts(
                    core.addTokenBalance(zeroAddress, 100, { from: admin }),
                    null
                );
            });
            it('should revert if not admin', async function () {
                await truffleAssert.reverts(
                    core.addTokenBalance(partner1, 100, { from: partner1 }),
                    null
                );
                await truffleAssert.reverts(
                    core.addTokenBalance(partner1, 100, { from: mocks.user1 }),
                    null
                );
            });
        });

        describe('getTokenAddress', () => {
            it('should get correct token address', async function () {
                const val = await core.getTokenAddress();
                assert.equal(val, tokenX.address);
            });
            it('should get correct token address after setting new one', async function () {
                const newToken = await TokenX.new("TokenX", "PNTX", 18);
                await core.setToken(newToken.address, { from: admin });
                const token = await core.getTokenAddress();
                assert.equal(newToken.address, token);
            });
        });

        describe('addPartner', () => {
            it('should add partner', async function () {
                let copy = deepClone(mockPartner);
                copy.account = mocks.partner2;
                await core.addPartner(Object.values(copy));
                const {accessLevel} = await core.getRoleSubjects(roles.PARTNER, copy.account);
                const role = await core.checkStoreRoleNames(3);

                assert.equal(accessLevel, 1);
                assert.equal(role, roles.PARTNER);
            });
            it('should revert if not admin', async function () {
                await truffleAssert.reverts(
                    core.addPartner(Object.values(mockPartner), { from: partner1 }),
                    null
                );
                await truffleAssert.reverts(
                    core.addPartner(Object.values(mockPartner), { from: mocks.user1 }),
                    null
                );
            });

            it('should revert if name is empty string', async function () {
                let copy = deepClone(mockPartner);
                copy.name = '';
                await truffleAssert.reverts(
                    core.addPartner(Object.values(mockPartner)),
                    null
                );
            });

            it('should revert if logo url is emptry string', async function () {
                let copy = deepClone(mockPartner);
                copy.logo = '';
                await truffleAssert.reverts(
                    core.addPartner(Object.values(mockPartner)),
                    null
                );
            });

            it('should revert if account is zero address', async function () {
                let copy = deepClone(mockPartner);
                copy.account = zeroAddress;
                await truffleAssert.reverts(
                    core.addPartner(Object.values(mockPartner)),
                    null
                );
            });
        });

        describe('addAdmin', function () {
            it('should add admin', async function () {
                await core.addAdmin(...Object.values(mockModerator), { from: admin });
                const {accessLevel, data} = await core.getRoleSubjects(roles.ADMIN, moderator);
                const role = await core.checkStoreRoleNames(1);

                assert.equal(solToNum(accessLevel), 1);
                assert.equal(role, roles.ADMIN);
                assert.equal(data, null);
            });

            it('shoud not add admin without access level 2', async function () {
                await core.addAdmin(...Object.values(mockModerator), { from: admin });

                await truffleAssert.reverts(
                    core.addAdmin(...Object.values(mockUser), {from: moderator}),
                    null
                );

            });

            it('should revert zero address', async function () {
                const args = Object.values(mockModerator);
                args[0] = zeroAddress;
                await truffleAssert.reverts(
                    core.addAdmin(...args, { from: admin }),
                    null
                );
            });

            it('should revert adding existing admin', async function () {
                await truffleAssert.reverts(
                    core.addAdmin(...Object.values(mockAdmin), { from: admin }),
                    null
                );
            });
        });

        describe('removeAdmin', () => {
            it('should remove admin', async function () {
                await core.upgradeAdmin(admin);
                await core.addAdmin(...Object.values(mockModerator), { from: admin });
                await core.removeAdmin(moderator);
                const exist = await core.roleExist(roles.ADMIN, moderator);
                assert.equal(exist, false);
            });
            it('should if not access level 2', async function () {
                await core.addAdmin(...Object.values(mockModerator), { from: admin });
                await truffleAssert.reverts(
                    core.removeAdmin(admin, { from: moderator }),
                    null
                );
            });
            it('should remove admin if not admin', async function () {
                await truffleAssert.reverts(
                    core.removeAdmin(mocks.user2, { from: partner1 }),
                    null
                );
                await truffleAssert.reverts(
                    core.removeAdmin(mocks.user2, { from: mocks.user1 }),
                    null
                );
            });
        });

        describe('upgradeAdmin', function () {
            it('should upgrade admin', async function () {
                await core.addAdmin(...Object.values(mockModerator), { from: admin });
                let {accessLevel, data} = await core.getRoleSubjects(roles.ADMIN, moderator);
                const role = await core.checkStoreRoleNames(1);
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(role, roles.ADMIN);
                assert.equal(data, null);
                await core.upgradeAdmin(moderator);
                accessLevel = (await core.getRoleSubjects(roles.ADMIN, moderator)).accessLevel;
                assert.equal(solToNum(accessLevel), 2);
            });
            it('should revert zero address', async function () {
                await truffleAssert.reverts(
                    core.upgradeAdmin(zeroAddress, {from: admin}),
                    null
                );
            });
            it('should revert upgrading upgraded admin', async function () {
                await core.addAdmin(...Object.values(mockModerator), { from: admin });
                await core.upgradeAdmin(moderator, { from: admin });
                await truffleAssert.reverts(
                    core.upgradeAdmin(moderator, {from: admin}),
                    null
                );
            });
            it('should revert if not access level 2', async function () {
                await core.addAdmin(...Object.values(mockModerator), { from: admin });
                await truffleAssert.reverts(
                    core.upgradeAdmin(moderator, {from: moderator}),
                    null
                );
            });
        });

        describe('addUserAndUnlockTasks', () => {
            it('should add user and unlock tasks', async function () {
                await core.addUserAndUnlockTasks(...Object.values(mockUser2), { from: admin });
                const {accessLevel, data} = await core.getRoleSubjects(roles.USER, mocks.user2);
                const role = await core.checkStoreRoleNames(2);
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(role, roles.USER);
                assert.equal(data, null);
            });
            it('should revert zero address', async function () {
                const args = Object.values(mockUser);
                args[0] = zeroAddress;
                await truffleAssert.reverts(
                    core.addUserAndUnlockTasks(...args, { from: admin }),
                    null
                );
            });
            it('should revert if user already exists', async function () {
                await core.addUserAndUnlockTasks(...Object.values(mockUser2), { from: admin });
                await truffleAssert.reverts(
                    core.addUserAndUnlockTasks(...Object.values(mockUser2), { from: admin }),
                    null
                );
            });
            it('should revert if not admin', async function () {
                await truffleAssert.reverts(
                    core.addUserAndUnlockTasks(...Object.values(mockUser2), { from: partner1 }),
                    null
                );
                await truffleAssert.reverts(
                    core.addUserAndUnlockTasks(...Object.values(mockUser2), { from: mocks.user1 }),
                    null
                );
            });
        });

        describe('unlockRewardsForUser', () => {

            it('should unlock rewards for user', async function () {
                await core.addUser(...Object.values(mockUser2), {from: admin });
                let {accessLevel, data} = await core.getRoleSubjects(roles.USER, mocks.user2);
                const role = await core.checkStoreRoleNames(2);
                assert.equal(solToNum(accessLevel), 1);
                assert.equal(role, roles.USER);
                assert.equal(data, null);

                await core.unlockRewardsForUser(mocks.user2, { from: admin });

                accessLevel = (await core.getRoleSubjects(roles.USER, mocks.user2)).accessLevel;
                assert.equal(solToNum(accessLevel), 2);
            });

            it('should revert zero address', async function () {
                await truffleAssert.reverts(
                    core.unlockRewardsForUser(zeroAddress, { from: admin }),
                    null
                );
            });

            it('should revert if user already have access to rewards', async function () {
                await core.addUser(...Object.values(mockUser2), {from: admin });
                await core.unlockRewardsForUser(mocks.user2, { from: admin });

                await truffleAssert.reverts(
                    core.unlockRewardsForUser(mocks.user2, { from: admin }),
                    null
                );
            });
        });

        describe('addReward', function () {
            it('should add reward', async function () {
                await core.addReward(Object.values(reward), { from: partner1 });
                const {
                    caption,
                    description,
                    image,
                    value,
                    status,
                    data,
                    totalAmount,
                    resultsAmount,
                    category
                } = await core.getKindItem(kinds.REWARD, 1);

                assert.equal(caption, reward.caption);
                assert.equal(description, reward.description);
                assert.equal(image, reward.imageLink);
                assert.equal(data, null);
                assert.equal(solToNum(category), reward.category);
                assert.equal(solToNum(value), reward.price);
                assert.equal(solToNum(status), 0);
                assert.equal(solToNum(totalAmount), reward.totalAmount);
                assert.equal(solToNum(resultsAmount), 0);
            });

            it('should revert if caption empty', async function () {
                const copy = deepClone(reward);
                copy.caption = '';
                await truffleAssert.reverts(
                    core.addReward(Object.values(reward), { from: partner1 }),
                    null
                );
            });

            it('should revert if price is 0', async function () {
                const copy = deepClone(reward);
                copy.price = 0;
                await truffleAssert.reverts(
                    core.addReward(Object.values(reward), { from: partner1 }),
                    null
                );
            });

            it('should revert if total amount is 0', async function () {
                const copy = deepClone(reward);
                copy.totalAmount = 0;
                await truffleAssert.reverts(
                    core.addReward(Object.values(reward), { from: partner1 }),
                    null
                );
            });
        });


        describe('completeReward', () => {
            it('should complete reward', async function () {
                await core.addReward(Object.values(reward), { from: partner1 });
                await core.acceptReward(1, { from: admin });
                await core.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });
                await core.unlockRewardsForUser(mocks.user1, { from: admin });

                await core.addTokenBalance(mocks.user1, mockTask.reward * mockTask.totalAmount, { from: admin });
                await tokenX.approve(core.address, mockTask.reward * mockTask.totalAmount, { from: mocks.user1 });

                await core.completeReward(1, { from: mocks.user1 });
                const data = await core.getItemResults(kinds.REWARD, 1, mocks.user1);

                const {
                    resultsAmount
                } = await core.getKindItem(kinds.REWARD, 1);

                assert.equal(data, null);
                assert.equal(resultsAmount, 1);
            });

            it('should revert if not existing task', async function () {
                await core.addReward(Object.values(reward), { from: partner1 });
                await core.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });
                await core.unlockRewardsForUser(mocks.user1, { from: admin });

                await truffleAssert.reverts(
                    core.completeReward(55, { from: mocks.user1 }),
                    null
                );
            });

            it('should revert if rewards is locked for user', async function () {
                await core.addReward(Object.values(reward), { from: partner1 });
                await core.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });

                await truffleAssert.reverts(
                    core.completeReward(1, { from: mocks.user1 }),
                    null
                );
            });

            it('should revert if user has insufficient balance', async function () {
                await core.addReward(Object.values(reward), { from: partner1 });
                await core.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });
                await core.unlockRewardsForUser(mocks.user1, { from: admin });

                await truffleAssert.reverts(
                    core.completeReward(1, { from: mocks.user1 }),
                    null
                );
            });

            it('should revert if not user', async function () {
                await truffleAssert.reverts(
                    core.completeReward(1, { from: admin }),
                    null
                );
                await truffleAssert.reverts(
                    core.completeReward(1, { from: partner1 }),
                    null
                );
            });
        });

        describe('acceptReward', function () {
            it('should accept reward', async function () {
                await core.addReward(Object.values(reward), { from: partner1 });
                await core.acceptReward(1, { from: admin });

                const { status } = await core.getKindItem(kinds.REWARD, 1);
                assert.equal(solToNum(status), 1);
            });
            it('should revert if reward already accepted', async function () {
                await core.addReward(Object.values(reward), { from: partner1 });
                await core.acceptReward(1, { from: admin });

                await truffleAssert.reverts(
                    core.acceptReward(1, { from: admin }),
                    null
                );
            });
            it('should revert if reward does not exist', async function () {
                await truffleAssert.reverts(
                    core.acceptReward(1, { from: admin }),
                    null
                );
            });
            it('should revert if not admin', async function () {
                await truffleAssert.reverts(
                    core.acceptReward(1, { from: partner1 }),
                    null
                );
                await truffleAssert.reverts(
                    core.acceptReward(1, { from: mocks.user1 }),
                    null
                );
            });
        });

        describe('addTask', function () {
            it('should add task', async function () {
                await core.addTask(Object.values(mockTask), { from: partner1 });

                const { caption, description, value, owner, category } = await core.getKindItem(kinds.TASK, 1);
                assert.equal(caption, mockTask.caption);
                assert.equal(description, mockTask.description);
                assert.equal(value, mockTask.reward);
                assert.equal(owner, partner1);
                assert.equal(solToNum(category), mockTask.category);
            });
            it('should transfer money', async function () {
                await core.addTask(Object.values(mockTask), { from: partner1 });
                const partnerBalance = await core.getTokenBalance(partner1);
                assert.equal(solToNum(partnerBalance), 0);
            });
            it('should revert if not partner', async function () {
                await truffleAssert.reverts(
                    core.addTask(Object.values(mockTask), { from: admin }),
                    null
                );
                await truffleAssert.reverts(
                    core.addTask(Object.values(mockTask), { from: mocks.user1 }),
                    null
                );
            });
            it('should revert if total amount is 0', async function () {
                const copy = deepClone(mockTask);
                copy.totalAmount = 0;
                copy.data = mockTask.data;
                await truffleAssert.reverts(
                    core.addTask(Object.values(copy), { from: partner1 }),
                    null
                );
            });
            it('should revert if reward is 0', async function () {
                const copy = deepClone(mockTask);
                copy.reward = 0;
                copy.data = mockTask.data;
                await truffleAssert.reverts(
                    core.addTask(Object.values(copy), { from: partner1 }),
                    null
                );
            });
            it('should revert if caption is empty', async function () {
                const copy = deepClone(mockTask);
                copy.caption = '';
                copy.data = mockTask.data;
                await truffleAssert.reverts(
                    core.addTask(Object.values(copy), { from: partner1 }),
                    null
                );
            });
        });

        describe('completeTask', function () {
            it('should complete task', async function () {
                await core.addTask(Object.values(mockTask), { from: partner1 });
                await core.acceptTask(1, { from: admin });
                await core.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });

                await core.completeTask(1, '0x1', { from: mocks.user1 });

                const data = await core.getItemResults(kinds.TASK, 1, mocks.user1);
                assert.equal(data, '0x01');
            });

            it('should revert if task is not found', async function () {
                await core.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });
                await truffleAssert.reverts(
                    core.completeTask(1, '0x1', { from: mocks.user1 }),
                    null
                );
            });
            it('should revert if not user', async function () {
                await truffleAssert.reverts(
                    core.completeTask(1, '0x1', { from: admin }),
                    null
                );
                await truffleAssert.reverts(
                    core.completeTask(1, '0x1', { from: partner1 }),
                    null
                );
            });
            it('should revert if task is not accepted', async function () {
                await core.addTask(Object.values(mockTask), { from: partner1 });
                await core.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });
                await truffleAssert.reverts(
                    core.completeTask(1, '0x1', { from: mocks.user1 }),
                    null
                );
            });
            it('should revert if task already completed by user', async function () {
                await core.addTask(Object.values(mockTask), { from: partner1 });
                await core.acceptTask(1, { from: admin });
                await core.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });
                await core.completeTask(1, '0x1', { from: mocks.user1 });
                await truffleAssert.reverts(
                    core.completeTask(1, '0x1', { from: mocks.user1 }),
                    null
                );
            });
        });

        describe('acceptTask', function () {
            it('should accept task', async function () {
                await core.addTask(Object.values(mockTask), { from: partner1 });
                await core.acceptTask(1, { from: admin });
                const { status } = await core.getKindItem(kinds.TASK, 1);
                assert.equal(solToNum(status), 1);
            });
            it('should revert if task already accepted', async function () {
                await core.addTask(Object.values(mockTask), { from: partner1 });
                await core.acceptTask(1, { from: admin });
                await truffleAssert.reverts(
                    core.acceptTask(1, { from : admin }),
                    null
                );
            });
            it('should revert if task does not exist', async function () {
                await truffleAssert.reverts(
                    core.acceptTask(55, {from: admin}),
                    null
                );
            });
            it('should revert if not admin', async function () {
                await truffleAssert.reverts(
                    core.acceptTask(55, {from: partner1}),
                    null
                );
                await truffleAssert.reverts(
                    core.acceptTask(55, {from: mocks.user1}),
                    null
                );
            });
        });
    });
});
