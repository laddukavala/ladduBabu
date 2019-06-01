const express = require('express');
const axios = require('axios');
var Tx = require('ethereumjs-tx');
var etherWallet = require('ethereumjs-wallet');
var keythereum = require("keythereum"); 
const path = require('path');

var router = express.Router();

// web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const { web3 } = require('./web3');

var dir = path.normalize('/var/keystore');
 
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

//RESTApi to create ether wallet locally
router.post('/api/eth/createLocalEtherAccount',(req, res)=>{
    var { password } = req.body;

    if(typeof password == 'undefined') {
        return res.json({
            status: 300,
            data: null,
            message:"no password provided!"
        })
    }
    // (if params is not passed to create, keythereum.constants is used by default)
    var params = { keyBytes: 32, ivBytes: 16 };
    
    // synchronous
    var dk = keythereum.create(params);
    console.log("dk:",dk.privateKey.toString('hex'));
    // Note: if options is unspecified, the values in keythereum.constants are used.
    // var options = {
    //     kdf: "scrypt",
    //     cipher: "aes-128-ctr",
    //     kdfparams: {
    //         n: 262,
    //         dklen: 32,
    //         p:1,
    //         r:8
    //     }
    // };
    var options = {
        kdf: "pbkdf2",
        cipher: "aes-128-ctr",
        kdfparams: {
            c: 262144,
            dklen: 32 ,
            prf: "hmac-sha256"
        }
    };
    var keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);
    console.log("Keyobject: ",JSON.stringify(keyObject, undefined,3));
    keythereum.exportToFile(keyObject, dir);
    res.json({
        status: 200,
        message:"wallet created successfully",
        data:{
            privateKey:dk.privateKey.toString('hex'),
            address: "0x"+keyObject.address
        }
        
    })
});

//RESTApi to get ether balance
router.post('/api/eth/getEtherBalance', isWeb3Connected, (request, response) => {
    
    var address = request.body.address;
    //check for valid address
    if(!web3.isAddress(address)) {
        return response.json({
            status: 300,
            data: null,
            message:"invalid address"
        })
    }

    var balance = web3.eth.getBalance(address);
    //console.log(balance);
    response.json({
        status: 200,
        data : {
            balance: web3.fromWei(balance, 'ether')
       
        },
        message: "success"
    });
});

router.post('/api/eth/transactionCount',isWeb3Connected, (request, response) => {

    var { address } = request.body;

    if(!web3.isAddress(address)) {
        return response.json({
            status: 300,
            data: null,
            message:"invalid address"
        })
    }

    var count = web3.eth.getTransactionCount(address);
    
    response.json({
        status: 200, 
        data: {
            count: count
        },
        message: "success"
    });
});

//rest API for ether transfer using web3 ethereum tx
router.post('/api/eth/transferEtherWithPrivate', isWeb3Connected, (request, response) => {
    var { from, to, value, private } = request.body;
    
    //check input values

    if( typeof from == 'undefined' || typeof to == 'undefined' || typeof value == 'undefined' || typeof private == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    value = parseFloat(value);

    if(value <= 0.0 || web3.fromWei(web3.eth.getBalance(from), 'ether') < value) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount, enter below your wallet balance"
        })
    }

    if(!web3.isAddress(from) || !web3.isAddress(to) || from == to) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid address details"
        })
    }
    var privateKey = new Buffer(private, 'hex')
    
    var count = web3.eth.getTransactionCount(from,'pending');
   
    var gasPrice = web3.eth.gasPrice * 1.5;
    var gasLimit = 900000;

    var value = web3.toWei(value, 'ether');
    console.log("Transaction count:", count, gasPrice, gasLimit, value, web3.isConnected());
    var rawTx = {
        "from":from,
        "nonce":web3.toHex(count),
        "gasPrice": web3.toHex(gasPrice),
        "gasLimit":  web3.toHex(gasLimit),
        "to": to, 
        "value": web3.toHex(value), 
        "data": '0x00',
        "chainId": 4
    }
    var tx = new Tx(rawTx);
    tx.sign(privateKey);
    
    var serializedTx = tx.serialize();
    
    
    web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
        if (!err) {
            console.log(hash);
            return response.json({
                status: 200,
                data: {
                    txnHash: hash
                },
                message:"transaction sent successfully"

            })
        } else {
            console.log(err);
            return response.json({
                status: 300,
                data: null,
                message:"transaction failed"
            })
        }
    });
});

