import mongoose from 'mongoose'

const urlMongodb = process.env.MONGODB_URL || "mongodb://localhost/food-land"
mongoose.connect(urlMongodb,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',function(){
    console.log('connection successfully');
})

export default db;
