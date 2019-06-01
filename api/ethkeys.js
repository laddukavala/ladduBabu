const express = require('express');
const fs = require('fs');
const keythereum = require('keythereum');
const ethWallet = require('ethereumjs-wallet');
const Tx = require('ethereumjs-tx');
const path = require('path');

var router = express.Router();

// router.post('/api/eth/getPrivateKey', (req, res)=>{

//     var { password, address } = req.body;
//     // Specify a data directory (optional; defaults to ~/.ethereum)
//     var dir = path.normalize('D:\\Rinkeby Network\\testnet');
//     console.log("Key store path ", dir);

//     // Synchronous
//     var keyObject = keythereum.importFromFile(address, dir);

//     var privateKey = keythereum.recover(password, keyObject);
//     pk =  privateKey.toString('hex');

//     // fs.appendFile('../data/mydata.txt', `${address} === private key:${pk}\n`, function (err) {
//     //     if (err) throw err;
//     //     console.log('Saved!');
//     //   });
//       res.json({
//           address: address,
//           private: pk
//       })
// })

// code in server
router.post('/api/eth/getPrivateKeyLocal', (req, res)=>{                                                               
                                                                                                          
    var { password, address } = req.body;                                                                 
                                                                                                          
    var dir = path.normalize('/var');                                                      
    console.log("Key store path ", dir);                                                                  
                                                                                                          
    // var address = "0x3b7cd11b52113eb5625c114339b0b63f7f48c690";                                        
    // //private key of above address =42baaf04dcf57afbcfb6db3eb098bc05fa2d641fd6685b347283e12068e35a22   
    // var toAddress = "0xb40e16d197df72e9c9213bb638f3c64f461091c4";                                      
                                                                                                          
                                                                                                          
    // Synchronous                                                                                        
    var keyObject = keythereum.importFromFile(address, dir);                                              
                                                                                                          
    var privateKey = keythereum.recover(password, keyObject);                                             
    if(privateKey){                                                                                       
        res.json({                                                                                        
            result: true,                                                                                 
            key: privateKey.toString('hex')                                                               
        })                                                                                                
    } else{                                                                                               
        res.json({                                                                                        
            result: true,                                                                                 
            key:null                                                                                      
        })                                                                                                
    }                                                                                                     
                                                                                                          
    var privateKey = privateKey.toString('hex');                                                          
    console.log("Private key:", privateKey.toString('hex'));                                              
                                                                                                                                                                                                                   
});         

// code in server
router.post('/api/eth/getPrivateKey', (req, res)=>{                                                               
                                                                                                          
    var { password, address } = req.body;                                                                 
                                                                                                          
    var dir = path.normalize('~/.ethereum/rinkeby');                                                      
    console.log("Key store path ", dir);                                                                  
                                                                                                          
    // var address = "0x3b7cd11b52113eb5625c114339b0b63f7f48c690";                                        
    // //private key of above address =42baaf04dcf57afbcfb6db3eb098bc05fa2d641fd6685b347283e12068e35a22   
    // var toAddress = "0xb40e16d197df72e9c9213bb638f3c64f461091c4";                                      
                                                                                                          
                                                                                                          
    // Synchronous                                                                                        
    var keyObject = keythereum.importFromFile(address, dir);                                              
                                                                                                          
    var privateKey = keythereum.recover(password, keyObject);                                             
    if(privateKey){                                                                                       
        res.json({                                                                                        
            result: true,                                                                                 
            key: privateKey.toString('hex')                                                               
        })                                                                                                
    } else{                                                                                               
        res.json({                                                                                        
            result: true,                                                                                 
            key:null                                                                                      
        })                                                                                                
    }                                                                                                     
                                                                                                          
    var privateKey = privateKey.toString('hex');                                                          
    console.log("Private key:", privateKey.toString('hex'));                                              
                                                                                                                                                                                                                   
});    
module.exports = router;