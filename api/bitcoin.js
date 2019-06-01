const express = require('express');
const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');
const bigi = require('bigi');
const buffer = require('buffer');
const async = require('async');

var router = express.Router();

const { TEST_NET, MAIN_NET, API_TOKEN } = require('../config/config');

//RESTAPi to generate new address 
router.get('/createAccount', (req, res) => {

    axios.post(`${TEST_NET}/addrs?token=${API_TOKEN}`)
        .then((response) => {
            res.json({
                status: 200,
                data: response.data,
                message: "success"
            })
        })
        .catch(reason => {
            res.json({
                status: 300,
                data: null,
                message: reason
            })
        })
})

//RESTApi to get the balance of address
router.post('/getBalance', (req, res) => {

    let { address } = req.body;
    //api call to get blance of accoont
    axios.get(`https://bitaps.com/api/address/${address}`)
        .then(response => {
            res.json({
                status: 200,
                data: response.data,
                message: "success"
            })
        })
        .catch(reason => {
            res.json({
                status: 300,
                data: null,
                message: reason
            })
        })
});

//RESTApi to get the transaction status and details
router.post('/getTransactionStatus', (req, res) => {
    let { txnHash } = req.body;

    if (typeof txnHash == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid transaction hash"
        })
    }

    axios.get(`${TEST_NET}/txs/${txnHash}`)
        .then(response => {
            res.json({
                status: 200,
                data: response.data,
                message: "success"
            })
        })
        .catch(reason => {
            res.json({
                status: 300,
                data: {},
                message: reason
            })
        })
});

router.post('/sendTransaction', (req, res) => {
    let { from, to, value, privateKey } = req.body;

    if (typeof from == 'undefined' || typeof to == 'undefined' || typeof value == 'undefined' || typeof privateKey == 'undefined') {
        return response.json({
            status: 300,
            data: null,
            message: "invalid input details"
        })
    }
    value = parseFloat(value);
    console.log("Balance before fee :", value);
    value = value - 0.000105;
    // value = value - 0.00008;
    console.log("After fee : ", value);
    value = value * 100000000;
    console.log("After fee : ", value);
    value = parseInt(value);
    console.log(typeof value, value)

    if (value <= 0.0) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid amount"
        })
    }

    if (from == to) {
        return response.json({
            status: 300,
            data: null,
            message: "invalid address details"
        })
    }

    //if private key is invalid return null
    if (privateKey.length != 64) {
        return res.json({
            status: 300,
            data: {},
            message: "invalid privatekey"
        })
    }

    var newTx = {
        inputs: [{ addresses: [from] }],
        outputs: [{ addresses: [to], value: value }]
    };


    console.log("Transaction: ", JSON.stringify(newTx));
    var keys = new bitcoin.ECPair(bigi.fromHex(privateKey));

    axios.post(`${MAIN_NET}/txs/new?token=${API_TOKEN}`, JSON.stringify(newTx))
        .then(response => {

            var tempTx = response.data;
            tempTx.pubkeys = [];
            tempTx.signatures = tempTx.tosign.map(function (tosign, n) {
                tempTx.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'));
                return keys.sign(new buffer.Buffer(tosign, 'hex')).toDER().toString('hex');
            })

            //sending back transaction with all the signatures to broadcast
            axios.post(`${MAIN_NET}/txs/send?token=${API_TOKEN}`, tempTx)
                .then(result => {
                    res.json({
                        status: 200,
                        data: result.data,
                        message: "success"
                    })
                })
                .catch(error => {
                    console.log("inner error", error.response);

                    res.json({
                        status: 300,
                        message: "error got",
                        data: {}
                    })
                })
        })
        .catch(reason => {
            console.log("our error", reason.response);

            res.json({
                status: 300,
                message: "got error",
                data: {}
            })
        })
});
module.exports = router;