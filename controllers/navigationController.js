const db = require('../db');

exports.pawsInformation = async(req,res)=>{
    const {id} = req.user;
    console.log("id",id);
    let userInfo = '';
    if(id){
        db.query("SELECT uLat AS lat, uLong As lon, uName As name,email As email, CONCAT(uStreet,', ',uArea,', ',uCity,', ',uState,'.') AS address, TO_BASE64(uImgData) AS img,  uId AS mid FROM users WHERE uId = ?",
            [id],(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(500).json({msg:'Database query failed',msg_type:"error"});                   
                }
                else{
                    if(result.length==0){
                        return res.status(404).json({msg:"No user found!",msg_type:"error"});
                    }
                    else{
                        userInfo=result[0];
                        const dogsQuery = `SELECT 
                                                dogs.gps,
                                                dogs.dLat AS lat,
                                                dogs.dLong AS lon,
                                                dogs.dName AS name,
                                                CONCAT(dogs.dStreet, ', ', dogs.dArea, ', ', dogs.dCity, ', ', dogs.dState, '.') AS address,
                                                TO_BASE64(dogs.dImgData) AS img,
                                                dogs.dId AS mid,
                                                CASE
                                                    WHEN MAX(feeds.date_time) >= NOW() - INTERVAL 8 HOUR THEN 1
                                                    ELSE 0
                                                END AS isFeed,
                                                CASE
                                                    WHEN EXISTS (SELECT 1 FROM emergency WHERE emergency.dId = dogs.dId) THEN 1
                                                    ELSE 0
                                                END AS isEmer
                                            FROM dogs
                                            LEFT JOIN feeds ON dogs.dId = feeds.dId
                                            LEFT JOIN emergency ON dogs.dId = emergency.dId
                                            GROUP BY 
                                                dogs.dId, dogs.gps, dogs.dLat, dogs.dLong, dogs.dName, dogs.dStreet, dogs.dArea, dogs.dCity, dogs.dState, dogs.dImgData`;
;
                        db.query(dogsQuery,
                            (err,result)=>{
                                if(err){
                                    console.log(err);
                                    res.status(500).json({msg:'Database query failed',msg_type:"error"});
                                }
                                else{
                                    if(result.length==0){
                                        return res.status(404).json({msg:"No dogs found!",msg_type:"error"});
                                    }
                                    else{
                                        res.status(200).json({user:userInfo,dogs:result});
                                    }
                                }
                            }
                        )
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

exports.addEmergency = (req,res)=>{
    const {id} = req.user;
    const {dId,msg,gps} = req.body;
    if(req.user && dId && msg && gps){
        db.query("INSERT INTO emergency(uId,dId,message) VALUES(?,?,?)",
            [id,dId,msg],
           async(error,result)=>{
                if(error){
                    console.log(error);
                    res.status(500).json({msg:'Database query failed',msg_type:"error"});
                }
                else{
                    if(result.affectedRows >0){
                        const notificationQuery = 'INSERT INTO notifications(message,isDog,dId) VALUES(?,?,?)';
                        const message= `Dog ${gps} need medical emergency`;
                        const isDog= 1;
                        db.query(notificationQuery,
                            [message,isDog,dId],
                            (err,result)=>{
                                if(err){
                                    console.log(err);
                                    res.status(500).json({msg:'Database query failed',msg_type:"error"});
                                }
                                else{
                                    if(result.affectedRows >0){
                                        return res.status(200).json({msg:'Emergency message updated successfully',msg_type:"success"});
                                    }
                                    else{
                                        console.log(error);
                                        res.status(400).json({msg:'Dog emergency not updated',msg_type:"error"});
                                    }
                                   
                                }
                            }
                        )
                        
                    }
                    else{
                        return res.status(404).json({msg:'Dog not found',msg_type:"error"});
                    }

                }
            }
        )
    }
    else{
        if(!msg){
            return res.status(400).json({msg:"Please enter emergency status",msg_type:"error"})
        }
        else{
          return res.status(401).json({msg:"Un authorized access",msg_type:"error"});
        }
    }
}

exports.addFeed = (req,res)=>{
    const {id} = req.user;
    const {gps,dId} = req.body;
    if(req.user && gps && dId){
        db.query("INSERT INTO feeds(uId,dId) VALUES(?,?)",
            [id,dId],
           async(error,result)=>{
                if(error){
                    console.log(error);
                    res.status(500).json({msg:'Database query failed',msg_type:"error"});
                }
                else{
                    if(result.affectedRows >0){
                        const notificationQuery = 'INSERT INTO notifications(message,isDog,dId) VALUES(?,?,?)';
                        const message= `Dog ${gps} got food`;
                        const isDog= 1;
                        db.query(notificationQuery,
                            [message,isDog,dId],
                            (err,result)=>{
                                if(err){
                                    console.log(err);
                                    res.status(500).json({msg:'Database query failed',msg_type:"error"});
                                }
                                else{
                                    if(result.affectedRows >0){
                                        return res.status(200).json({msg:'Feeded successfully',msg_type:"success"});
                                    }
                                    else{
                                        console.log(error);
                                        res.status(400).json({msg:'Feeded failed',msg_type:"error"});
                                    }
                                   
                                }
                            }
                        )
                        
                    }
                    else{
                        return res.status(404).json({msg:'Dog not found',msg_type:"error"});
                    }

                }
            }
        )
    }
    else{
        return res.status(401).json({msg:"Un authorized access",msg_type:"error"});
    }
}


