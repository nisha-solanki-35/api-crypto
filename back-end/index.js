const http = require('http')
const fs = require('fs')
const { PRIVATE_KEY } = require('./helper/PublicPrivate');
const { encryptText, decryptText } = require('./helper/helper');
var Crypt = require('hybrid-crypto-js').Crypt;
var crypt = new Crypt();

const server = http.createServer((req, res) => {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Request-Method', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    // res.setHeader('Access-Control-Allow-Headers', '*');
    // console.log('req.url, req.method', req.url, req.method)
    // console.log('path', path.dirname(__dirname))
    // console.log('__dirname', __dirname)
    // console.log('req', req)
    if (req.url === '/') {
        res.end('On Dashboard Page')
    } else if (req.url === '/users/v1' && req.method === 'GET') {
        const data = fs.readFileSync(__dirname + '/JSON/users.json', 'utf-8')
        res.end(data)
    } else if (req.url === '/register/v1' && req.method === 'POST') {
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString();
            fs.writeFileSync(__dirname + '/JSON/register-user.json', body, err => {
                if (err) console.log('err', err)
            })
        })
        const obj = {
            message: 'Registered successfully',
            status: 200
        }
        res.end(JSON.stringify(obj))
    } else if (req.url === '/login/v1' && req.method === 'POST') {
        let body = ''
        let decrypted = ''
        req.on('data', chunk => {
          body += chunk.toString();
          const password = JSON.parse(body)?.sPassword
          console.log('password', password)
          decrypted = crypt.decrypt(PRIVATE_KEY, password);
        })
        req.on('end', () => {
          if (decrypted === 'Super@123') {
            res.statusCode(200).end()
            res.statusMessage('Logged in successfully')
            res.end()
          } else {
            const obj = {
              statusCode: 404,
              message: 'Please enter a valid credentials',
            }
            res.statusCode(400).end()
            res.end(JSON.stringify(obj))
          }
        })
    } else if (req.url === '/login/v2' && req.method === 'POST') {
      const crypto = require("crypto")
      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
      })
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString();
        const password = JSON.parse(body)?.sPassword
        const encryptedText = encryptText(password)
        // console.log('encrypted text: ', encryptedText.toString('base64'))
        const decryptedText = decryptText(encryptedText)
        // console.log('decrypted text:', decryptedText.toString())
      })
      req.on('end', () => {
        // res.statusCode(res.statusCode)
        const obj = {
          status: 200,
          message: 'Logged in successfully',
        }
        // res.statusMessage('Logged in successfully')
        res.end(JSON.stringify(obj))
      })
    } else {
        const data = {
            status: 404,
            message: 'Not found'
        }
        // res.statusCode(200)
        res.end(JSON.stringify(data))
    }
})

server.listen(8080, () => {
    console.log('port listening on 8080')
})