// const { string, required } = require("joi");
const mongoose=require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema=mongoose.Schema;
// Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.

const userSchema=new Schema({
    email:{
        type:String,
        required:true,
    }
});
// You're free to define your User how you like. Passport-Local Mongoose will add a username, 
// hash and salt field to store the username, the hashed password and the salt value.
// Additionally, Passport-Local Mongoose adds some methods to your Schema. \
// so no username and pd
// If the package exports an object with a default property
const plugin = typeof passportLocalMongoose === "function" 
    ? passportLocalMongoose 
    : passportLocalMongoose.default;

userSchema.plugin(plugin);

module.exports=mongoose.model("User",userSchema);