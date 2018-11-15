const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const previousBlockHash = ' kfjlksdjfa834hn2nd';
const currentBlockData = [
    {
        amount: 10,
        sender: 'MICHELLE342432423',
        recipient: 'NICK8937429834hfh2'
    },
    {
        amount: 30,
        sender: 'TOM83hnf892n9d2edw',
        recipient: 'MIKEfsd324fsdfsdf323'
    },
    {
        amount: 66,
        sender: 'ROYndjsncjkdnfksjdyf7893',
        recipient: 'sdfsdsdfse232d2d'
    }
];

console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, 150884));















bitcoin.hashBlock();



console.log(bitcoin);