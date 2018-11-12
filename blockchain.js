const sha256 = require('sha256');

//create the function
function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];

    //lets create a genesis block with random data
    this.createNewBlock(100, '0', '0');
};

//Blockchian datastructure
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,  
        previousBlockHash: previousBlockHash
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
}

//Get the last block function
Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length -1];
}

//Create a new transaction
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient
    };

    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()['index'] + 1;
} 

//Hash the block
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);

    return hash;
}

//proof of work, with 4 0 base
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while (hash.substring(0,  4) !== '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

        //we can view the hashes to ensure its working if we want...
        //commented out for sanity.... console.log(hash);
    }

    return nonce;
}
//Export the module 
module.exports = Blockchain;