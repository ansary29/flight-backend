import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { ObjectId } from "mongodb";


const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cookieParser());

app.use(cors({
    origin:["http://localhost:3000","https://flightbook-front-3mvzudr6y-ansary29.vercel.app/"],
    methods:["GET","POST","PUT","DELETE"],
}
))

app.use(express.json())

const MONGO_URL = "youur uri";

const Createconnection = async () => {
    try{mongoose.connect(MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    });
    console.log("MongoDB is Connected")

    }catch(err){
        console.log(err)
    }
}

const Client = await Createconnection();

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
        // unique:true
    },
    tokens:[
        {
            token:{
                type:{
                    type:String,
                    required:true,

                }
            }
        }
    ]
});
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
    }
    next()
})
userSchema.methods.generateValidToken = async function () {
    try{
        const generatedToken = jwt.sign({_id:this._id}.process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({token: generatedToken})
        await this.save();
        return generatedToken;

    }catch(err){
        console.log(err)
    }
}
const User=mongoose.model("Users",userSchema)



const flightSchema = new mongoose.Schema({
FightName:{
    type:String,
    required:true,
},
From:{
    type:String,
    required:true,
},
FromTime:{
    type:String,
    required:true,
},
To:{
    type:String,
    required:true,
},
ToTime:{
    type:String,
    required:true,
},
Timing:{
    type:String,
    required:true,
},
// Date:{
//     type:String,
//     required:true,
// },
Url:{
   type:String,
   required:true
},
Offers:{
    type:String,
    required:true,
}
})

const Flight = mongoose.model("Flight",flightSchema)













app.get("/",function(req,res){
    res.send("backend server connected")
})
app.post("/login",async function(req,res){
    try{
        const {userName,password}= req.body;

        const user = await User.findOne({userName:userName})

        if(!user){
            res.status(400).send({
                msg:"signup plz or invalid credentials"
            })
        }else{
              const alreadystoredpassword = user.password  
              const ispasswordmatch = await bcrypt.compare(
                password,
                alreadystoredpassword
              ) ;
              if(ispasswordmatch){
                // const token = await user.generateValidToken();

                // res.cookie("token",token,{
                //     expires: new Date(Date.now()+86000000),
                //     httpOnly:true,
                //     secure:true,
                //     sameSite:none,
                // });
                res.status(200).send({
                    msg:"login successfully"
                })
              }else{
                res.status(400).send({
                    msg: "Worng Password",
                })
                console.log("password incorrect")
            }
        }

    }catch(err){
        console.log(err)
    }
})



app.post("/signup",async function(req,res){
   try{
    const {Name,phone,password,confirmpassword}=req.body
    const isUserExist = await User.findOne({userName:Name})

    if(isUserExist){
        res.status(400).send({msg:"try new userName"})
    }else{
        const NewUser = new User({
            userName:Name,
            phone:phone,
            password:password
        })
        await NewUser.save();
        res.status(200).send("signup successfull ")
    }

   }catch(err){
    console.log(err)
   }
})
app.post("/AddFlights",async function(req,res){
   try{
    const {Name,From,To,offersDetails,date,FromTime,ToTime,Timedetails,url}=req.body
    
        const NewFlight = new Flight({
            FightName:Name,
            From:From,
            FromTime:FromTime,
            To:To,
            ToTime:ToTime,
            Timing:Timedetails,
            // Date:date,
            Url:url,
            Offers:offersDetails,
        })

        await NewFlight.save()

        res.status(200).send("flight added ")
   

   }catch(err){
    console.log(err)
   }
})

app.get("/getflights",async function(req,res){
    try{
        const data = await Flight.find({});
        res.send(data)

    }catch(err){

    }
})
app.get("/getflights/:id",async function(req,res){
    const id = req.params.id
    // const id = "chennai$Goa"
    const getname = id.split("$")

    try{
        let result =[]
        const data = await Flight.find({From:getname[0]});
        data.map((e)=>{
            if(e.To==getname[1]){
                result.push(e)
            }
        })
        res.send(result)
        // console.log(data)

    }catch(err){
            console.log(err.message)
    }
})
app.get("/getflight/:id",async function(req,res){
    const id= req.params.id
    try{
        const data = await Flight.findOne({_id:ObjectId(id)});
        res.send(data)

    }catch(err){

    }
})






app.listen(PORT,()=>console.log(`App started in Port: ${PORT}`))

