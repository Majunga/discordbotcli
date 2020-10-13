import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Discord } from './Discord'
import { Check } from './Check'
var cors = require('cors')



const app = express.default()

if (true) {
  app.use(cors())
}

const port = 3000

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/guilds', async (req, res) => {
  let client = undefined
  try {
    const token = req.header('authorization')
    if (Check.isNullOrWhitespace(token)) {
      return res.sendStatus(401)
    }

    client = new Discord(token as string)

    const guildCollection = await client.Guilds()

    const guilds = []
    for (const guild of guildCollection) {
      guilds.push({
        guildId: guild.id,
        name: guild.name
      })
    }

    console.log(guilds)
    res.json(guilds)

    client.dispose()

  }
  catch (ex) {
    console.error(ex)
    res.sendStatus(500)
  }

  client?.dispose()
})

app.post('/joinchannel', async (req, res) => {
  let client = undefined

  try {
    const token = req.header('authorization')
    if (Check.isNullOrWhitespace(token)) {
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

  client?.dispose()
})

app.post('/message', async (req, res) => {
  let client = undefined

  try {
    const token = req.header('authorization')
    if (Check.isNullOrWhitespace(token)) {
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

  client?.dispose()
})


app.post('/playmusic', async (req, res) => {
  let client: Discord | undefined = undefined

  try {
    const token = req.header('authorization')
    if (Check.isNullOrWhitespace(token)) {
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
    client?.dispose()
  }

})

app.listen(port, () => {
  console.log("Started on PORT 3000");
})