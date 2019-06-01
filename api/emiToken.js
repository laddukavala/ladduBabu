const express = require('express');
var Tx = require('ethereumjs-tx');

const router = express.Router();
const { web3 } = require('./web3');
const { TEST_ABI } = require('./abi');
const { TEST_CONTRACT, TOKEN_DECIMALS } = require('../config/config');

// contract Address
// const contractAddress = "0x2D754677046aABc536bB96b84E7B01eb536037b5";

const contractInstance = web3.eth.contract(TEST_ABI).at(TEST_CONTRACT);

 //middleware to check web3 is connected or not
 isWeb3Connected = (req, res, done) =>{
    if(!web3.isConnected()){
        return res.json({
            status: 300,
            data: null,
            message: "internal server error, please try after sometime"
        })
    }
    done();
 };

// Rest API for getting Balance
router.post('/api/token/getBalance', isWeb3Connected, (request, response) => {
    const address = request.body.address;
    if(!web3.isAddress(address)) {
        return response.json({
            status: 300,
            data: null,
            message:"invalid address"
        })
    }

    contractInstance.balanceOf(address, function (err, res) {
        if(err) {
            return res.json({
                status: 300,
                data:null,
                message:"failed to get the balance"
            })
        }
        response.json({
                status: 300,
                data: {"balance": res.toString(10) / TOKEN_DECIMALS},
                message:"success"
        });
    });

});

// Rest API for Transfer from Owner Account to Other Account
router.post('/api/token/transferTo', isWeb3Connected, (request, response) => {

    const from_account = request.body.from;
    const to_account = request.body.to;
    var  value = request.body.value;

    if(!web3.isAddress(from_account) || !web3.isAddress(to_account)) {
        return response.json({
            status: 300,
            data:null,
            message:"invalid address"
        })
    }
    if( typeof value == 'undefined') {
        return response.json({
            status: 300,
            data:null,
            message:"invalid value"
        })
    }
    if(value <= 0) {
        return response.json({
            status: 300,
            data:null,
            message:"invalid amount"
        })
    }
    // value = parseFloat(value);
    // console.log(typeof value, value, value * TOKEN_DECIMALS);

    web3.personal.unlockAccount(from_account, request.body.password);

    contractInstance.transfer(to_account, value * TOKEN_DECIMALS, {from: from_account, gas: 95000}, function (err, res) {
        if (!err) {
            response.json({
                status: 200,
                data:{
                    txnHash: res
                },
                message: "transaction success"
            })
        }
        else {
            response.json({
                status: 300,
                data:{ txnHash:null },
                message:"transaction failed"
            })
        }
    });

})

router.post('/api/token/transferToWithPrivate', isWeb3Connected, (req, res)=> {
    var { from, to, value, private } = req.body;
    if( typeof from == 'undefined' || typeof to == 'undefined' || typeof value == 'undefined' || typeof private == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    value = parseFloat(value);

    if(value <= 0.0) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount"
        })
    }

    if(!web3.isAddress(from) || !web3.isAddress(to) || from == to) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid address details"
        })
    }
    var count = web3.eth.getTransactionCount(from,'pending');
    console.log("count", count);
    var data = contractInstance.transfer.getData(to, value * TOKEN_DECIMALS);
    var gasPrice = web3.eth.gasPrice * 1.50;
    var gasLimit = 900000;
    console.log("data:", data); 

    var rawTransaction = {
        "from": from,
        "nonce": web3.toHex(count),
        "gasPrice": web3.toHex(gasPrice),
        "gasLimit": web3.toHex(gasLimit),
        "to": TEST_CONTRACT,
        "value": "0x0",
        "data": data,
        "chainId": 4
    };
    var privKeyKey = new Buffer(private, 'hex');
    var tx = new Tx(rawTransaction);

    tx.sign(privKeyKey);
    var serializedTx = tx.serialize();

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err) {
            response.json({
                status: 200,
                data:{
                    txnHash: hash
                },
                message: "transaction success"
            })
        }
        else {
            response.json({
                status: 300,
                data:{ txnHash:null },
                message:"transaction failed"
            })
        }
    });
});

// Rest API for Approve

router.post('/api/token/approve', isWeb3Connected, (request, response) => {
    const from_account = request.body.from;
    const spender = request.body.spender;
    var value = request.body.value;
    const password = request.body.password;

    if( typeof from_account == 'undefined' || typeof spender == 'undefined' || typeof value == 'undefined' || typeof password == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    value = parseFloat(value);

    if(value <= 0.0) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount"
        })
    }

    if(!web3.isAddress(from_account) || !web3.isAddress(spender) || from_account == spender) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid address details"
        })
    }
    web3.personal.unlockAccount(from_account, password);

    contractInstance.approve(spender, value * TOKEN_DECIMALS, {from: from_account, gas: 95000}, function (err, res) {
        if (!err) {
            response.json({
                status: 200,
                data:{
                    txnHash: res
                },
                message: "transaction success"
            })
        }
        else {
            response.json({
                status: 300,
                data:{ txnHash:null },
                message:"transaction failed"
            })
        }
    });
});

