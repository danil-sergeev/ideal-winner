const web3 = require('web3');

const shouldThrow = async (fn) => {
    try {
        await fn;
        return true;
    } catch(err) {
        return false;
    }
};

const bytesDoSFactory = () => `0x${"f".repeat(100000)}`;

const solToNum = (v) => new web3.utils.BN(v).toNumber();

const deepClone = (v) => JSON.parse(JSON.stringify(v));

module.exports = { shouldThrow, bytesDoSFactory, solToNum, deepClone };
