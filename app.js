const express = require('express');
const cors = require('cors');
let cookieParser = require('cookie-parser');
// const formidable = require('express-formidable');
const multer = require('multer');
const puppeteer = require('puppeteer');
const fs = require("fs");
const upload = multer();
// const path = require('path');
const app = express();

const schedule = require('node-schedule');

const {resolve} = require('path');
// Replace if using a different env file or config
const env = require('dotenv').config({path: '.env'});
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/accept-a-payment/payment-element",
    version: "0.0.2",
    url: "https://github.com/stripe-samples"
  }
});





const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc, getDoc, deleteDoc, query, where, updateDoc, serverTimestamp, and } = require('firebase/firestore');


// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_8GwxAp1O-4lW0bLSHHD8ORhrDD2rj2U",
  authDomain: "poolr-b5392.firebaseapp.com",
  databaseURL: "https://poolr-b5392.firebaseio.com",
  projectId: "poolr-b5392",
  storageBucket: "poolr-b5392.appspot.com",
  messagingSenderId: "841410602650",
  appId: "1:841410602650:web:b88d99c13526c6f3602123"
};

const fb_app = initializeApp(firebaseConfig);
const db = getFirestore(fb_app);
const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration
// app.use(morgan(':method :url :status :user-agent - :response-time ms'));
// app.use(formidable());
app.use(express.static('./client'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
// const mongoose = require('mongoose');
// app.use(express.static(process.env.STATIC_DIR));
app.use(
 express.json({
   // We need the raw body to verify webhook signatures.
   // Let's compute it only when hitting the Stripe webhook endpoint.
   verify: function (req, res, buf) {
     if (req.originalUrl.startsWith('/webhook')) {
       req.rawBody = buf.toString();
     }
   },
 })
);


  // create and connect redis client to local instance.


// const messaging = getMessaging(app);

// Get a list of cities from your database
async function getLeaderBoard(db, week) {
  const leaderboardCol = collection(db, `pickrecord`);
  const q = query(leaderboardCol, where("week", "==", week));
  const leaderboardSnapshot = await getDocs(q);
  const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());
  return leaderboardList;
}



 async function setLeaderBoard (db, data) {
  const notifyRef = collection(db, 'leaderboard_record');
  const q = query(notifyRef, and(where("week", "==", data.week), where("uid", "==", data.uid)));
  const leaderboardSnapshot = await getDocs(q);
  const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());
  console.log(leaderboardList.length)
  if(leaderboardList.length==0){
    const notifySnapshot = await setDoc(doc(notifyRef), data);
    return notifySnapshot;
  }else{
   console.log("already exist")
  }
}










const mongoose = require('mongoose');
const Pool = require('./models/pools');
const Week = require('./models/week');
const uri = "mongodb+srv://ediku126:ediku126@cluster0.7xzwjnh.mongodb.net/?retryWrites=true&w=majority";
// const uri = "mongodb://localhost:27017/matline"
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MongoDB Connected…")
  })
  .catch(err => console.log(err))









