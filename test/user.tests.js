let PointX = artifacts.require('./PointX');
let TokenX = artifacts.require('./TokenX');
const { Mocks } = require('../utils/mocks');
const E16 = require('../utils/E16');
const Util = require('util');

const BN = web3.utils.BN;

contract('Point-X', async accounts => {
	let pointX, tokenX;
	let mocks = new Mocks(accounts);
	let partners = mocks.partners();
	let tasks = mocks.tasks();
	let rewards = mocks.rewards();
	let [mockUser] = mocks.users();
	let [mockAdmin, mockModerator] = mocks.admins();
	const { admin, partner1, partner2, partner3, user1, user2, user3, moderator } = mocks.roles();

	const name = "TokenX";
	const symbol = "PNTX";
	const decimals = 18;

	describe('Группа сценариев: юзер', () => {
		beforeEach(async () => {
			tokenX = await TokenX.new(name, symbol, decimals);
			pointX = await PointX.new();
			await pointX.setToken(tokenX.address);

			await tokenX.addMinter(pointX.address);
			await tokenX.renounceMinter();

			await pointX.addAdmin(...Object.values(mockModerator));
			await pointX.increaseContractEthBalance({from: admin, value:10**18});

/*    await pointX.addUserAndUnlockTasks(user1, { from: admin });
			await pointX.addUserAndUnlockTasks(user2, { from: admin });
			await pointX.addUserAndUnlockTasks(user3, { from: admin });

			await pointX.unlockRewardsForUser(user1, { from: admin });
			await pointX.unlockRewardsForUser(user2, { from: admin });
			await pointX.unlockRewardsForUser(user3, { from: admin });
*/
			// -------------------------- partner, balance
			await pointX.addPartner(
				partners[0].address,
				partners[0].name,
				partners[0].description,
				partners[0].logo,
			 { from: admin })

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

			await pointX.addTokenBalance(
				partner1,
				tasks[0].reward * tasks[0].totalAmount,
				{ from: admin }
			);

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
			{ from: partner1 })

			await pointX.acceptTask(1, {from: admin});
		});

		// TODO: before -> register partner, publish task
		it.only('Сценарий: первое знакомство, выполнение таска', async () => {
			/*
			без оптимизаций,
			без распараллеливания,
			без hash-ссылок на изображения,
			без gas station,
			TODO: откуда берется user1 – адрес с деньгами. Возможно, у нас уже заготовленные адреса с небольшим балансом.
			*/

			/*
			1. Я – юзер, увидел приложение Point-X в маркете и решил его установить.
			2. Открываю приложение, пропускаю интро.
			3. Как только я пропускаю интро, приложение создает мне приватный ключ user1 (или запрашивает его с сервера), после чего запрашивает количество тасков.
			*/

			let tasksCount = await pointX.getTasksCount({ from: user1 });

			/*
			4. Далее приложение запрашивает информацию по каждому таску. Карточка таска содержит в себе:
				1. Заголовок
				2. Размер награды
				3. Изображение
				4. Имя партнера
				5. Лого партнера
				6. Дата начала
				7. Дата завершения
				8. Количество оставшихся наград
				9. Общее количество наград
				10. Вопросы или текст задания
				11. Описание партнера
			*/

			let taskList = [];
			for (let taskNum = 1; taskNum <= tasksCount; taskNum++) {
				let taskData = await pointX.getTask(taskNum, { from: user1 });
				taskList.push(taskData);
			};

			console.log('tasks:', taskList)

			/*
			5. Все таски получены. Приложение рендерит эти таски. Я вижу список из нескольких десятков тасков.
			TODO: Я получаю только актуальные таски, завершенные мне не приходят.
			Мне понравился один из тасков, я его открываю.
				Элементы интерфейса:
					1. Форма/поля ввода
					2. Кнопка Отправить, пока заблокирована


			 Я заполняю данные формы, отвечаю на вопросы. Кнопка Отправить разблокировалась. Я ее нажимаю.
			 Транзакция сохраняется, но не отправляется. Я не подтвердил номер телефона, и меня просят его ввести.
			 Я ввожу номер телефона и нажимаю подтвердить. В это время приложение отправляет боту номер телефона.
			*/

			/*
			Bot – это такой сервер, на который мы будем вешать разные функции.
			Вероятно, изображения по хешу тоже он будет отдавать.

			NON-BLOCKCHAIN
			client:     moderator.checkNumber(userAddress, userNumber)
			moderator:        apiCode = api.getCodeForNumber(userNUmber)
			client:     moderator.receivedCode(userAddress, userCode)

			BLOCKCHAIN
			moderator:        if (apiCode == userCode) await pointX.verifyUserByNumber(userAddress)
			*/

			/*
			7. Если коды совпадают, то бот верифицирует юзера по номеру.
			Note: А после KYC будет await pointX.unlockRewardsForUser(user1, { from: moderator });
			Функция addUserAndUnlockTasks начисляет небольшое количество денег на счет юзера, чтобы хватило на несколько транзакций (несколько десятков центов)
			*/
			let balanceBefore = await web3.eth.getBalance(user1)
			await pointX.addUserAndUnlockTasks(...Object.values(mockUser), { from: moderator });

			/*
			8. Бот сообщает приложению, что номер одобрен, либо сообщает об ошибке.
			Приложение каждые несколько секунд проверяет, когда профиль будет верифицирован в блокчейне:
			*/

			let user = await pointX.getUserByAddress(user1, { from: user1 });

			console.log('user:', user)

		/*  const LOCKED = 0;
			const TASKS_UNLOCKED = 1;
			const TASKS_AND_REWARDS_UNLOCKED = 2;

			// проверяем, что разблокирован
			assert.equal(status, TASKS_UNLOCKED);*/

			let COMPENSATION_AMOUNT = 10**15;
			let balance = await web3.eth.getBalance(user1)

			// проверяем, что деньги на счету есть
			let balanceDiff = new BN(balance).sub(new BN(balanceBefore)).toString();
			let compensation = new BN(COMPENSATION_AMOUNT).toString();
			assert.equal(balanceDiff, compensation);

			/*
			9. Как только статус подтвержден и баланс пополнен, приложение отправляет транзакцию с заданием.
			*/

			// let isUser = await pointX.
			let answers = Buffer.from([0, 3, 5, 5, 1]); // варианты ответа конвертируем в массив байтов.
			let taskNum = 1;
			await pointX.completeTask(taskNum, answers, { from: user1 })

			/*
			10. Приложение просит меня поделиться заданием в соц. сетях.
			Я выбираю Facebook, подтверждаю. Экран "Задание пройдено".
			11. Проверяю, что мой баланс увеличился на сумму награды:
			*/

			let bal = await pointX.getTokenBalance(user1, { from: user1});
			assert.equal(new BN(bal).toNumber(), tasks[0].reward);
		});


		it('Сценарий: второе использование, получение награды', async () => {
			// TODO: before -> register partner, publish task, verifyUser, add balance
			/*
			1. Я – юзер, у меня есть 1 токен, который я хочу максимально полезно потратить.
			2. Я нажимаю на таб Rewards, приложение запрашивает количество Rewards:
			*/
			await pointX.addTokenBalance(user1, rewards[0].price, {from: admin});

			let rewardsCount = await pointX.getRewardsCount({ from: user1 });

			/*
			4. Далее приложение запрашивает информацию по каждому реварду. Карточка реварда содержит в себе:
				1. Заголовок
				2. Стоимость
				3. Изображение
				4. Имя партнера
				5. Лого партнера
				6. Дата начала
				7. Дата завершения
			*/

			let rewardList = [];
			for (let rewardNum = 0; rewardNum < rewardsCount; rewardNum++) {
				let rewardData = await pointX.getReward(rewardNum, { from: user1 });
				rewardList.push(rewardData);
			};

			/*
			5. Все реварды получены. Приложение рендерит карточки ревардов. Я вижу список из нескольких десятков ревардов.
			TODO: Я получаю только актуальные реварды, завершенные мне не приходят.
			Мне понравился один из ревардов, я его открываю. Ревардвью (Rewardview), помимо информации с карточки, так же содержит:
				Из контракта:
					1. Количество оставшихся наград
					2. Общее количество наград
					3. Описание партнера

				Элементы интерфейса:
					2. Кнопка Получить
			Приложение запрашивает недостающие данные из блокчейна:

			6. Я нажимаю получить. Так как я еще не прошел KYC, мне открывается экран – пройдите KYC. Я нажимаю Продолжить.

			NON-BLOCKCHAIN
			client -> moderator: startKYC(userAddress)
			moderator -> client: access_token
			client: init(access_token)
			client: all KYC steps, send to KYC-provider
			KYC-provider(webHook) -> moderator: OK
			*/

			/*
			7. Если KYC провайдер присылает статус, что всё ОК, то бот разблокирует реварды для юзера:
			*/
			await pointX.addUserAndUnlockTasks(...Object.values(mockUser), { from: moderator });
			await pointX.unlockRewardsForUser(user1, { from: moderator });

			/*
			8. Бот сообщает приложению, что KYC пройдено, либо сообщает об ошибке.
			Приложение каждые несколько секунд проверяет, когда профиль будет верифицирован в блокчейне:
			*/

			let user = await pointX.getUserByAddress(user1, { from: user1 });

		 /* const LOCKED = 0;
			const TASKS_UNLOCKED = 1;
			const TASKS_AND_REWARDS_UNLOCKED = 2;

			// проверяем, что разблокирован
			assert.isTrue(status == TASKS_AND_REWARDS_UNLOCKED);*/

			/*
			9. Как только статус подтвержден, приложение отправляет транзакцию на получение награды.
			Заранее сохраняем текущий баланс:
			*/

			let balanceBefore = await pointX.getTokenBalance(user1, { from: user1});
			let rewardNum = 1;

			await tokenX.approve(pointX.address, rewards[0].price, {from: user1})
			await pointX.completeReward(rewardNum, { from: user1 })

			/*
			10. Проверяем, что баланс уменьшился.
			*/

			const rewardPrice = rewards[0].price;

			let balanceAfter = await pointX.getTokenBalance(user1, { from: user1});
			let balanceDiff = +(new BN(balanceBefore).sub(new BN(balanceAfter)).toString());

			console.log('balance before:', BN(balanceBefore).toString())
			console.log('balance after:', BN(balanceAfter).toString())
			assert.equal(rewardPrice, balanceDiff);

			/*
			11. Юзер на сайте партнера может верефицировать себя через подписание транзакции, или еще как-то
			*/
		});
	});
});