//RESTApi to approve balance to others using private key
router.post('/api/token/approveWithPrivate', isWeb3Connected, (req, res)=> {
    var { from, spender, value, private } = req.body;

    if( typeof from == 'undefined' || typeof spender == 'undefined' || typeof value == 'undefined' || typeof private == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    value = parseFloat(value);

    if(value <= 0.0) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount"
        })
    }

    if(!web3.isAddress(from) || !web3.isAddress(spender) || from == spender) {
        return response.json({
            status: 300,
            message: "invalid address details"
        })
    }

    var count = web3.eth.getTransactionCount(from,'pending');
    console.log("count", count);
    var data = contractInstance.approve.getData(spender, value * TOKEN_DECIMALS);
    var gasPrice = web3.eth.gasPrice * 1.50;
    var gasLimit = 900000;
    console.log("data:", data); 

    var rawTransaction = {
        "from": from,
        "nonce": web3.toHex(count),
        "gasPrice": web3.toHex(gasPrice),
        "gasLimit": web3.toHex(gasLimit),
        "to": TEST_CONTRACT,
        "value": "0x0",
        "data": data,
        "chainId": 4
    };
    var privKeyKey = new Buffer(private, 'hex');
    var tx = new Tx(rawTransaction);

    tx.sign(privKeyKey);
    var serializedTx = tx.serialize();

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err) {
            response.json({
                status: 200,
                data:{
                    txnHash: hash
                },
                message: "transaction success"
            })
        }
        else {
            response.json({
                status: 300,
                data:{ txnHash:null },
                message:"transaction failed"
            })
        }
    });
});

// Rest API for transfer From

router.post('/api/token/transferFrom', isWeb3Connected, (request, response) => {

    const from_account = request.body.from;
    const to_account = request.body.to;
    var value = request.body.value;
    const spender = request.body.spender;
    const password =request.body.password;

    if( typeof from_account == 'undefined' || typeof to_account == 'undefined' || typeof spender == 'undefined' || typeof value == 'undefined' || typeof password == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    value = parseFloat(value);

    if(value <= 0.0) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount"
        })
    }

    if(!web3.isAddress(from_account) || !web3.isAddress(spender)  || !web3.isAddress(to_account) || from_account == to_account) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid address details"
        })
    }
    web3.personal.unlockAccount(spender, password);

    contractInstance.transferFrom(from_account, to_account, value * TOKEN_DECIMALS, {from: spender, gas: 95000}, function (err, res) {
        if (!err) {
            response.json({
                status: 200,
                data:{
                    txnHash: res
                },
                message: "transaction success"
            })
        }
        else {
            response.json({
                status: 300,
                data:{ txnHash:null },
                message:"transaction failed"
            })
        }
    });
});

//RESTApi to transferfrom balance to others using private key
router.post('/api/token/transferFromWithPrivate', isWeb3Connected, (req, res)=> {
    var { from, to, value, private, spender } = req.body;

    if( typeof from == 'undefined' || typeof to == 'undefined' || typeof spender == 'undefined' || typeof value == 'undefined' || typeof private == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    value = parseFloat(value);

    if(value <= 0.0) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount"
        })
    }

    if(!web3.isAddress(from) || !web3.isAddress(spender) || !web3.isAddress(to) || from == to) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid address details"
        })
    }

    var count = web3.eth.getTransactionCount(spender,'pending');
    console.log("count", count);
    var data = contractInstance.transferFrom.getData(from, to, value * TOKEN_DECIMALS);
    var gasPrice = web3.eth.gasPrice * 1.50;
    var gasLimit = 900000;
    console.log("data:", data); 

    var rawTransaction = {
        "from": spender,
        "nonce": web3.toHex(count),
        "gasPrice": web3.toHex(gasPrice),
        "gasLimit": web3.toHex(gasLimit),
        "to": TEST_CONTRACT,
        "value": "0x0",
        "data": data,
        "chainId": 4
    };
    var privKeyKey = new Buffer(private, 'hex');
    var tx = new Tx(rawTransaction);

    tx.sign(privKeyKey);
    var serializedTx = tx.serialize();

    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err) {
            response.json({
                status: 200,
                data:{
                    txnHash: hash
                },
                message: "transaction success"
            })
        }
        else {
            response.json({
                status: 300,
                data:{ txnHash:null },
                message:"transaction failed"
            })
        }
    });
});

// Rest API for increaseApproval

router.post('/api/token/increaseApproval', isWeb3Connected, (request, response) => {
    const from_account = request.body.from;
    const spender = request.body.spender;
    var value = request.body.value;
    const password = request.body.password;

    if( typeof from_account == 'undefined' || typeof spender == 'undefined' || typeof value == 'undefined' || typeof password == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    value = parseFloat(value);

    if(value <= 0.0) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount"
        })
    }

    if(!web3.isAddress(from_account) || !web3.isAddress(spender) || from_account == spender) {
        return response.json({
            status: 300,
            message: "invalid address details"
        })
    }

    web3.personal.unlockAccount(from_account, password);

    contractInstance.increaseApproval(spender, value * TOKEN_DECIMALS, {from: from_account, gas: 95000}, function (err, res) {
        if (!err) {
            response.json({
                status: 200,
                data:{
                    txnHash: res
                },
                message: "transaction success"
            })
        }
        else {
            response.json({
                status: 300,
                data:{ txnHash:null },
                message:"transaction failed"
            })
        }
    });
});



// Rest API for decreaseApproval

router.post('/api/token/decreaseApproval', isWeb3Connected, (request, response) => {
    const from_account = request.body.from;
    const spender = request.body.spender;
    var value = request.body.value;
    const password = request.body.password;

    if( typeof from_account == 'undefined' || typeof spender == 'undefined' || typeof value == 'undefined' || typeof password == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    value = parseFloat(value);

    if(value <= 0.0) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount"
        })
    }

    if(!web3.isAddress(from_account) || !web3.isAddress(spender) || from_account == spender) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid address details"
        })
    }
    web3.personal.unlockAccount(from_account, password);

    contractInstance.decreaseApproval(spender, value, {from: from_account, gas: 95000}, function (err, res) {
        if (!err) {
            response.json({
                status: 200,
                data:{
                    txnHash: res
                },
                message: "transaction success"
            })
        }
        else {
            response.json({
                status: 300,
                data:{ txnHash:null },
                message:"transaction failed"
            })
        }
    });
});

module.exports = router;