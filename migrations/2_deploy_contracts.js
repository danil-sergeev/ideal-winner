const PointX = artifacts.require("PointX");

const RolesLib = artifacts.require("RolesLib");
const ItemsLib = artifacts.require("ItemsLib");
const Core = artifacts.require("Core");
const Getters = artifacts.require("Getters");
const ItemsLibTest = artifacts.require("ItemsLibTest");
const TokenX = artifacts.require("TokenX");
const RolesLibTest = artifacts.require("RolesLibTest");
const CoreTest = artifacts.require("CoreTest");

const name = "TokenX";
const symbol = "PNTX";
const decimals = 18;


module.exports = (deployer) => {
	deployer.then(async () => {
		let rolesLib = await deployer.deploy(RolesLib);
		await deployer.link(RolesLib, Core);

		await deployer.link(RolesLib, RolesLibTest);

		let itemsLib = await deployer.deploy(ItemsLib);
		await deployer.link(ItemsLib, Core);

		let core = await deployer.deploy(Core);
		await deployer.link(Core, PointX);
		await deployer.link(Core, Getters);

		/** @test */
		await deployer.link(Core, CoreTest);
		await deployer.link(RolesLib, CoreTest);
		await deployer.link(ItemsLib, CoreTest);
		await deployer.deploy(CoreTest);
        await deployer.deploy(ItemsLibTest);
        await deployer.deploy(RolesLibTest);

		let getters = await deployer.deploy(Getters);
		await deployer.link(Getters, PointX);

		let px = await deployer.deploy(PointX);
		let tx = await deployer.deploy(TokenX, name, symbol, decimals);
		await px.setToken(TokenX.address);
		await tx.addMinter(PointX.address);
		await tx.renounceMinter();
	});
};
