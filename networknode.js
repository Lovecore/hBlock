const express = require('express')
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');  //create a node ID by removeing the -
const port = process.argv[2]; //reference our start command, last position of the argument
const rp = require('request-promise');
const app = express();


//create a chain
const pkizzle = new Blockchain(); 

//needed for req.box
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: false}));

//create api endpoints 
app.get('/blockchain', function(req, res) {
    res.send(pkizzle);
});

app.post('/transaction', function(req, res) {
    const newTransaction = req.body;
    const blockIndex = pkizzle.addTransactionToPendingTransaction(newTransaction);
    res.json({ note: `Transaction will be added in block ${blockIndex}.`});
});

app.post('/transaction/broadcast', function(req,res) {
    const newTransaction = pkizzle.createNewTransaction(req.body.mount, req.body.sender, req.body.recipient);

    //append to transactions
    pkizzle.addTransactionToPendingTransaction(newTransaction);

    const requestPromises = [];
    //braodcast to the other nodes
    pkizzle.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        //pass the array of requests created above
        requestPromises.push(rp(requestOptions));
    }); 
    
    Promise.all(requestPromises)
    .then(data => {
        res.json({ note: 'Transaction and broadcast successfully.'})
    });
});

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
    
    

    //create the block and respond
    const newBlock = pkizzle.createNewBlock(nonce, previousBlockHash, blockHash);
    const requestPromises = [];

    pkizzle.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/recieve-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        }

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data => {
        //create transaction reward
        //pkizzle.createNewTransaction(12.5, "00", nodeAddress); 
        const requestOptions = {
            uri: pkizzle.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: {
                amount: 12.5,
                sender: '00',
                recipient: nodeAddress
            },
            json: true
        }

        return rp(requestOptions);
    })
    .then(data => {
        res.json({
            note: "New block mined successfully",
            block: newBlock
        })
    });
});

//register a node and tell our peers
app.post('/register-and-broadcast-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;
    if (pkizzle.networkNodes.indexOf(newNodeUrl == -1)) pkizzle.networkNodes.push(newNodeUrl); //add the node to the network

    const registerNodesPromises = [];
    //register the node
    pkizzle.networkNodes.forEach(networkNodeUrl => {
        //create the request options
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        //append to node array
        registerNodesPromises.push(rp(requestOptions));
    });

    //tell promise to do work against the registered nodes
    Promise.all(registerNodesPromises)
    .then(data => {
        const bullkRegisterOptions = {
            uri: newNodeUrl + 'register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [ ...pkizzle.networkNodes, pkizzle.currentNodeUrl]},
            json: true
        };

        return rp(bullkRegisterOptions);
    })
    .then(data => {
        res.json({ note: 'New node registered successfully'});
    })
    //error catching cause promise isn't that great...
    .catch(err => {
        res.send(err);
    });
});

//register a node
app.post('/register-node', function(req, res){
    const newNodeUrl = req.body.newNodeUrl;

    //add some error handling
    const nodeNotAlreadyPresent = pkizzle.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = pkizzle.currentNodeUrl !== newNodeUrl;

    //register the node
    if (nodeNotAlreadyPresent && notCurrentNode) pkizzle.networkNodes.push(newNodeUrl);

    //acknowledge the registration
    res.json({ note: 'New node registered successfully with host node.'});
});

//register multiple nodes
app.post('/register-nodes-bulk', function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        //more error handling
        const nodeNotAlreadyPresent = pkizzle.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = pkizzle.currentNodeUrl !== networkNodeUrl;

        //register the network nodes
        if(nodeNotAlreadyPresent && notCurrentNode) pkizzle.networkNodes.push(networkNodeUrl);
    });

    //acknowledge the registration
    res.json({ note: 'Bulk registration successful'});
});

//create a random gen port for testing
app.listen(port, function() {
    console.log(`Listening on port ${port}...`); 
});