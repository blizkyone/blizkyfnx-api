import path from 'path'
import http from 'http'
import os from 'os'
import https from 'https'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import colors from 'colors'
import morgan from 'morgan'
import passport from 'passport'
import session from 'express-session'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'
import passportConfig from './config/passport.js'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import placesRoutes from './routes/placesRoutes.js'
import notificationsRoutes from './routes/notificationsRoutes.js'

connectDB()
passportConfig()

const app = express()
app.use(cors())
app.use(express.json())

if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'))
}

//Sessions
// app.use(
//    session({
//       secret: 'loki dog',
//       resave: false,
//       // saveUninitialized: true,
//       // false: don't create a session until something is stored
//       saveUninitialized: false,
//       //store - mongo store mas adelante
//       cookie: { secure: true },
//    })
// )

//Passport middleware
app.use(passport.initialize())
// app.use(passport.session())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/places', placesRoutes)
app.use('/api/notifications', notificationsRoutes)

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
         `Server running in ${process.env.NODE_ENV} mode on port ${port}`.blue
         // .bold
      )
   })
}

const PORT = process.env.PORT || 5000
