import { createServer as createHttpServer } from 'http'
import { createPool as createDatabaseConnectionPool } from 'mariadb'
import express from 'express'
import session from 'express-session'
declare module 'express-session' {
  interface SessionData {
    authorized?: boolean,
    uid?: string,
    captcha?: string
  }
}
import compression from 'compression'
import { createStream as rfscs } from 'rotating-file-stream'
import morgan from 'morgan'
import { Server as SocketServer } from 'socket.io'
import { getCurrentDateTime } from './utils'
import { Routes } from './route/api'

// config
const port = 3000
const logDirectory = './logs'
const logFormat = '[:time] [:method] [:url :status :response-time ms :total-time ms] -> [:remote-addr]'
morgan.token('time', (): string => getCurrentDateTime().replace(' ', '_').replace(':', '-'))

// initial
const pool = createDatabaseConnectionPool({
  host: '127.0.0.1',
  user: 'root',
  password: '123123',
  connectionLimit: 20
})
const app = express()
const httpServer = createHttpServer(app)
const socketServer = new SocketServer(httpServer)

// middleware
app.use(
  morgan(logFormat, {
    stream: rfscs('access.log', {
      size: '10M',
      interval: '1d',
      compress: 'gzip',
      path: logDirectory
    })
  })
)
app.use(
  session({
    secret: '123',
    name: 'test',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 1800, // 1000ms * 1800 = 30min
      secure: true
    }
  })
)
app.use(compression())
app.use('/', express.static('./static'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
socketServer.use((middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next))
app.use('/api', Routes(pool))

// listening port
httpServer.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:3000`)
})
