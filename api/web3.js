var Web3 = require('web3');

var web3 = new Web3();

// web3 = new Web3(new Web3.providers.HttpProvider("http://128.199.129.139:9090"));
web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/txaAN5QHgGh50svNsBKY"));


module.exports = { web3 };