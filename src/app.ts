import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Discord } from './Discord'
import { getInstance, disposeClient } from './DiscordFactory'
import { MongoClient } from 'mongodb'
import { BotController } from './Controllers/BotController'
import { checkIsDefined, isNullOrWhitespace } from './Check'
import * as env from 'dotenv'
env.config()

var cors = require('cors')
var dbconnection = checkIsDefined(process.env.dbconnection, "Db Connection should be defined");
const port = checkIsDefined(process.env.port, "Port should be defined")

const app = express.default()
if (true) {
  app.use(cors())
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let client:MongoClient | null;
async function CreateDb() {
  client = client ?? await MongoClient.connect(dbconnection, { useUnifiedTopology: true })
  const db = client.db("discordapi")
  return db
}

app.get("/bots", async (req, res) => {
  try {
    const db = await CreateDb()
    return new BotController(db).get(req, res)
  } catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }
})

app.post("/bots", async (req, res) => {
  try {
    const db = await CreateDb()
    return new BotController(db).post(req, res)
  } catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }
})

app.delete("/bots", async (req, res) => {
  try {
    const db = await CreateDb()
    return new BotController(db).delete(req, res)
  } catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }
})

app.get('/guilds', async (req, res) => {
  let client = undefined
  try {
    const token = req.header('authorization')
    if (isNullOrWhitespace(token)) {
      return res.sendStatus(401)
    }

    client = getInstance(token as string)

    const guildCollection = await client.Guilds()

    console.log(guildCollection)
    res.json(guildCollection)
  }
  catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }
})

app.post('/joinchannel', async (req, res) => {
  let client = undefined

  try {
    const token = req.header('authorization')
    if (isNullOrWhitespace(token)) {
      return res.sendStatus(401)
    }

    client = new Discord(token as string)

    console.log(req.body)
    await client.JoinChannel(req.body.guildId, req.body.userId)
    res.sendStatus(200)
  }
  catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }
})

app.post('/message', async (req, res) => {
  let client = undefined

  try {
    const token = req.header('authorization')
    if (isNullOrWhitespace(token)) {
      return res.sendStatus(401)
    }

    client = new Discord(token as string)


    console.log(req.body)
    await client.Message(req.body.guildId, req.body.channelId, req.body.message)
    res.sendStatus(200)
  }
  catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }
})

app.post('/playmusic', async (req, res) => {
  let client: Discord | undefined = undefined

  try {
    const token = req.header('authorization')
    if (isNullOrWhitespace(token)) {
      return res.sendStatus(401)
    }

    client = new Discord(token as string)


    console.log(req.body)
    console.log("play music")
    await client.PlayMusic(req.body.guildId, req.body.userId, req.body.url)
    console.log("done")
    res.sendStatus(200)
  }
  catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }
})

app.post('/logout', async (req, res) => {
  try {
    const token = req.header('authorization')
    if (isNullOrWhitespace(token)) {
      return res.sendStatus(401)
    }

    disposeClient(token as string)

    res.sendStatus(200)
  }
  catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }
})

app.listen(port, () => {
  console.log(`Started on PORT ${port}`);
})