app.get('/nfl', async (req, res, next) => {

const getweek = await Week.find({})

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
    args: [
      '--no-sandbox', '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.goto(
    `https://www.nfl.com/schedules/${getweek[0].year}/${getweek[0].name}/`
  );
  //  `https://www.nfl.com/schedules/${getweek[0].year}/${getweek[0].name}/`
  await autoScroll(page);


try{
  await page.click('#onetrust-accept-btn-handler');
}catch(e){

}
await page.waitForSelector('.nfl-o-matchup-group')

console.log("waiting");
  const divContent = await page.evaluate(() => {
    let v = []
    let v2 = []
    const divElement = document.querySelectorAll('.nfl-o-matchup-group');
    divElement.forEach((e, index_org)=>{
     const value = e.querySelectorAll(".nfl-c-matchup-strip__left-area");
  
        value.forEach((ex)=>{
          
       const value2 = ex.querySelectorAll(".nfl-c-matchup-strip__team-abbreviation")
       const value3 = ex.querySelectorAll(".nfl-c-matchup-strip__team-fullname")
       const value5 = ex.querySelectorAll(".nfl-c-matchup-strip__team-score")
       const value6 = ex.querySelectorAll(".nfl-c-matchup-strip__date-time")
       const value4 = ex.querySelectorAll("img")
      
      
       value2.forEach((ex2, index)=>{  
          v.push({
            id: index_org,
            score: value5[index]?value5[index].getAttribute("data-score"):"--",
            abbreviation: value2[index].innerHTML,
            fullname: value3[index].innerHTML ,
            time: value6[0]==null||!value6[0]?"":`${value6[0].innerHTML} WAT`,
            date: e.querySelector("h2").innerText,
            picture: value4[index].getAttribute("data-src")
          })
        })

        index_org++
        })
      
    })
    return v;
  });

  await browser.close();
  // divContent
  const uniqueData = Object.values(
    divContent.reduce((acc, obj) => {
      // console.log(`${obj.abbreviation} ${obj.id}`)
      const key = `${obj.id}-${obj.date}`;
      if (!acc[key]) {
        acc[key] = obj;
      }else{
        acc[key] = {
          ...acc[key],
           time2: obj.time, 
          score2: obj.score, picture2: obj.picture, fullname2: obj.fullname, abbreviation2: obj.abbreviation, week: getweek[0].name, year: getweek[0].year
        }
        delete acc[key]["id"];
      }
      return acc;
    }, {})
  );

  const delPool = await Pool.deleteMany({week: getweek[0].name, year: getweek[0].year });
  const pool = await Pool.insertMany(uniqueData)
  const findPool = await Pool.find({})
  console.log(findPool.length)
  console.log(uniqueData)
  console.log("closeed")
  res.send("done")

})











app.get('/nfl_dates/:week', async (req, res, next) => {

  const getweek = await Week.find({})
  
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: false,
      userDataDir: "./tmp",
      args: [
        '--no-sandbox', '--disable-setuid-sandbox'
      ]
    });
  
    const page = await browser.newPage();
    await page.goto(
      `https://www.nfl.com/schedules/${getweek[0].year}/${req.params.week}/`
    );
    await autoScroll(page);
  
  
  try{
    await page.click('#onetrust-accept-btn-handler');
  }catch(e){
  
  }
  await page.waitForSelector('.nfl-o-matchup-group')
  
  console.log("waiting");
    const divContent = await page.evaluate(() => {
      let v = []
      let v2 = []
      const divElement = document.querySelectorAll('.nfl-o-matchup-group');
      divElement.forEach((e, index_org)=>{
       const value = e.querySelectorAll(".nfl-c-matchup-strip__left-area");
    
          value.forEach((ex)=>{
            
         const value2 = ex.querySelectorAll(".nfl-c-matchup-strip__team-abbreviation")
        
        
         value2.forEach((ex2, index)=>{  
            v.push(e.querySelector("h2").innerText)
          })
  
          index_org++
          })
        
      })
      return v;
    });
  
    await browser.close();
    // divContent
    console.log("closeed")
    res.send({dates: divContent})

  })





app.post("/update_all", async (req, res)=>{
const pool = await Pool.updateMany({year:"2022"})
res.send({message: true})
})



async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight - window.innerHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}


// tar czf matline_backend.tar.gz package.json package-lock.json src dump tests
// scp matline_backend.tar.gz root@199.192.27.241:~







function SimilarityPercentage(list1, list2) {
  // const commonElements = list1.filter(item => list2.includes(item));
  // const similarityScore = commonElements.length / Math.max(list1.length, list2.length) * 100;
  let count = 0
  list2.forEach(function (value, i) {
    // console.log('%d: %s', i, value);
    if(list1.includes(value)){
      count++;
    }
});
  return count;
}





app.post("/set_week", async (req, res)=>{
  const {name, year, mode} = req.body;
  const getweek = await Week.findOne({})
  console.log(getweek)
  if(!getweek){
    await Week.create({
      name, year, mode
    })
    res.send({message: "created"})
  }else{
    await getweek.updateOne({
      name, year, mode
  })
   res.send({message: "updated"})
  }

})




