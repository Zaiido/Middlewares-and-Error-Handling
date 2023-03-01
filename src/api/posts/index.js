import Express from "express";
import { dirname, join } from 'path'
import { fileURLToPath } from "url";
import fs, { write } from 'fs'
import uniqid from 'uniqid'
import createHttpError from "http-errors";
import { callBadRequest, checkPostSchema } from "./validation.js";


const postsRouter = Express.Router()

const postsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "posts.json")

const getPosts = () => JSON.parse(fs.readFileSync(postsJSONPath))
const writePosts = (posts) => fs.writeFileSync(postsJSONPath, JSON.stringify(posts))

postsRouter.get("/", (request, response, next) => {
    const posts = getPosts()

    if (request.query && request.query.title) {
        const matchedPosts = posts.filter(post => post.title.toLowerCase().includes(request.query.title.toLowerCase()))
        response.send(matchedPosts)
    } else {
        response.send(posts)
    }
})


postsRouter.post("/", checkPostSchema, callBadRequest, (request, response, next) => {

    const newPost = { _id: uniqid(), ...request.body, createdAt: new Date() }

    const posts = getPosts()
    posts.push(newPost)
    writePosts(posts)

    response.status(201).send({ _id: newPost._id })

})
postsRouter.get("/:postId", (request, response, next) => {
    try {
        const posts = getPosts()
        const foundPost = posts.find(post => post._id === request.params.postId)

        if (foundPost) {
            response.send(foundPost)
        } else {
            next(createHttpError(404, `Post with id ${request.params.postId} was not found!`))
        }

    } catch (error) {
        next(error)
    }

})
postsRouter.put("/:postId", (request, response, next) => {

    try {
        const posts = getPosts()
        const index = posts.indexOf(post => post._id === request.params.postId)
        if (index !== -1) {
            const oldPost = posts[index]
            const updatedPost = { ...oldPost, ...request.body }
            posts[index] = updatedPost
            writePosts(posts)
            response.send(updatedPost)
        } else {
            next(createHttpError(404, `Post with id ${request.params.postId} was not found!`))
        }
    } catch (error) {
        next(error)
    }

})
postsRouter.delete("/:postId", (request, response, next) => {
    try {
        const posts = getPosts()
        const filteredPosts = posts.filter(post => post._id !== request.params.postId)

        if (posts.length !== filteredPosts.length) {
            writePosts(filteredPosts)
            response.status(204).send()
        } else {
            next(createHttpError(404, `Post with id ${request.params.postId} was not found!`))
        }

    } catch (error) {
        next(error)
    }
})





export default postsRouter