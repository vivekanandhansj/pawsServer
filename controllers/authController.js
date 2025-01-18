//The Controllers contain the logic for handling requests, which is separated from the routing logic. 
// We'll define the controller for authentication (registration and login).
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { Server } = require('socket.io');
const db = require('../db');
const io = require('../app');
const dotenv = require("dotenv");
const {promisify} = require("util");
dotenv.config({ path: './.env' });




function generateRandomEid() {
    const randomEid = Math.floor(1000000000 + Math.random() * 9000000000);
    return randomEid;
}

exports.signupUser = async (req,res) => {
    const body = {...req.body,isAdmin:1,uLat:0,uLong:0,uEid:''};
    let uId = '';
    const {uName,mobile,email,uStreet,uArea,uCity,uState,uVaccine,uPassword,uImgData,isAdmin,uLat,uLong,uEid} = body;
    db.query("select * from users where email=?",
        [email],
        async(error,result)=>{
         if(error){
            console.log(error);
         }
         else{
            const base64Data = req.body.uImgData;
            const buffer = Buffer.from(base64Data, 'base64');
            const fileSizeLimit = 1 * 1024 * 1024;
            if (buffer.length > fileSizeLimit) {
                return res.status(400).json({ msg: "Image size exceeds 1 MB", msg_type: "error" });
            }
            if(result.length>0){
                return res.status(400).json({msg:"Email id is already taken",msg_type:"error"})
            }
            else if(uPassword.length!=8){
                return res.status(400).json({msg:"In correct password",msg_type:"error"})
            }
            else{
                let hashedPassword = await bcrypt.hash(uPassword,8);
                const insertQuery = 'INSERT INTO users(uName, mobile, email, uStreet, uArea, uCity, uState, uVaccine, uPassword, uImgData, isAdmin, uLat, uLong,uEid) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                db.query(insertQuery,
                    [uName, mobile, email, uStreet, uArea, uCity, uState, uVaccine, hashedPassword, buffer, isAdmin, uLat, uLong, uEid],
                    (err,result)=>{
                        if(err){
                            console.log(err)
                        }
                        else{
                            db.query("SELECT uId FROM users WHERE email=?",[email],(err,result)=>{
                               if(err){
                                    console.log(err)
                               }
                               else{
                                uId = result[0].uId;
                              let eId = generateRandomEid();
                                db.query("UPDATE users SET uEid = ? where uId = ? ",[eId,uId],(err,result)=>{
                                    if(err){
                                        console.log(err)
                                    }
                                    else{
                                        const notificationQuery = 'INSERT INTO notifications(message,isDog,uId) VALUES(?,?,?)';
                                        const message= `Volunteer ${uName} join successfully`;
                                        const isDog= 0;
                                        db.query(notificationQuery,
                                            [message,isDog,uId],
                                            (err,result)=>{
                                                if(err){
                                                    console.log(err)
                                                }
                                                else{
                                                    // io.emit('new-notification', { message });
                                                  return res.status(201).send({ msg: 'User signed up successfully',msg_type:"success"});
                                                }
                                            }
                                        )
                                    }
                                })
                               }
                            })
                        }
                    }
                )
            }
         }
           
           
            
        }
    )

}
exports.loginUser = async (req,res) => {
    console.log(req.body);
    const {email,uPassword}=req.body;
    if(!email || !uPassword){
        return res.status(400).json(
            {msg:"Please enter your email and password",msg_type:"error"}   
        )
    }
    else{
        db.query("SELECT * FROM users WHERE email=?",[email],async(err,result)=>{
            if(err){
                console.log(err)
            }
            else{
                if(result.length<=0){
                    return res.status(401).json(
                        {msg:"Email or password incorrect",msg_type:"error"}   
                    )
                }
                else{
                    if(!(await bcrypt.compare(uPassword,result[0].uPassword))){
                        return res.status(401).json(
                            {msg:"Email or password incorrect",msg_type:"error"}   
                        )
                    }
                    else{
                        console.log("SUccessfully logged in");
                        // let data = {
                        //     uName:result[0].uName,
                        //     mobile:result[0].mobile,
                        //     email:result[0].email,
                        //     uStreet:result[0].uStreet,
                        //     uArea:result[0].uArea,
                        //     uCity:result[0].uCity,
                        //     uState:result[0].uState,
                        //     uVaccine:result[0].uVaccine,
                        //     uImgData:result[0].uImgData.toString('base64'),
                        //     uLat:result[0].uLat,
                        //     uLong:result[0].uLong,
                        //     uEid:result[0].uEid
                        // }
                        let token_data = {
                            id:result[0].uId,
                            isAdmin: result[0].isAdmin
                        }
                        const token = jwt.sign(token_data,
                            process.env.SECRET_KEY,
                            {expiresIn:process.env.JWT_EXPIRES_IN});
                        // const cookieOptions = {
                        //     expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
                        //     httpOnly:true,
                        //     secure: process.env.NODE_ENV === 'production' ? true : false, 
                        //     sameSite:'none',
                        //     path:'/'
                        // }
                        // res.cookie("jwt",token,cookieOptions);
                      return  res.status(200).send({jwt:token});
                    }
                } 
            }
        })
    }
    }
exports.updateLocation = async(req,res)=>{
    const {latitude,longitude,user} = req.query;
    console.log(req.query);
    if(latitude && longitude){
        db.query('UPDATE users SET uLat = ?,uLong = ? WHERE email = ?',
            [latitude,longitude,user],
            async(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(500).json({msg:'Database query failed',msg_type:"error"});
                }
                else{
                    console.log(result);
                    if(result.length==0){
                        return res.status(404).json({msg:"No user found that name!",msg_type:"error"});
                    }
                    else{
                        console.log("updated")
                        return res.status(200).json({msg:"location updated successfully",msg_type:"success"})
                    }
                }
            }
        )
    }
    else{
        return res.status(401).json({
            msg:"un authorized access",msg_type:"error"
        })
    }

}
exports.logout = (req,res)=>{
    res.cookie("jwt","logout",{
        expires:new Date(Date.now() + 2*1000),
        httpOnly:true
    })
    res.status(200).send({msg:"successfully logged out",msg_type:"success"});
}

exports.isLoggedIn = async(req,res,next)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({
            msg:"un authorized access",msg_type:"error"
        })
    }
    try{
       const decode = jwt.verify(token,process.env.SECRET_KEY)
        console.log(decode.id)
        console.log(decode.isAdmin)
        db.query("SELECT * FROM users WHERE uId=?",
            [decode.uId],
            (error,results)=>{
                if(error){
                    console.log(error);
                }
                else{
                    if(!results){
                        return next();
                    }
                   
                    req.user = decode;
                    return next();
                }
            }
        )
    }
    catch(err){
        if (err.name === "TokenExpiredError") {
            return res.status(403).json({ msg: "Token expired.",msg_type:"error" });
        } else {
            return res.status(403).json({ msg: "Invalid token.",msg_type:"error" });
        }
    }
}