app.get("/get_week", async (req, res)=>{
  const getweek = await Week.findOne({})
   res.send(getweek)
})



// app.get("/get_week", async (req, res)=>{
//   const getweek = await Week.findOne({})
//    res.send(getweek)
// })



app.get('/calculate_score', async (req, res) => {
  // const {week} = req.params
  const getweek = await Week.find({})
  const findPool = await Pool.find({week: getweek[0].name, year: getweek[0].year})
  findPool.reverse()
  const last_value = findPool[0];
  if(last_value.score=="--"||last_value.score2=="--"){
    const leaderboardRecord = await getLeaderBoard(db, getweek[0].name)
    for(let value of leaderboardRecord){

     await setLeaderBoard(db, {
      "displayName": value.displayName,
      "photoURL": value.photoURL,
      "score": '--',
      'date': serverTimestamp(),
      'uid': value.uid,
      "week": getweek[0].name,
      "tiebreaker": value.tiebreaker,
    }, )
    }
    const notifyRef = collection(db, 'leaderboard_record');
    const q = query(notifyRef, where("week", "==", getweek[0].name));
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());
    res.send({leaderboardList:leaderboardList, played: true})
  }else{
    const leaderboardRecord = await getLeaderBoard(db, getweek[0].name)
    let winners = []
    for(let value of findPool){
      if(value.score > value.score2){
        winners.push(value.abbreviation);
      }else if(value.score2 > value.score){
        winners.push(value.abbreviation2);
      }else{
        winners.push(value.abbreviation2);
        winners.push(value.abbreviation);
      }
    }

    for(let value of leaderboardRecord){
      const score = SimilarityPercentage(value.picks, winners)
      // console.log(score)
      console.log(value.photoURL)
     await setLeaderBoard(db, {
      "displayName": value.displayName,
      "photoURL": value.photoURL,
      "score": score.toString(),
      'date': serverTimestamp(),
      'uid': value.uid,
      "week": getweek[0].name,
      "tiebreaker": value.tiebreaker,
    }, )
    }

    const gettiebreaker = Number(last_value.score)+Number(last_value.score2)
    const notifyRef = collection(db, 'leaderboard_record');
    const q = query(notifyRef, where("week", "==", getweek[0].name));
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());
    leaderboardList.sort((a, b) => {
      // Calculate the difference between "score" and the target score
      const diffA = Math.abs(a.tiebreaker - gettiebreaker);
      const diffB = Math.abs(b.tiebreaker - gettiebreaker);
    
      if (diffA === diffB) {
        // If the score differences are the same, sort based on the dates in descending order
        return new Date(b.date) - new Date(a.date);
      }
    
      return diffA - diffB; // Sort based on the score differences
    });
    
    // console.log(gettiebreaker);
    res.send({leaderboardList:leaderboardList, played: true} )
  }
})







app.get('/get_winners/:week', async (req, res) => {
  // const {week} = req.params
  const getweek = await Week.find({})
  const findPool = await Pool.find({week: req.params.week, year: getweek[0].year})
  findPool.reverse()
    let winners = []
    for(let value of findPool){
      if(value.score > value.score2){
        winners.push(value.abbreviation);
      }else if(value.score2 > value.score){
        winners.push(value.abbreviation2);
      }else{
        winners.push(value.abbreviation2);
        winners.push(value.abbreviation);
      }
    }

    res.send({winners})
})






