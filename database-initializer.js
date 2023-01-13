let images = [{

    "image": "https://i.pinimg.com/236x/55/8e/3d/558e3d2d14787ee4d72a3c9a49de6590.jpg",
    "name": "flowers",
    "description": "bringing flowers to my girlfriend in my sambas",
    "category": "baggy",
    "year": "2022",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  },{

    "image": "https://i.pinimg.com/236x/ab/98/3a/ab983a2d0ba86d16acd90a4757288d47.jpg",
    "name": "crossbody",
    "description": "I want a crossbody bag like this",
    "category": "streetwear",
    "year": "2022",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  },{

    "image": "https://i.pinimg.com/236x/cd/20/e9/cd20e9f889546aa84fd988870de3449e.jpg",
    "name": "sick vibes",
    "description": "anyone know where to get a jacket like this?",
    "category": "vintage",
    "year": "2022",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  },{

    "image": "https://i.pinimg.com/236x/91/9f/fa/919ffa0e2b62166a7010d34f33dbf6f2.jpg",
    "name": "cozy",
    "description": "not sure if I like the hoodie texture. wbu?",
    "category": "baggy",
    "year": "2021",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  },{

    "image": "https://i.pinimg.com/236x/b6/f1/d5/b6f1d5ad7697036ca054028d8539a955.jpg",
    "name": "proportions",
    "description": "love the fit",
    "category": "grunge",
    "year": "2020",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  },{

    "image": "https://i.pinimg.com/236x/6c/95/5a/6c955a94d3b27c68943c12737226fe0e.jpg",
    "name": "sick jacket",
    "description": "cool jacket from nike",
    "category": "vintage",
    "year": "1999",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  },{

    "image": "https://i.pinimg.com/236x/b7/2e/c7/b72ec714dc778d601b0777b432b31218.jpg",
    "name": "my dad",
    "description": "my dad when he was like 21",
    "category": "vintage",
    "year": "1999",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  },{

    "image": "https://i.pinimg.com/236x/3e/af/b4/3eafb411e0a298858e26dae6be1077d9.jpg",
    "name": "street",
    "description": "I used to think this style was cool but not really anymore",
    "category": "streetwear",
    "year": "2022",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  },{

    "image": "https://i.pinimg.com/236x/fa/6c/bb/fa6cbb99bda9a5c9d5e97347833e4d94.jpg",
    "name": "scarfs",
    "description": "scarfs for winter ya or nah?",
    "category": "streetwear",
    "year": "2022",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  },{

    "image": "https://i.pinimg.com/236x/d7/07/05/d707058634fcdbc823b79e42dbe927e1.jpg",
    "name": "work",
    "description": "fit at work",
    "category": "streetwear",
    "year": "2022",
    "userId": "639235778278085a88f15a96",
    "artist": "test",
    "likes": []
  }]

let user = {
  "id":  "639235778278085a88f15a96",
  "username": "test",
  "password": "test",
  "artist": true,
  "followers": [],
  "following": [],
  "notifications": []
}

let mongo = require('mongodb')
let MongoClient = mongo.MongoClient;
let db;


console.log("Connecting to database...")
MongoClient.connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true }, function(err, client) {
    if(err) throw err;

    db = client.db('galaDB');

    console.log("Connected to database!");
    console.log("\nClearing gallery collection...")
    db.dropCollection('gallery', function(err, result) {
        if(err) {
            console.log("Error dropping gallery collection. Likely case: Collection did not exist (don't worry unless you get other errors...)");

        } else {
            console.log("Cleared gallery collection!");
            



        }
        console.log("\nInserting images...")

        db.collection("gallery").insertMany(images, function(err, result) {
            if(err) throw err;
            console.log("Successfuly inserted " + result.insertedCount + " images!");

            console.log("\nClearing users collection...")

            db.dropCollection('users', function(err, result) {
              if(err) {
                  console.log("Error dropping user collection. Likely case: Collection did not exist (don't worry unless you get other errors...)");
      
              } else {
                  console.log("Cleared users collection!");
              }

              console.log("\nInserting test user...")
      
              db.collection("users").insertOne({"_id": mongo.ObjectId(user.id), "username": user.username, "password": user.password, "artist": user.artist, "followers": user.followers, "following": user.following, "notifications": user.notifications}, function(err, result) {
                if(err) throw err;
                console.log("Successfuly inserted test user!");

                console.log("\nClearing workshops collection...")

                db.dropCollection("workshops", function(err, result) {
                  if(err) {
                      console.log("Error dropping workshops collection. Likely case: Collection did not exist (don't worry unless you get other errors...)");
          
                  } else {
                      console.log("Cleared workshops collection!");

                      
                      
                  }
                  console.log("\nDone!")
                  process.exit();
              });
              });
          });
        });
    });
    
    
    
});

