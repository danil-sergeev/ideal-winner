let PointX = artifacts.require('./PointX');
let TokenX = artifacts.require('./TokenX');
const { Mocks } = require('../utils/mocks');
const E16 = require('../utils/E16');


contract('Point-X', accounts => {
	let pointX;
	let tokenX;
	let mocks = new Mocks(accounts);
	let partners = mocks.partners();
	let tasks = mocks.tasks();
	let rewards = mocks.rewards();
	let [mockAdmin, mockModerator] = mocks.admins();
	let [mockUser, mockUser2, mockUser3] = mocks.users();
	const { admin, partner1, partner2, partner3, user1, user2, user3, moderator } = mocks.roles();

	const name = "TokenX";
	const symbol = "PNTX";
	const decimals = 18;

	describe('Scenario: registration of a partner and publication of a task. ', () => {
		before(async () => {

			// 1. Deploy token
			tokenX = await TokenX.new(name, symbol, decimals);

			// 2. Deploy main contract
			pointX = await PointX.new();

			// 3. Connect token to the main contract
			await pointX.setToken(tokenX.address);

			// 4. Give permission for PointX contract to mint tokens
			await tokenX.addMinter(pointX.address);

			// 5. Deprive of the right to mint from admin
			await tokenX.renounceMinter({from: admin});

			// 6. Add moderator
			await pointX.addAdmin(...Object.values(mockModerator));

			// 7. Increase contract balance. Contract need to have a positive balance to send small
			//    amount of eth for users to compensate gas spends.
			await pointX.increaseContractEthBalance({from: admin, value:10**18});


			// 8. Admin adds a partner
			await pointX.addPartner(
				partners[0].address,
				partners[0].name,
				partners[0].description,
				partners[0].logo,
			{ from: admin })
		});

		it('Main flow', async () => {
			// 9. Partner wants to publish a task: 50 rewards for €10 each. Partner sends €50*10 (offchain) to the PointX.
			//    Then PointX mint tokens for the partner.
			await pointX.addTokenBalance(
				partner1,
				tasks[0].reward * tasks[0].totalAmount,
				{ from: admin }
			);

			// 10.
			await tokenX.approve(pointX.address, tasks[0].reward * tasks[0].totalAmount, {from: partner1})

			let taskPack =  Buffer.concat([
				Buffer.from([3, 3]),
				E16.encodePack(E16.encodeArr(tasks[0].questions))
			]);

			await pointX.addTask(
				tasks[0].caption,
				tasks[0].description,
				tasks[0].taskType,
				taskPack,
				tasks[0].reward,
				tasks[0].totalAmount,
				tasks[0].category,
			{ from: partner1 });

			await pointX.acceptTask(1, {from: admin});

			await pointX.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });

			let answers1 = Buffer.from([1, 2, 1])

			await pointX.completeTask(1, answers1, {from: user1})
		});
	});

	describe('Сценарий: второе использование, размещение реварда', () => {
		before(async () => {
			tokenX = await TokenX.new(name, symbol, decimals);
			pointX = await PointX.new();
			await pointX.setToken(tokenX.address);

			await tokenX.addMinter(pointX.address);
			await tokenX.renounceMinter();

			await pointX.addAdmin(...Object.values(mockModerator));
			await pointX.increaseContractEthBalance({from: admin, value:10**18});

			await pointX.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });
			await pointX.addUserAndUnlockTasks(...Object.values(mockUser2), { from: admin });
			await pointX.addUserAndUnlockTasks(...Object.values(mockUser3), { from: admin });

			await pointX.unlockRewardsForUser(user1, { from: admin });
			await pointX.unlockRewardsForUser(user2, { from: admin });
			await pointX.unlockRewardsForUser(user3, { from: admin });


			// -------------------------- partner, balance
			await pointX.addPartner(
				partners[0].address,
				partners[0].name,
				partners[0].description,
				partners[0].logo,
			 { from: admin })
		});


		it('Main flow', async () => {
			await pointX.addTokenBalance(
				partner1,
				rewards[0].price *rewards[0].totalAmount,
				{ from: admin }
			);

			await tokenX.approve(pointX.address, rewards[0].price * rewards[0].totalAmount, {from: partner1})

			await pointX.addReward(
				rewards[0].caption,
				rewards[0].description,
				rewards[0].imageLink,
				rewards[0].price,
				rewards[0].totalAmount,
				rewards[0].category,
			 { from: partner1 })

			await pointX.acceptReward(1, {from: admin});

			await pointX.addTokenBalance(user1, rewards[0].price);
			await pointX.addTokenBalance(user2, rewards[0].price);
			await pointX.addTokenBalance(user3, rewards[0].price);

			await tokenX.approve(pointX.address, rewards[0].price, {from: user1})
			await tokenX.approve(pointX.address, rewards[0].price, {from: user2})
			await tokenX.approve(pointX.address, rewards[0].price, {from: user3})

			await pointX.completeReward(1, {from: user1})
			await pointX.completeReward(1, {from: user2})
			await pointX.completeReward(1, {from: user3})
		});
	});


		/*
			it('Сценарий: получение результатов тасков', async () => {});
			it('Сценарий: получение данных по таску', async () => {});
			it('Сценарий: получение данных по реварду', async () => {});
		*/
});

