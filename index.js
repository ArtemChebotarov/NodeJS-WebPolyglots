const express = require('express')
const {MongoClient} = require('mongodb')

const exphbs = require('express-handlebars')
const userRoutes = require('./routes/main')
const path = require('path')
const PORT = process.env.PORT || 3000

const app = express()
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.urlencoded({extended: true}))
app.use("/images" ,express.static(path.join(__dirname, '/images')))

app.use(userRoutes)

const uri = "mongodb+srv://artem:q1w2e3@cluster0-ddntm.mongodb.net/test?retryWrites=true&w=majority"  
const client = new MongoClient(uri) 


async function start() {
    try {    
        
        await client.connect()
        // databasesList = await client.db().admin().listDatabases();

        app.listen(PORT, () => {
            console.log('Server has been started...')
        })
    } catch (e) {
        console.log(e)
    }
}

start()

module.exports.client = client