const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
var fs = require('fs')
const path = require('path');
var moment = require('moment');
var geoip = require('geoip-lite');
var parser = require('ua-parser-js');

// var dir = path.normalize('/var/node-app-logs/testing/log.log');
// var dir = path.normalize("D:\\logs\\log.txt");
var dir = path.normalize("/Users/amareshjana/Documents/AKTInfotech/blockchain-apis/logs/logs_t.text");

const bitcoin = require('./api/bitcoin');
const ethereum = require('./api/ethereum');
// const emiEth = require('./api/emiTokenWithEther');
const pk = require('./api/ethkeys');
const token = require('./api/emiToken');
const stats = require('./api/stats');
const { PORT, HOST } = require('./config/config');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


var logger = fs.createWriteStream(dir, {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
app.use((request, response, next) => {

    console.log("log dir: ", dir);
    var date = moment().format(); // local date

    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl; // full url

    //get ip address and country information
    var ipAddress = request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
    var geo_location = JSON.stringify(geoip.lookup(ipAddress), undefined, 2);

    //get browser details

    var ua = parser(request.headers['user-agent']);
    var browserInfo = JSON.stringify(ua, undefined, 2);

    logger.write(`Date and time: ${date}  -- URL Request: ${fullUrl} -- Method Type: ${request.method}  -- location: ${geo_location}  -- Browser and OS Info:  ${browserInfo} \r\n ===========================\r\n`) // append string to your file
    next();
})

var server = http.createServer(app);

app.use('/api/bitcoin', bitcoin);
app.use(ethereum);
app.use(pk);
app.use(token);
app.use(stats);

server.listen(PORT, HOST, () => {
    console.log(`server started on ${HOST}: ${PORT}`);
})