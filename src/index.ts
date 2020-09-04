import express from 'express'
import Pusher from 'pusher'

const app = express()

if (!process.env.PUSHER_URL) {
  throw new Error('PUSHER_URL not set')
}

const pusher = Pusher.forURL(process.env.PUSHER_URL)

app.get('/', (req, res) => {
  const payload = {
    'message': new Date().toString()
  }
  pusher.trigger('my-channel', 'my-event', payload);
  res.send(`Pushed payload ${JSON.stringify(payload)}`)

app.listen(process.env.PORT || 8080, () => {
  console.log('Listening....')
})