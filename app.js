const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });
 
let dbClient;
 
app.use(express.static(__dirname + "/public"));
 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("usersdb").collection("usersa");
    app.listen(3000, function(){
        console.log("Сервер ожидает подключения...");
    });
}); 
app.post("/api/users", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const UserLink=req.body.link;
   const userText = req.body.text;
   const userPswd = req.body.pswd;
   const user = {text: userText, pswd: userPswd, link: UserLink};
   const collection = req.app.locals.collection;
    collection.insertOne(user, function(err, result){
               
        if(err) return console.log(err);
        res.send(user);
    });
});
app.post("/api/search", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
    
    const UserLink=req.body.link;
   const userPswd = req.body.pswd;
   const collection = req.app.locals.collection;
    collection.findOneAndUpdate({link: UserLink, pswd:userPswd}, { $set: {pswd: userPswd,link: UserLink}},
    {returnOriginal: false },function(err, result){
          
   if(err) return console.log(err);     
   const user = result.value;
   res.send(user);
});
})

app.delete("/api/users/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let user = result.value;
        res.send(user);
    });
});
   
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});