app.get('/getleaderboard/:week', async (req, res) => {
  // const {week} = req.params;
  const getweek = await Week.find({})
  const findPool = await Pool.find({week:req.params.week, year:getweek[0].year})
  if(findPool.length==0) return res.send([])
  findPool.reverse()
  const last_value = findPool[0];
  if(last_value.score =="--"){
    const notifyRef = collection(db, 'leaderboard_record');
    const q = query(notifyRef, where("week", "==", req.params.week));
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());
    res.send({leaderboardList: leaderboardList, played: false}  )
  }else{
    const gettiebreaker = Number(last_value.score)+Number(last_value.score2)
    const notifyRef = collection(db, 'leaderboard_record');
    const q = query(notifyRef, where("week", "==", req.params.week));
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardList = leaderboardSnapshot.docs.map(doc => doc.data());

    leaderboardList.sort((a, b) => Number(b.score) - Number(a.score));
    // The score to filter by
    const highestScore = leaderboardList.reduce((maxScore, obj) => (Number(obj.score) > Number(maxScore) ? Number(obj.score) : Number(maxScore)), - Number(Infinity));
   // Filtering objects with the same score
    const objectsWithSameScore = leaderboardList.filter(obj => Number(obj.score) === Number(highestScore));

    objectsWithSameScore.sort((a, b) => Number(b.tiebreaker) - Number(a.tiebreaker));

    const highestTiebreaker = objectsWithSameScore.reduce((maxtiebreaker, obj) => (Number(obj.tiebreaker) > Number(maxtiebreaker) ? Number(obj.tiebreaker) : Number(maxtiebreaker)), - Number(Infinity));
    const objectsWithSameTieBreaker = objectsWithSameScore.filter(obj => Number(obj.tiebreaker) === Number(highestTiebreaker));

    objectsWithSameTieBreaker.sort((a, b) => new Date(b.date.seconds * 1000 + b.date.nanoseconds / 1000000) - new Date(a.date.seconds * 1000 + a.date.nanoseconds / 1000000));

    const mergedList = [...objectsWithSameTieBreaker, ...objectsWithSameScore, ...leaderboardList].reduce((uniqueList, obj) => {
      const existingObject = uniqueList.find(item => item.uid === obj.uid);
      if (!existingObject) {
        uniqueList.push({...obj, date: new Date(obj.date.seconds * 1000 + obj.date.nanoseconds / 1000000)});
      }
      return uniqueList;
    }, []);
    // leaderboardList.sort((a, b) => {
    //   // Calculate the difference between "score" and the target score
    //   const diffA = Math.abs(a.tiebreaker - gettiebreaker);
    //   const diffB = Math.abs(b.tiebreaker - gettiebreaker);
    
    //   if (diffA === diffB) {
    //     // If the score differences are the same, sort based on the dates in descending order
    //     return new Date(b.date) - new Date(a.date);
    //   }
    
    //   return diffA - diffB; // Sort based on the score differences
    // });
    
    // console.log(gettiebreaker);
    res.send({leaderboardList: mergedList, played: true}  )
  }
 
})







app.get('/version', (req, res) => {
    res.send({ios: "1.0.3" , andriod: "1.0.2"})
})


app.get('/version2', (req, res) => {
    res.send({ios: "1.0.3" , andriod: "1.0.2"})
})


app.get('/getnlf/:week', async (req, res) => {
  const getweek = await Week.find({})
  const findPool = await Pool.find({week: req.params.week, year:getweek[0].year})
  res.send(findPool)
})








app.get('/success', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/success.html');

  res.sendFile(path);
  setTimeout(()=>{
    console.log("very successful payment done")
    console.log("very successful payment done")
    console.log("very successful payment done")
    console.log("very successful payment done")
  }, 3000)
});



app.get('/cancel', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/cancel.html');
  res.sendFile(path);
});



app.get('/config', (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.get('/create-payment-intent', async (req, res) => {
  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'USD',
      amount: 500,
      automatic_payment_methods: { enabled: true }
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
app.post('/webhook', async (req, res) => {
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'payment_intent.succeeded') {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log('💰 Payment captured!');
  } else if (eventType === 'payment_intent.payment_failed') {
    console.log('❌ Payment failed.');
  }
  res.sendStatus(200);
});









app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: "price_1Nr7mCE84s4AdL4OvLuUx7SG",
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `https://poolq.app/success`,
    cancel_url: `https://poolq.app/cancel`,
  });

  res.redirect(303, session.url);
});



app.use(function(err,req,res,next){
	res.status(422).send({error: err.message});
  });


  app.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
  });

app.listen(process.env.PORT || 3000, function() {
	console.log('Express app running on port ' + (process.env.PORT || 3000))
});