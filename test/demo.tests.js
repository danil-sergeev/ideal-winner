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
	let [mockUser] = mocks.users();
	const { admin, partner1, partner2, partner3, user1, user2, user3, moderator } = mocks.roles();

	const name = "TokenX";
	const symbol = "PNTX";
	const decimals = 18;

	describe('All basic scenarios', () => {
		it('Main flow', async () => {


			// ------------------------------ PART I: SETUP
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


			// ------------------------------ PART II: TASK
			// 8. Admin adds a partner
			await pointX.addPartner(
				partners[0].address,
				partners[0].name,
				partners[0].description,
				partners[0].logo,
			{ from: admin })

			// 9. Partner wants to publish a task: 50 rewards for €10 each. Partner sends €50*10 (offchain) to the PointX.
			//    Then PointX mint tokens for the partner.
			await pointX.addTokenBalance(
				partner1,
				tasks[0].reward * tasks[0].totalAmount,
				{ from: admin }
			);

			// 10. Partner should approve tokens before adding a task
			await tokenX.approve(pointX.address, tasks[0].reward * tasks[0].totalAmount, {from: partner1})

			// 11. Pack questions to reduce size
			let taskPack =  Buffer.concat([
				Buffer.from([3, 3]),
				E16.encodePack(E16.encodeArr(tasks[0].questions))
			]);

			// 12. Add task to the PointX contract
			//     Tokens will be transfered from partner to the PointX contract
			await pointX.addTask(
				tasks[0].caption,
				tasks[0].description,
				tasks[0].taskType,
				taskPack,
				tasks[0].reward,
				tasks[0].totalAmount,
				tasks[0].category,
			{ from: partner1 });

			// 13. Admin should accept task before users can complete it
			await pointX.acceptTask(1, {from: admin});


			// 14. Admin should add user and unlock tasks for him
			await pointX.addUserAndUnlockTasks(...Object.values(mockUser), { from: admin });

			// 15. User's answers for task's questions
			let answers1 = Buffer.from([1, 2, 1])

			// 16. User sends answers and receive reward: tasks[0].reward == €10
			//     Tokens will be transfered from PointX contract to the user
			await pointX.completeTask(1, answers1, {from: user1})


			// ------------------------------ PART III: REWARD

			// 17. Partner adds reward. Tokens will be transfered from partner to PointX contract
			await pointX.addReward(
				rewards[0].caption,
				rewards[0].description,
				rewards[0].imageLink,
				rewards[0].price,
				rewards[0].totalAmount,
				rewards[0].category,
			 { from: partner1 });

			// 18. Admin should accept it
			await pointX.acceptReward(1, {from: admin});

			// 19. User should get a permission to receive rewards
			await pointX.unlockRewardsForUser(user1, { from: moderator });

			// 20. User should approve tokens (reward price)
			await tokenX.approve(pointX.address, rewards[0].price, {from: user1})

			// 21. And receive reward. Tokens will be burned
			await pointX.completeReward(1, {from: user1})
		});
	});
});
