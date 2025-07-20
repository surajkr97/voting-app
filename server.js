const express = require('express')
const app = express()


require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = process.env.port || 3000; // Default to port 3000 if not specified

//Import the router files
const userRoutes = require('./routes/userRoutes');

//Use the routers
app.use('/user', userRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})