// Rest API for Ether Transfer
router.post('/api/eth/sendEtherTransaction', isWeb3Connected, (request, response) => {
    const from_account = request.body.from;
    const to_account = request.body.to;
    var valueInEther = request.body.value;
    const pass = request.body.password;

    if( typeof from_account == 'undefined' || typeof to_account == 'undefined' || typeof valueInEther == 'undefined' || typeof pass == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    valueInEther = parseFloat(valueInEther);

    if(valueInEther <= 0.0 ||  web3.fromWei(web3.eth.getBalance(from), 'ether') < valueInEther) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount"
        })
    }

    if(!web3.isAddress(from_account) || !web3.isAddress(to_account) || from_account == to_account) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid address details"
        })
    }

    const value = web3.toWei(valueInEther, 'ether');
    web3.personal.unlockAccount(from_account, pass, 2);
    web3.eth.sendTransaction({from: from_account, to: to_account, value: value, gas: 60000}, function (err, res) {
        if (err) {
            response.json({
                status:300,
                data: null,
                message:"transaction failed"
            });
        } else {
            
            response.json({
                status: 200,
                data:{
                    txnHash: res
                },
                message: "transaction sent successfully"

            });
        }
    });

});

// Rest API for Getting Reciept
router.post('/api/eth/getRecieptFromTransaction', isWeb3Connected, (request, response) => {
    const txnHash = request.body.txnHash;
 
    if(typeof txnHash == 'undefined'){
        return response.json({
            status: 300,
            data: null,
            message: "invalid transaction hash"
        })
    }
    if( txnHash.length != 66 ) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid transaction hash"
        })
    }

    var receipt = web3.eth.getTransactionReceipt(txnHash);
    if (!receipt) {
        response.json({
            status:300,
            data: null,
            message:"invalid transaction hash"
        });
    } else {
        response.json({
            status:200,
            data: {
                receipt: receipt
            },
            message: "success"
        });
    }
});

//RESTApi to get transaction status
router.post('/api/eth/getTransactionStatus', isWeb3Connected, (request, response) => {
    const txnHash = request.body.txnHash;

    if(typeof txnHash == 'undefined'){
        return response.json({
            status: 300,
            data: null,
            message: "invalid transaction hash"
        })
    }

    if( txnHash.length != 66 ) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid transaction hash"
        })
    }

    var receipt = web3.eth.getTransaction(txnHash);
    if (!receipt) {
        response.json({
            status:300,
            data: null,
            message:"invalid transaction hash"
        });
    } else {
        response.json({
            status:200,
            data:{
                receipt: receipt
            },
            message: "success"
        });
    }
});


//key import to local
router.post('/api/eth/importFileLocal', (request, response) => {
    const prik = request.body.private;
    const pass = request.body.password;
    //if (typeof web3.eth.accounts === 'undefined'){
    if(typeof prik == 'undefined' || typeof pass == 'undefined'){
        return response.json({
            status: 300,
            data: null,
            message: "invalid input"
        })
    } 

    var key = Buffer.from(prik, 'hex');

    var wallet = etherWallet.fromPrivateKey(key);
    
    if( !wallet) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid private key"
        })
    }
    const publicKey = wallet.getPublicKeyString(); //public key
    const address = wallet.getAddressString(); // address
    const keystoreFilename = wallet.getV3Filename(); //keystoreFilename
    const keystore = wallet.toV3(pass);   //getting keystore

    keythereum.exportToFile(keystore, dir);  // export keystore to specified file location

    
    return response.json({
        status: 200,
        data:{
            address: address,
            public: publicKey 
        },
        message:"wallet imported"
    });
    
});

module.exports = router;