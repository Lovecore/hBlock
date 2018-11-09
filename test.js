const Blockchain = require('./blockchian');

const bitcoin = new Blockchain();

bitcoin.createNewBlock(22, 'sdhfsdjkhf3823hf', 'fj132jfask93f');
bitcoin.createNewTransaction(100, 'jen63fy3hfh3', 'pete634g34g35y7');
bitcoin.createNewBlock(3422423, 'dfh38rhdh92d', '138y9hf929df2');

console.log(bitcoin);