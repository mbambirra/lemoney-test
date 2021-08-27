const http = require('http')
const fs = require('fs')
const URL = require('url')
const path = require('path')

const data = require('./offers.json')

function createOffer(cb) {
  fs.writeFile(
    path.join(__dirname, 'offers.json'), 
    JSON.stringify(data, null, 2),
    err => {
      if(err) throw err

      cb(JSON.stringify({message: 'Cashback offers list updated!'}))
    }
  )
}

http.createServer((req, res) => {

  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*'
  })

  if(req.method === 'GET'){
    const { id, active } = URL.parse(req.url, true).query

    if(id){
      let specific = data.offers.filter(item => String(item.id) == String(id))
      return res.end(JSON.stringify(specific[0]))
    }
    if(active){
      let activeOffers = data.offers.filter(item => String(item.status) == 'enabled')
      return res.end(JSON.stringify(activeOffers))
    }
    return res.end(JSON.stringify(data))
  }

  if(req.method === 'POST'){
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      let bodyAction = JSON.parse(body).action
      let bodyData = JSON.parse(body).data

      if(bodyAction === 'create'){
        let alreadyExists = data.offers.filter(item => String(item.id) == String(bodyData.id))
        if(alreadyExists.length > 0){
          return res.end(JSON.stringify({message: 'An offer with that name is already registered!'}))
        }
        data.offers.push(bodyData)
        return createOffer((message) => {
          res.end(message)
        })
      }

      if(bodyAction === 'edit'){
        data.offers = data.offers.filter(item => String(item.id) !== String(bodyData.id))
        data.offers.push(bodyData)
        return createOffer((message) => {
          res.end(message)
        })
      }
    
      if(bodyAction === 'change_status'){
        let toModify = data.offers.filter(item => String(item.id) == String(bodyData.id))[0]
        data.offers = data.offers.filter(item => String(item.id) !== String(bodyData.id))
        toModify.status = bodyData.status
        data.offers.push(toModify)
        return createOffer((message) => {
          res.end(message)
        })
      }
    
      if(bodyAction === 'destroy'){
        data.offers = data.offers.filter(item => String(item.id) !== String(bodyData.id))
        return createOffer((message) => {
          res.end(message)
        })
      }

    })
  }

}).listen(3000, () => console.log('API is running'))