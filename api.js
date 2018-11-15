const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');  //create a node ID

//create a chain
const pkizzle = new Blockchain(); 

//needed for req.box
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: false}));

//create api endpoints 
app.get('/blockchain', function(req, res) {
    res.send(pkizzle);
})

app.post('/transaction', function(req, res) {
    const blockIndex = pkizzle.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({ note: `Transaction will be added in block ${blockIndex}.`});
})

app.get('/mine', function(req,res) {
    const lastBlock = pkizzle.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: pkizzle.pendingTransactions,
        index: lastBlock['index'] + 1,
        timestamp: Date.now()
    };

    const nonce = pkizzle.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = pkizzle.hashBlock(previousBlockHash, currentBlockData, nonce);
    
    //create transaction reward
    pkizzle.createNewTransaction(12.5, "00", nodeAddress); 

    //create the block and respond
    const newBlock = pkizzle.createNewBlock(nonce, previousBlockHash, blockHash);
    res.json({
        note: "New block mined successfully",
        block: newBlock
    });
});

 
app.listen(3000, function() {
    console.log('Listening on port 3000...'); //let me know the port is ready cause im dumb
})