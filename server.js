const express = require('express')
const app = express()


// require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = 3000; // Default to port 3000 if not specified

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})