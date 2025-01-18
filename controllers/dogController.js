const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');
const { nanoid } = require('nanoid');
const db = require('../db');
const dotenv = require("dotenv");
dotenv.config({path:'./.env'});

function generateRandomEid() {
    const randomEid = Math.floor(1000000000 + Math.random() * 9000000000);
    return randomEid;
}

// Function to generate a unique dog name
const generateDogName = () => {
    const descriptiveName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '', 
      style: 'capital',
      length: 2,
    });
    const randomID = nanoid(2); 
    return `${descriptiveName}${randomID}`;
  };

exports.addDog = async (req,res)=>{
    if(req.user.isAdmin==1){
        const body = {...req.body};
        const {gps,dStreet,dArea,dCity,dState,dVaccine,dImgData,medicalDesc,dLat,dLong} = body;
        db.query('SELECT * FROM dogs WHERE gps =?',
            [gps],
            async(error,result)=>{
                if(error){
                    console.log(error)
                }
                else{
                    const base64Data = dImgData;
                    const buffer = Buffer.from(base64Data, 'base64');
                    const fileSizeLimit = 1 * 1024 * 1024;
                    if (buffer.length > fileSizeLimit) {
                        return res.status(400).json({ msg: "Image size exceeds 1 MB", msg_type: "error" });
                    }
                    else if(result.length>0){
                        return res.status('401').json({msg:"GPS id is already taken", msg_type:'error'})
                    }
                    else{
                        const insertQuery='INSERT INTO dogs(gps,dStreet,dArea,dCity,dState,dVaccine,dImgData,medicalDesc,dLat,dLong) VALUES(?,?,?,?,?,?,?,?,?,?)';
                        db.query(insertQuery,
                            [gps,dStreet,dArea,dCity,dState,dVaccine,buffer,medicalDesc,dLat,dLong],
                            async(error,result)=>{
                                if(error){
                                    console.log(error)
                                }
                                else{
                                    db.query('SELECT * FROM dogs WHERE gps =?',
                                        [gps],
                                        async(error,result)=>{
                                            if(error){
                                                console.log(error)
                                            }
                                            else{
                                                let dId = result[0].dId;
                                                let dEid = generateRandomEid();
                                                let dogName = generateDogName();
                                                db.query('UPDATE dogs SET dName =?, dEid =? WHERE dId =?',
                                                    [dogName,dEid,dId],
                                                    async(error,result)=>{
                                                        if(error){
                                                            console.log(error)
                                                        }
                                                        else{
                                                            const notificationQuery = 'INSERT INTO notifications(message,isDog,dId) VALUES(?,?,?)';
                                                            const message= `Dog ${dogName} added successfully`;
                                                            const isDog= 1;
                                                            db.query(notificationQuery,
                                                                [message,isDog,dId],
                                                                (err,result)=>{
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                    else{
                                                                     return res.status(201).send({ msg: 'dog added successfully',msg_type:"success"});
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    }
                                                )
                                            }
                                        }
                                    )
                                }
                            }
                        )
                    }
                }
            }
        )
    }
    else if(req.user.isAdmin==0){
        return res.status(401).json({
            msg:"You need admin privileges to add dogs",msg_type:"error"
        })
    }
}

exports.dogList = async (req,res)=>{
    if(req.user){
        const list_query = "select dId as id,dName as identifier,gps,TO_BASE64(dImgData) as img,CONCAT(dStreet,', ',dArea,', ',dCity,', ',dState,'.') as address,'dog' as type from dogs";
        db.query(list_query,
            (err,result)=>{
                if(err){
                    console.log(err);
                }
                else{
                   return res.status(200).json(result);
                }
            }
        )
    }
}

exports.dogInfo = async (req,res)=>{
    const {id} = req.query;
    if (!id) {
        return res.status(400).json({ msg: 'ID is required',msg_type:'error' });
      }
    else{
        const infoQuery = `
        SELECT JSON_OBJECT(
          'paw gps', gps,
          'vaccine', CASE WHEN dVaccine = 1 THEN 'true' ELSE 'false' END,
          'medical information', medicalDesc,
          'street', dStreet,
          'area', dArea,
          'city', dCity,
          'state', dState,
          'imgData', TO_BASE64(dImgData)
        ) As dogInformation
        FROM dogs
        WHERE dId= ?
      `; 
            db.query(infoQuery,
                [id],
                (err,result)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(result.length==0){
                            return res.status(404).json({msg:"No dog found!",msg_type:"error"});
                        }
                        else{
                           return res.status(200).json(result[0].dogInformation);
                        }
                    }
                })
        
    }
}

exports.dogEdit = async (req,res)=>{
    const {id,...updatedData} = req.body;
    
    const field = Object.keys(updatedData)[0];
    let value = updatedData[field];
    if(field=='dImgData'){
        const base64Data = updatedData[field];
        value = Buffer.from(base64Data, 'base64');
        console.log(value);
    }
    const editQuery = `UPDATE dogs SET ${field} = ? WHERE dId =?`;
    db.query(editQuery,
        [value,id],
        (err,result)=>{
            if(err){
                console.log(err);
                res.status(500).json({msg:'Failed to update dog',msg_type:"error"});
            }
            else{
              if(result.affectedRows >0){
                return res.status(200).json({msg:'Dog updated successfully!',msg_type:"success"});
              }
              else{
                return res.status(404).json({msg:'Dog not found',msg_type:"error"});
              }
              
            }
        }
    )

}