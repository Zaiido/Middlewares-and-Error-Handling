import Express from 'express'
import listEndpoints from 'express-list-endpoints'
import postsRouter from './api/posts/index.js'
import cors from 'cors'
import { badRequestHandler, generalErrorHandler, notfoundHandler } from './errorHandlers.js'


const server = Express()
const port = 3001

server.use(cors())

server.use(Express.json())
server.use("/blogPosts", postsRouter)

server.use(badRequestHandler)
server.use(notfoundHandler)
server.use(generalErrorHandler)

server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("Server running in port " + port)
})