

//create the function
function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];
}

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

//Export the module 
module.exports = Blockchain;