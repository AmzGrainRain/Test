import { createServer as createHttpServer } from 'http'
import { createPool as createDatabaseConnectionPool } from 'mariadb'
import express from 'express'
import session from 'express-session'
declare module 'express-session' {
  interface SessionData {
    authorized?: boolean
    uid?: string
    captcha?: string
  }
}
import compression from 'compression'
import { createStream as rfscs } from 'rotating-file-stream'
import morgan from 'morgan'
morgan.token('time', (): string => getCurrentDateTime().replace(' ', '_').replace(':', '-'))
import { Server as SocketServer } from 'socket.io'
import { getCurrentDateTime } from './utils'
import { Routes } from './route/api'

const port = 3000
const logDirectory = './logs'
const logFormat =
  '[:time] [:method] [:url :status :response-time ms :total-time ms] -> [:remote-addr]'

/**
 * Database Connection Pool
 */
const pool = createDatabaseConnectionPool({
  host: '127.0.0.1',
  user: 'root',
  password: '123123',
  database: 'chat',
  connectionLimit: 20
})

/**
 * HTTP Server
 */
const app = express()
const httpServer = createHttpServer(app)

/**
 * Socket Server
 */
const socketServer = new SocketServer(httpServer)
const socketClients = new Map<string, any>()
socketServer.on('connection', (socket: any) => {
  if (!socket.request.session?.authorized) {
    socket.disconnect()
    return
  }
  socketClients.set(socket.id, socket)
  setInterval(() => {
    socket.emit('online', socketClients.size)
  }, 1000)
})
socketServer.on('disconnect', (socket: any) => {})

/**
 * Middleware
 */
const rfss = rfscs('access.log', {
  size: '10M',
  interval: '1d',
  compress: 'gzip',
  path: logDirectory
})
const sessionOptions = {
  secret: '123',
  name: 'test',
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 1800, // 1000ms * 1800 = 30min
    secure: true
  }
}
app.use(morgan(logFormat, { stream: rfss }))
app.use(session(sessionOptions))
app.use(compression())
app.use('/', express.static('./static'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
socketServer.use(
  (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next)
)
app.use('/api', Routes(pool))

httpServer.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:3000`)
})
