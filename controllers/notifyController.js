const db = require('../db');

exports.notificationList = (req,res)=>{
    if(req.user){
        const list_query =` SELECT 
                            nId AS id,
                            message AS identifier,
                            TO_BASE64(
                            CASE 
                                WHEN isDog = 1 THEN (SELECT dImgData FROM dogs WHERE dogs.dId = notifications.dId)
                                ELSE (SELECT uImgData FROM users WHERE users.uId = notifications.uId)
                            END
                            ) AS img,
                            DATE_FORMAT(created_at, '%b %d') AS address, 
                            'Notification' AS type
                            FROM 
                            notifications 
                            ORDER BY 
                            created_at DESC`;
        db.query(list_query,
           async(err,result)=>{
                if(err){
                    console.log(err);
                 return  res.status(500).json({msg:'Failed to load notifactions',msg_type:"error"});
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

exports.emergencyList = (req,res)=>{
    if(req.user){
        const emergencyQuery = `SELECT
                                e.emId AS id,
                                CONCAT(d.dName,'*',u.uName) AS identifier,
                                CONCAT (e.message,'*',
                                    CASE
                                        WHEN TIMESTAMPDIFF(MINUTE, e.date_time, NOW()) < 60 THEN 
                                            CONCAT(TIMESTAMPDIFF(MINUTE, e.date_time, NOW()), ' min ago')
                                        WHEN TIMESTAMPDIFF(HOUR, e.date_time, NOW()) < 24 THEN
                                            CONCAT (TIMESTAMPDIFF(HOUR, e.date_time, NOW()), ' hr ago')
                                        WHEN DATE(e.date_time) = DATE(NOW() - INTERVAL 1 DAY) THEN
                                            'Yesterday'
                                        ELSE
                                            DATE_FORMAT(e.date_time, '%b %d')
                                    END
                                ) AS address,
                                TO_BASE64(d.dImgData) AS img,
                                'Emergency' AS type
                            FROM 
                                emergency e
                            JOIN
                                dogs d ON e.dId = d.dId
                            JOIN
                                users u ON e.uId = u.uId
                            ORDER BY
                                e.date_time DESC `;
        db.query(emergencyQuery,
           async(error,result)=>{
                if(error){
                    console.log(error);
                   return res.status(500).json({msg:'Failed to load notifcations',msg_type:"error"});
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

