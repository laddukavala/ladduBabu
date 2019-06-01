const express = require('express');
const axios = require('axios');

const router = express.Router();

//RESTApi to get ether to doller from coinmarket
router.get('/api/stats/getEtherPrice', (request, response) => {
    axios.get('https://api.coinmarketcap.com/v2/ticker/1027/?convert=USD')
            .then((res) => {
                response.json({
                    status: 200,
                    data:{
                        ETH:1,
                        USD: res.data.data.quotes.USD.price
                    },
                    message:"success"
                })
            })
            .catch(reason => {
                response.json({
                    status: 300,
                    data: {},
                    message: reason
                })
            })
});

//RESTApi to get the bitcoin price to ether 
router.get('/api/stats/bitcoinConvert', (request, response)=>{
    axios.get('https://api.coinmarketcap.com/v2/ticker/1/?convert=ETH')
            .then((res) => {
                response.json({
                    status: 200,
                    data: {
                        BTC: 1,
                        ETH: res.data.data.quotes.ETH.price,
                        USD: res.data.data.quotes.USD.price
                    },
                    message:"success"
                               
                })
            })
            .catch(reason => {
                response.json({
                    status: 300,
                    data: {},
                    message:reason
                })
            })
})

module.exports = router;