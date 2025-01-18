const db = require('../db');


exports.volunteerList = async(req,res)=>{
    if(req.user){
        const list_query = "select uId as id,uName as identifier,TO_BASE64(uImgData) as img,CONCAT(uStreet,', ',uArea,', ',uCity,', ',uState,'.') as address,'user' as type from users";
        db.query(list_query,
            (err,result)=>{
                if(err){
                    console.log(err);
                    res.status(500).json({msg:'Database query failed',msg_type:"error"});
                }
                else{

                   return res.status(200).json(result);
                }
            }
        )
    }
    else{
        return res.status(401).json({msg:"Un authorized access",msg_type:"error"});
    }
}

exports.volunteerInfo =async(req,res)=>{
    const {id} = req.query;
    if(!id){
        return res.status(400).json({msg:'ID is required',msg_type:'error'});
    }
    else{
        const infoQuery = `
            SELECT JSON_OBJECT(
                'name', u.uName,
                'vaccine', CASE WHEN u.uVaccine = 1 THEN 'true' ELSE 'false' END,
                'street', u.uStreet,
                'area', u.uArea,
                'city', u.uCity,
                'state', u.uState,
                'imgData', TO_BASE64(u.uImgData),
                'total dogs fed', IFNULL((SELECT COUNT(f.fId) FROM feeds f WHERE f.uId = u.uId), 0)
            ) AS volunteerInformation
            FROM users u
            WHERE u.uId = ?
        `;
            db.query(infoQuery,
                [id],
                (err,result)=>{
                    if(err){
                        console.log(err);
                        res.status(500).json({msg:'Database query failed',msg_type:"error"});
                    }
                    else{
                        if(result.length==0){
                            return res.status(404).json({msg:"No volunteer found!",msg_type:"error"});
                        }
                        else{
                           return res.status(200).json(result[0].volunteerInformation);
                        }
                    }
                }
            )
    }
}

exports.setting = (req,res)=>{
    const {id} = req.query;
    db.query('SELECT uName as name, TO_BASE64(uImgData) as imgData FROM users where uId =?',
        [id],
        (error,result)=>{
            if(error){
                console.log(error);
                res.status(500).json({msg:'Database query failed',msg_type:"error"});
            }
            else{
                if(result.length>0){
                    return res.status(200).json(result[0]);
                }
                else{
                    return res.status(404).json({msg:'User not found',msg_type:"error"}); 
                }
            }
        }
    )
}

exports.settingInfo = async (req,res)=>{
    const {id} = req.user;
    if (!id) {
        return res.status(401).json({ msg: 'Unauthorized acces',msg_type:'error' });
      }
    else{
        const infoQuery = `
        SELECT JSON_OBJECT(
          'name',uName,
          'vaccine', CASE WHEN uVaccine = 1 THEN 'true' ELSE 'false' END,
          'street', uStreet,
          'area', uArea,
          'city', uCity,
          'state', uState,
          'email',email,
          'mobile',mobile,
          'imgData', TO_BASE64(uImgData)
        ) As userInformation
        FROM users
        WHERE uId= ?
      `; 
            db.query(infoQuery,
                [id],
                (err,result)=>{
                    if(err){
                        console.log(err);
                        res.status(500).json({msg:'Database query failed',msg_type:"error"});
                    }
                    else{
                        if(result.length==0){
                            return res.status(404).json({msg:"No user found!",msg_type:"error"});
                        }
                        else{
                           return res.status(200).json(result[0].userInformation);
                        }
                    }
                })
        
    }
}

exports.settingEdit = async (req,res)=>{
    const {...updatedData} = req.body;
    const{id}=req.user;
    const field = Object.keys(updatedData)[0];
    let value = updatedData[field];
    if(field=='uImgData'){
        const base64Data = updatedData[field];
        value = Buffer.from(base64Data, 'base64');
        console.log(value);
    }
    const editQuery = `UPDATE users SET ${field} = ? WHERE uId =?`;
    db.query(editQuery,
        [value,id],
        (err,result)=>{
            if(err){
                console.log(err);
                res.status(500).json({msg:'Failed to update user',msg_type:"error"});
            }
            else{
              if(result.affectedRows >0){
                return res.status(200).json({msg:'User updated successfully!',msg_type:"success"});
              }
              else{
                return res.status(404).json({msg:'User not found',msg_type:"error"});
              }
              
            }
        }
    )

}