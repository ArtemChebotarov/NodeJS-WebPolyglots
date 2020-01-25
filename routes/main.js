const {Router} = require('express')
const router = Router()
const index = require('../index')
const mongo = require('mongodb')



router.get('/', async (req, res) => {
    
    users = await index.client.db("Users").collection("User").find()
        .toArray()
        

    res.render('index', {
        title: 'Users',
        isIndex: true,
        users
    })
})

router.get('/create', async (req, res) => {
    languages = await index.client.db("Users").collection("Language").find().toArray()
    levels = await index.client.db("Users").collection("LanguageLevel").find().toArray()

    res.render('create', {
        title: 'Create user',
        isCreate: true,
        languages,
        levels
    })
})

router.post('/create', async (req, res) => {
    
    await index.client.db("Users").collection("User").insertOne({
        name: req.body.name,
        surname: req.body.surname,
        birthday: req.body.birthday,
        about: req.body.about
    })

    if(req.body.lng != undefined) {
        user = await index.client.db("Users").collection("User").find().limit(1).sort({$natural:-1}).toArray()
        userId = user[0]._id
        
        if((req.body.lng)[0].length > 1){
            for(let i = 0; i < (req.body.lng).length; i++) {
                lngChosen = await index.client.db("Users").collection("Language").findOne({language: (req.body.lng)[i]})
                lvlChosen = await index.client.db("Users").collection("LanguageLevel").findOne({level: (req.body.lvl)[i]})
        
                lngId = lngChosen._id
                lvlId = lvlChosen._id

                await index.client.db("Users").collection("LanguageList").insertOne({
                    language: mongo.ObjectId(lngId),
                    level: mongo.ObjectId(lvlId),
                    user: mongo.ObjectId(userId) 
                })
            }   
        }
        else {
            
            lngChosen = await index.client.db("Users").collection("Language").findOne({language: req.body.lng})
            lvlChosen = await index.client.db("Users").collection("LanguageLevel").findOne({level: req.body.lvl})
    
            lngId = lngChosen._id
            lvlId = lvlChosen._id

            await index.client.db("Users").collection("LanguageList").insertOne({
                language: mongo.ObjectId(lngId),
                level: mongo.ObjectId(lvlId),
                user: mongo.ObjectId(userId) 
            })
        }
    }
    

    
    res.redirect('/')

})

router.post('/edit', async(req, res) => {
    user = await index.client.db("Users").collection("User").findOne({_id: mongo.ObjectId(req.body.id)})
    langLists = await index.client.db("Users").collection("LanguageList").find({user: mongo.ObjectId(req.body.id)}).toArray()
    langsOut = []

    for(let i = 0; i < langLists.length; i++) {
        level = await index.client.db("Users").collection("LanguageLevel").findOne({_id: mongo.ObjectId(langLists[i].level)})
        language = await index.client.db("Users").collection("Language").findOne({_id: mongo.ObjectId(langLists[i].language)})
        langsOut.push({
            lng: language.language, 
            lvl: level.level
        })
    }

    res.render('edit', {
        title: 'Edit user',
        id: req.body.id,
        name: user.name,
        surname: user.surname,
        birthday: user.birthday,
        about: user.about,
        langsOut
    })
})

router.post('/edited', async(req, res) => {
    user = await index.client.db("Users").collection("User").findOne({_id: mongo.ObjectId(req.body.id)})

    await index.client.db("Users").collection("User").updateOne({
        _id: mongo.ObjectId(req.body.id)
    }, 
        {$set: {name: req.body.name,
            surname: req.body.surname,
            birthday: req.body.birthday,
            about: req.body.about}
        })

    res.redirect('/')
})

router.post('/delete', async(req, res) => {
    await index.client.db("Users").collection("LanguageList").deleteMany({user: mongo.ObjectId(req.body.id)})

    await index.client.db("Users").collection("User").deleteOne({_id: mongo.ObjectId(req.body.id)})
    res.redirect('/')
})

module.exports = router