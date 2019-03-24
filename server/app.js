const express = require('express');
const graphqlHTTP = require('express-graphql')
const cors = require('cors')

const app = express();
const schema = require('./schema');
const mongoose = require('mongoose');

app.use(cors());

mongoose.connect('mongodb://root:secretword123@ds351455.mlab.com:51455/gqlbooks')
mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
})
app.use('/graphql',graphqlHTTP({
    schema, //schema: schema
    graphiql: true
}));

app.listen(5000, () => {
    console.log("Server online at port 5000")
})