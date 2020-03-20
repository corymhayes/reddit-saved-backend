require('dotenv').config();

const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors')
const BodyParser = require('koa-bodyparser')
const snoowrap = require('snoowrap');
const ObjectId = require('mongodb').ObjectID

let port = process.env.PORT;
if(port === 'null' || port === ""){
  port = 8000
}


const app = new Koa();
const router = new Router();

require("./mongo")(app)
app.use(BodyParser())

const r = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  accessToken: process.env.REDDIT_ACCESS_TOKEN,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
})


router.get('/', async ctx => {
  ctx.body = await ctx.app.reddit.findOne()
});

router.get('/reddit', async ctx => {
  const res = await r.getMe().getSavedContent({ limit: 30 }).map(save => save)
  let tempCategories = []
  let categories = new Object();
  await r.getMe().getSavedContent({ limit: 30 }).forEach(save => {
    if(!tempCategories.includes(save.subreddit.display_name)){
      tempCategories.push(save.subreddit.display_name.toLowerCase())
    }

  })

  tempCategories.forEach(cat => (
    categories[`${cat}`] = []
    // categories.push(
    //   {
    //     [`${cat}`]: []
    //   }
    // )
  ))

  for(let cat in categories){
    res.forEach(bar => {
      if(bar.subreddit.display_name.toLowerCase() === cat){
        categories[`${cat}`].push({
          title: bar.title,
          subreddit: bar.permalink
        })
      }
    })
  }

  // categories.map((foo, i) => {
  //   res.forEach(bar => {
  //     let keys = Object.keys(foo)

  //     if(bar.subreddit.display_name === keys[0]){
  //       foo[`${keys}`].push({title: bar.title})
  //     }
  //   })
  // })



  // tempCategories.forEach((cat, i) => {
  //   if(res.subreddit.display_name.toLowerCase() === Object.keys(cat)[0]){
  //     categories.push(
  //       {
  //         [`${res.subreddit.display_name.toLowerCase()}`]: cats.title
  //       }
  //       )
  //   }
  // })



  // res.forEach(cat => {
  //   if(tempCategories.includes(cat.subreddit.display_name)){
  //     console.log(cat.subreddit.display_name)
  //   }
  // })


  // foreach category that is matched with the display_name
  // push to that object name


  try{
    await ctx.app.reddit.replaceOne(
      {"_id": ObjectId("5e680cb35c475c81a08b7b68")},
      {categories},
    )

    ctx.body = await ctx.app.reddit.findOne()
  } catch(e){
    ctx.body = e;
  }
  
})

app
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(port);