import path from 'path'
import http from 'http'
import os from 'os'
import https from 'https'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import colors from 'colors'
import morgan from 'morgan'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

const app = express()
app.use(cors())

if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'))
}

app.use(notFound)
app.use(errorHandler)

if (process.env.NODE_ENV === 'production') {
   //   app.use(express.static(path.join(__dirname, '/frontend/build')))
   //   app.get('*', (req, res) =>
   //     res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
   //   )
} else {
   app.get('/', (req, res) => {
      res.send('API is running....')
   })
}

//Server setup
const port = process.env.PORT
const sslport = process.env.SSLPORT

if (app.get('env') === 'development') {
   app.use(morgan('dev'))

   const sslKeyPath = path.join(
      os.homedir(),
      'Desktop/Desarrollo/ssl/localhost-key.pem'
   )
   const sslCertPath = path.join(
      os.homedir(),
      'Desktop/Desarrollo/ssl/localhost-cert.pem'
   )

   // const sslKeyPath = '../.cert/key.pem'
   // const sslCertPath = '../.cert/cert.pem'

   const sslserver = https.createServer(
      {
         key: fs.readFileSync(sslKeyPath),
         cert: fs.readFileSync(sslCertPath),
      },
      app
   )

   sslserver.listen(sslport, () => {
      console.log(
         `Server running in ${process.env.NODE_ENV} mode on port ${sslport}`
            .yellow.bold
      )
   })
} else {
   const server = http.createServer(app)

   server.listen(port, () => {
      console.log(
         `Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow
            .bold
      )
   })
}

const PORT = process.env.PORT || 5000
