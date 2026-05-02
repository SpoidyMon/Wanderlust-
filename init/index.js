const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/Listing.js")

const MongoUrl="mongodb://127.0.0.1:27017/Wonderlust";
// const dbUrl=process.env.ATLASDB_URL;

main().then((res)=>{
    console.log("Server is connected to DB");
}).catch((err)=>{
    console.log("Server isn't connected due to "+err);
})

async function main() {
    await mongoose.connect(MongoUrl);
    
}

const initDB=async ()=> {
    await Listing.deleteMany({});
    //Making Mrunal-Jagtap as the owner of all listing objects with its user's obj_id : 69d55ed07b10597c55bcd3a9
    initdata.data=initdata.data.map((obj)=>({
        ...obj,owner:"69d55ed07b10597c55bcd3a9",
    }))
    await Listing.insertMany(initdata.data);
    console.log("DB was Intialized");
}

initDB();
