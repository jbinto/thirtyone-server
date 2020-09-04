import express from 'express'

const app = express()

app.use('*', (req, res) => {
  res.send('hello world')
})

app.listen(process.env.PORT || 8080, () => {
  console.log('Listening....')
})