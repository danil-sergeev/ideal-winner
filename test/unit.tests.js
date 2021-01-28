let PointX = artifacts.require('./PointX');
let TokenX = artifacts.require('./TokenX');
const E16 =  require('../utils/E16');
const { Mocks } = require('../utils/mocks');


/*contract('Point-X', accounts => {
	let pointX;
	let tokenX;
	let mocks = new Mocks(accounts);
	let partners = mocks.partners();
	let tasks = mocks.tasks();
	const { admin, partner1, partner2, partner3, user1, user2, user3, moderator } = mocks.roles();

	const name = "TokenX";
	const symbol = "PNTX";
	const decimals = 18;

	before(async () => {

	});

	beforeEach(async () => {
      tokenX = await TokenX.new(name, symbol, decimals);
      pointX = await PointX.new();
      await pointX.setToken(tokenX.address);

      await tokenX.addMinter(pointX.address);
      await tokenX.renounceMinter();


		await pointX.addPartner(
			partners[0].address,
			partners[0].name,
			partners[0].description,
			partners[0].logo,
			{ from: admin }
		)
	});

	describe('Unit tests', () => {
		it('Should publish a task with a type Questionnaire', async () => {

			await pointX.addBalance(
				partners[0].address,
				tasks[0].reward * tasks[0].totalAmount,
				{ from: admin }
			)

			await tokenX.approve(pointX.address, tasks[0].reward * tasks[0].totalAmount, {from: partner1})
			await pointX.publishTask(
				tasks[0].taskType,
				tasks[0].caption,
				tasks[0].description,
				tasks[0].reward,
				tasks[0].imageLink,
				tasks[0].totalAmount,
				E16.encodePack(E16.encodeArr(tasks[0].questions)),
				{ from: partner1 }
			)

			let task1 = await pointX.getTaskCardData(1)
			let task2 = await pointX.getTaskViewData(1)
		});

		it('Should publish a task with a type Common ranking', async () => {
			await pointX.addBalance(
				partners[0].address,
				tasks[1].reward * tasks[1].totalAmount,
				{ from: admin }
			)

			await tokenX.approve(pointX.address, tasks[1].reward * tasks[1].totalAmount, {from: partner1})
			await pointX.publishTask(
				tasks[1].taskType,
				tasks[1].caption,
				tasks[1].description,
				tasks[1].reward,
				tasks[1].imageLink,
				tasks[1].totalAmount,
				E16.encodePack(E16.encodeArr(tasks[1].questions)),
				{ from: partner1 }
			)

			let task1 = await pointX.getTaskCardData(1)
			let task2 = await pointX.getTaskViewData(1)
		});


		it('Should publish a task with a type Common ranking', async () => {
			await pointX.addBalance(
				partners[0].address,
				tasks[2].reward * tasks[2].totalAmount,
				{ from: admin }
			)

			await tokenX.approve(pointX.address, tasks[2].reward * tasks[2].totalAmount, {from: partner1})
			await pointX.publishTask(
				tasks[2].taskType,
				tasks[2].caption,
				tasks[2].description,
				tasks[2].reward,
				tasks[2].imageLink,
				tasks[2].totalAmount,
				E16.encodePack(E16.encodeArr(tasks[2].questions)),
				{ from: partner1 }
			)

			let task1 = await pointX.getTaskCardData(1)
			let task2 = await pointX.getTaskViewData(1)
		});
	});
});

*/