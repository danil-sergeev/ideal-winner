const RolesLibTest = artifacts.require("RolesLibTest")
    , truffleAssert = require('truffle-assertions')
    , { shouldThrow, solToNum, bytesDoSFactory} = require('../utils');

// Traditional Truffle test
contract("RolesLibTest", accounts => {

    let roles;
    let [acc] = accounts;
    const TEST_ROLE = 'test-role'
        , TEST_NAME = 'Test name'
        , TEST_DESC = 'Test description'
        , TEST_LOGO = 'TEST_logo.png'
        , zeroAddress = '0x0000000000000000000000000000000000000000';

    beforeEach(async () => {
        roles = await RolesLibTest.new();
    });

    describe('Unit tests', function () {
        describe('addRole', function () {
            it('should overflow after 255 roles', async function () {
                for (let i = 0; i < 255; i++ ) {
                    await roles.addRole(`test${i}`);
                }
                await roles.addRole('error');
                const res = await roles.checkStoreRoleNames(0);
                assert.equal(res, 'error');
                assert.notEqual(res, 'test0');
            });

            it('should add role', async function () {
                await roles.addRole(TEST_ROLE);
                const count = await roles.getStoreCount();
                const role = await roles.checkStoreRoleNames(1);
                assert.equal(count, 1);
                assert.equal(role, TEST_ROLE);
            });
            it('should revert if adding existing role', async function () {
                await roles.addRole(TEST_ROLE);
                const count = await roles.getStoreCount();
                const role = await roles.checkStoreRoleNames(1);
                assert.equal(count, 1);
                assert.equal(role, TEST_ROLE);

                await truffleAssert.reverts(
                    roles.addRole(TEST_ROLE),
                    null
                );
            });
            it('should revert if adding empty string', async function () {
                await truffleAssert.reverts(
                    roles.addRole(''),
                    null
                )
            });
        });

        describe('addSubject', function () {
            it('should add subject', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                const count = await roles.getRoleCount(TEST_ROLE);

                const id = await roles.getRoleAccToNum(TEST_ROLE, acc);
                const _acc = await roles.getRoleNumToAcc(TEST_ROLE, count);
                const subject = await roles.getRoleSubjects(TEST_ROLE, acc);

                assert.equal(count, 1);
                assert.equal(solToNum(id), solToNum(count));
                assert.equal(_acc, acc);
                assert.equal(subject.accessLevel, 1);
                assert.equal(subject.name, TEST_NAME);
                assert.equal(subject.description, TEST_DESC);
                assert.equal(subject.logo, TEST_LOGO);
            });

            it('should revert add subject to not existing role', async function () {
                await truffleAssert.reverts(
                    roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO) // TEST_ROLE hasn't been added
                );
            });

            it('should revert zero address', async function () {
                await roles.addRole(TEST_ROLE);
                await truffleAssert.reverts(
                    roles.addSubject(TEST_ROLE, zeroAddress, 1, TEST_NAME, TEST_DESC, TEST_LOGO)
                )
            });

            it('should revert add subject if such subject already exists', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                const count = await roles.getRoleCount(TEST_ROLE);

                const id = await roles.getRoleAccToNum(TEST_ROLE, acc);
                const _acc = await roles.getRoleNumToAcc(TEST_ROLE, count);
                const subject = await roles.getRoleSubjects(TEST_ROLE, acc);
                assert.equal(count, 1);
                assert.equal(solToNum(id), solToNum(count));
                assert.equal(_acc, acc);
                assert.equal(subject.accessLevel, 1);
                assert.equal(subject.name, TEST_NAME);
                assert.equal(subject.description, TEST_DESC);
                assert.equal(subject.logo, TEST_LOGO);

                await truffleAssert.reverts(
                    roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO)
                );
            });
        });

        describe('removeSubject', function () {
            it('should remove subject', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await roles.removeSubject(TEST_ROLE, acc);

                const count = await roles.getRoleCount(TEST_ROLE);

                assert.equal(count, 0);
            });
            it('should revert removing not existing subject', async function () {
                await roles.addRole(TEST_ROLE);
                await truffleAssert.reverts(
                    roles.removeSubject(TEST_ROLE, accounts[3]) // random account
                );
            });
            it('should revert zero address', async function () {
                await roles.addRole(TEST_ROLE);
                await truffleAssert.reverts(
                    roles.removeSubject(TEST_ROLE, zeroAddress) // random account
                );
            });
        });

        describe('updateAccessLevel', function () {
            it('should update access level', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                let subj = await roles.getRoleSubjects(TEST_ROLE, acc);
                assert.equal(subj.accessLevel, 1);

                await roles.updateAccessLevel(TEST_ROLE, acc, 2);

                subj = await roles.getRoleSubjects(TEST_ROLE, acc);
                assert.equal(subj.accessLevel, 2);
            });
            it('should revert if not existing role', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                await truffleAssert.reverts(
                    roles.updateAccessLevel('ANOTHER_TEST_ROLE', acc, 2)
                )
            });
            it('should revert if not existing account', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                await truffleAssert.reverts(
                    roles.updateAccessLevel(TEST_ROLE, accounts[5], 2)
                );
            });
            it('should revert if user already have this status', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                await truffleAssert.reverts(
                    roles.updateAccessLevel(TEST_ROLE, acc, 1)
                );
            });
            it('should revert if zero address', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                await truffleAssert.reverts(
                    roles.updateAccessLevel(TEST_ROLE, zeroAddress, 1)
                );
            });
        });

        describe('setLogo', function () {
            it('should set logo', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await roles.setLogo(TEST_ROLE, acc, "ANOTHER_LOGO");
                let subj = await roles.getRoleSubjects(TEST_ROLE, acc);
                assert.equal(subj.logo, "ANOTHER_LOGO");
            });
            it('should revert if logo is empty string', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await truffleAssert.reverts(
                    roles.setLogo(TEST_ROLE, acc, "")
                );
            });
            it('should revert zero address', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await truffleAssert.reverts(
                    roles.setLogo(TEST_ROLE, zeroAddress, "ANOTHER_LOGO")
                );
            });
            it('should revert not existing role', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                await truffleAssert.reverts(
                    roles.setLogo('ANOTHER_TEST_ROLE', acc, "ANOTHER_LOGO")
                );
            });
            it('should revert not existing subject', async function () {
                await roles.addRole(TEST_ROLE);
                await truffleAssert.reverts(
                    roles.setLogo(TEST_ROLE, acc, TEST_LOGO)
                );
            });
        });

        describe('setName', function () {
            it('should set name', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await roles.setName(TEST_ROLE, acc, "ANOTHER_NAME");
                let subj = await roles.getRoleSubjects(TEST_ROLE, acc);
                assert.equal(subj.name, "ANOTHER_NAME");
            });
            it('should revert if name is empty string', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await truffleAssert.reverts(
                    roles.setName(TEST_ROLE, acc, "")
                );
            });
            it('should revert zero address', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await truffleAssert.reverts(
                    roles.setName(TEST_ROLE, zeroAddress, "ANOTHER_NAME")
                );
            });
            it('should revert not existing role', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                await truffleAssert.reverts(
                    roles.setName('ANOTHER_TEST_ROLE', acc, "ANOTHER_NAME")
                );
            });
            it('should revert not existing subject', async function () {
                await roles.addRole(TEST_ROLE);
                await truffleAssert.reverts(
                    roles.setName(TEST_ROLE, acc, TEST_NAME)
                );
            });
        });

        describe('setDescription', function () {
            it('should set description', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await roles.setDescription(TEST_ROLE, acc, "ANOTHER_DESC");
                let subj = await roles.getRoleSubjects(TEST_ROLE, acc);
                assert.equal(subj.description, "ANOTHER_DESC");
            });
            it('should revert if description is empty string', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await truffleAssert.reverts(
                    roles.setDescription(TEST_ROLE, acc, "")
                );
            });
            it('should revert zero address', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);

                await truffleAssert.reverts(
                    roles.setDescription(TEST_ROLE, zeroAddress, "ANOTHER_DESC")
                );
            });
            it('should revert not existing role', async function () {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                await truffleAssert.reverts(
                    roles.setDescription('ANOTHER_TEST_ROLE', acc, "ANOTHER_DESC")
                );
            });
            it('should revert not existing subject', async function () {
                await roles.addRole(TEST_ROLE);
                await truffleAssert.reverts(
                    roles.setDescription(TEST_ROLE, acc, TEST_DESC)
                );
            });
        });

        describe('haveRoleAndAccess', () => {
            it('should return true if have access', async () => {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                const res = await roles.haveRoleAndAccess(TEST_ROLE, acc, 1);
                assert.equal(res, true);
            });

            it('should return false if required access level is not suitable', async () => {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                const res = await roles.haveRoleAndAccess(TEST_ROLE, acc, 2);
                assert.equal(res, false);
            });

            it('should return false if no subject', async () => {
                await roles.addRole(TEST_ROLE);
                const res = await roles.haveRoleAndAccess(TEST_ROLE, acc, 1);
                assert.equal(res, false);
            });
        });

        describe('exist', () => {
            it('should revert exist with zero address', async () => {
                await truffleAssert.reverts(
                    roles.exist(TEST_ROLE, zeroAddress)
                );
            });

            it('should return true if subject exist', async () => {
                await roles.addRole(TEST_ROLE);
                await roles.addSubject(TEST_ROLE, acc, 1, TEST_NAME, TEST_DESC, TEST_LOGO);
                const res = await roles.exist(TEST_ROLE, acc);
                expect(res, true);
            });

            it('should return false if subject does not exist', async () => {
                await roles.addRole(TEST_ROLE);
                const res = await roles.exist(TEST_ROLE, acc);
                expect(res, false);
            });
        });
    });

});
