import jsonwebtoken from 'jsonwebtoken'
import { once } from 'node:events'
import { createServer } from 'node:http'

const VALID = {
  user: 'rodolfobelo',
  password: '123'
}
const TOKEN_KEY = "abc123"

async function loginRoute(request, response) {
  const { user, password } = JSON.parse(await once(request, "data"))
  if (user !== VALID.user || password !== VALID.password) {
    response.writeHead(400)
    response.end(JSON.stringify({ error: 'user invalid!' }))
    return
  }

  const token = jsonwebtoken.sign({ user, message: 'heyduude' }, TOKEN_KEY)

  response.end(JSON.stringify({ token }))
}

async function getUsers(request, response) {
  response.end()
}

async function createProductRoute(request, response) {
  const { name, description, price } = JSON.parse(await once(request, "data"))
  const categories = {
    premium: {
      from: 100,
      to: 101
    },
    regular: {
      from: 51,
      to: 100
    },
    basic: {
      from: 0,
      to: 50
    }
  }
  const [result] = Object.keys(categories).filter(key => {
    const category = categories[key]
    return price >= category.from && price <= category.to
  })
  response.end(JSON.stringify({ category: result }))
}

function validateHeaders(headers) {
  try {
    const auth = headers.authorization.replace(/bearer\s/ig, '')
    jsonwebtoken.verify(auth, TOKEN_KEY)
    return true
  } catch (error) {
    return false
  }
}

async function handler(request, response) {
  if (request.url === '/login' && request.method === "POST") {
    return loginRoute(request, response)
  }

  if (!validateHeaders(request.headers)) {
    response.writeHead(404)
    return response.end("invalid token!")
  }

  if (request.url === "/products" && request.method === "POST") {
    return createProductRoute(request, response)
  }

  if(request.url === "/users" && request.method === "GET") {
    return getUsers(request, response)
  }

  response.writeHead(404)
  response.end('not found!')
}

const app = createServer(handler)
  .listen(3004, () => console.log('listening to 3004'))

export { app }