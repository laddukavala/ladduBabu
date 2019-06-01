const express = require('express');
const app = express();
const fs = require('fs');
var Web3 = require('web3');
const axios = require('axios');

var web3 = new Web3();
var precision = 1000000000000000000;

var router = express.Router();
const pool = require('../db/database');

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


var abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "mintingFinished",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "MAX_UINT256",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "initialSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseApproval",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "finishMinting",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            },
            {
                "name": "_data",
                "type": "bytes"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            },
            {
                "name": "_data",
                "type": "bytes"
            }
        ],
        "name": "tokenFallback",
        "outputs": [],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseApproval",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "remaining",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            },
            {
                "name": "_data",
                "type": "bytes"
            },
            {
                "name": "_custom_fallback",
                "type": "string"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Mint",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "MintFinished",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "burner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Burn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
]
// contract Address

const contractAddress = "0x6020b82310Ad0cA623beaCa16C3C7014e5038F44";

const contractInstance = web3.eth.contract(abi).at(contractAddress);


// Rest API for getting Balance
router.post('/api/getBalance', (request, response) => {
    const account = request.body.ether_address;

    contractInstance.balanceOf(account, function (err, res) {
        response.json({"balance": res.toString(10) / 100000000});
    });

});

//RESTApi to get ether to doller from coinmarket
router.get('/api/getEtherPrice', (request, response) => {
    axios.get('https://api.coinmarketcap.com/v2/ticker/1027/?convert=USD')
            .then((res) => {
                console.log("Response data:", res.data.data.quotes.USD.price);
                response.json({
                    USD_PRICE: res.data.data.quotes.USD.price
                })
            })
            .catch(reason => {
                response.json({
                    USD_PRICE: 0
                })
            })
});

// Rest API for Transfer from Owner Account to Other Account

router.post('/api/transferTo', (request, response) => {

    const from_account = request.body.from;
    const to_account = request.body.to;
    const value = request.body.value;

    web3.personal.unlockAccount(from_account, request.body.password);

    contractInstance.transfer(to_account, value, {from: from_account, gas: 95000}, function (err, res) {
        response.json({"txn": res});
    });

})

// Rest API for Approve

router.post('/api/approve', (request, response) => {
    const from_account = request.body.from;
    const spender = request.body.spender;
    const value = request.body.value;

    web3.personal.unlockAccount(from_account, request.body.password);

    contractInstance.approve(spender, value, {from: from_account, gas: 95000}, function (err, res) {
        response.json({"txn": res});
    });
});

// Rest API for transfer From

router.post('/api/transferFrom', (request, response) => {

    const from_account = request.body.from;
    const to_account = request.body.to;
    const value = request.body.value;
    const owner_account = request.body.account;

    web3.personal.unlockAccount(owner_account, request.body.password);

    contractInstance.transferFrom(from_account, to_account, value, {from: owner_account, gas: 95000}, function (err, res) {
        response.json({"txn": res});
    });
});

// Rest API for increaseApproval

router.post('/api/increaseApproval', (request, response) => {
    const from_account = request.body.from;
    const spender = request.body.spender;
    const value = request.body.value;

    web3.personal.unlockAccount(from_account, request.body.password);

    contractInstance.increaseApproval(spender, value, {from: from_account, gas: 95000}, function (err, res) {
        response.json({"txn": res});
    });
});

// Rest API for decreaseApproval

router.post('/api/decreaseApproval', (request, response) => {
    const from_account = request.body.from;
    const spender = request.body.spender;
    const value = request.body.value;

    web3.personal.unlockAccount(from_account, request.body.password);

    contractInstance.decreaseApproval(spender, value, {from: from_account, gas: 95000}, function (err, res) {
        response.json({"txn": res});
    });
});

router.post('/api/createEtherAccount', (request, response) => {

    const account = web3.personal.newAccount(request.body.password);

    response.json(account);

});

router.post('/api/getEtherBalance', (request, response) => {
    console.log("test");
    var address = request.body.ether_address;
    var balance = web3.eth.getBalance(address);
    //console.log(balance);
    response.json({"balance": balance / precision});
});

router.post('/api/historyTransaction', (request, response) => {
    console.log("test");
    var history = web3.eth.getTransactionCount(address);
    var transactioncount = web3.eth.getTransactionsByAccount(address);
    console.log(history);
    response.json({"history": history, "transactioncount": transactioncount});
});

//rest API for ether transfer
router.post('/api/sendTransaction', (request, response) => {
    var to = request.body.to;
    var from = request.body.from;
    var value = request.body.value;
    var password = request.body.password;
    web3.personal.unlockAccount(from, password, function (err, data) {
        if (err != null) {
            console.log(err);
        }
        web3.eth.sendTransaction({
            from: from,
            to: to,
            value: value,
        }, function (err, resp) {
            if (err != null) {
                console.log(err);
            }
            response.json({"response": resp});
        });
    });
});

// Rest API for Ether Transfer
router.post('/api/sendEtherTransaction', (request, response) => {
    const from_account = request.body.from;
    const to_account = request.body.to;
    const valueInEther = request.body.value;
    const pass = request.body.pass;
    const value = web3.toWei(valueInEther, 'ether');
    web3.personal.unlockAccount(from_account, pass);
    web3.eth.sendTransaction({from: from_account, to: to_account, value: value, gas: 30000}, function (err, res) {
        if (err) {
            response.json({txnHash: null});
        } else {
            response.json({txnHash: res});
        }
    });

});

// Rest API for Getting Reciept
router.post('/api/getRecieptFromTransaction', (request, response) => {
    const txnHash = request.body.txnHash;

    var receipt = web3.eth.getTransactionReceipt(txnHash);
    if (!receipt) {
        response.json({receipt: null});
    } else {
        response.json({receipt: receipt});
    }
});

router.post('/api/getRecieptFromTransaction', (request, response) => {
    const txnHash = request.body.txnHash;

    var receipt = web3.eth.getTransactionReceipt(txnHash);
    if (!receipt) {
        response.json({receipt: null});
    } else {
        response.json({receipt: receipt});
    }
});

router.post('/api/getTransactionStatus', (request, response) => {
    const txnHash = request.body.txnHash;

    var receipt = web3.eth.getTransaction(txnHash);
    if (!receipt) {
        response.json({receipt: null});
    } else {
        response.json({receipt: receipt});
    }
});


router.post('/api/importFile', (request, response) => {
    const prik = request.body.prik;
    const pass = request.body.pass;
    //if (typeof web3.eth.accounts === 'undefined'){
    var v = web3.personal.importRawKey(prik, pass);
    response.json(v);
    //}else{
    response.json("account already exist");
    //	}
});


router.get('/api/getTotalEth', (req, res)=>{
    var totalETH = 0;
    pool.getConnection(function(err, connection) {
        if(err) {
            return res.json({
                result: false,
                error: err
            })
        }
        connection.query("select address from address where coin_type=?",['e'], (err, result)=>{
            if(err){
                return res.json({
                    result: false,
                    error: err
                })
            }

            for (i=0; i< result.length; i++) {
                const value = parseFloat(web3.fromWei(web3.eth.getBalance(result[i].address), 'ether'));
                totalETH += value;
            }
          
            console.log("================================")
            res.json({
                result:true,
                addresses: result,
                totalETH: totalETH
            })
        })
    })
});


module.exports = router;