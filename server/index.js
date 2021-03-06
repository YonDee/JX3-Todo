const Koa = require('koa')
const consola = require('consola')
const middleware = require('./middleware')
const koaBody = require('koa-body')
const cors = require('@koa/cors')

const {
  Nuxt,
  Builder
} = require('nuxt')

const app = new Koa()

app.use(koaBody({
  multipart: true
}))

app.use(cors({
  credentials: true
}))

middleware(app)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1',
      port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  app.use(ctx => {
    ctx.status = 200
    ctx.respond = false
    ctx.req.ctx = ctx
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()
