const db = require('../db');

exports.dashboardCounts = async(req,res)=>{
    if(req.user){
        const dashCountQuery = `SELECT JSON_OBJECT(
                                    "dc", (SELECT COUNT(*) FROM dogs),
                                    "vc", (SELECT COUNT(*) FROM users),
                                    "fc", (SELECT COUNT(DISTINCT dId) FROM feeds WHERE DATE(date_time) = CURRENT_DATE),
                                    "nfc", ((SELECT COUNT(*) FROM dogs) - (SELECT COUNT(DISTINCT dId) FROM feeds WHERE DATE(date_time) = CURRENT_DATE)),
                                    "pfc", CASE
                                            WHEN (SELECT COUNT(*) FROM dogs) = 0 THEN 0
                                            ELSE ROUND(
                                                ((SELECT COUNT(DISTINCT dId) FROM feeds WHERE DATE(date_time) = CURRENT_DATE) /
                                                (SELECT COUNT(*) FROM dogs)) * 100
                                            )
                                        END
                                ) AS dashboardStats;`
                                 
        db.query(dashCountQuery,
                (err,result)=>{
                    if(err){
                        console.log(err);
                        return  res.status(500).json({msg:'Failed to load dashboard details',msg_type:"error"});
                    }
                    else{
                        if(result.length==0){
                            return res.status(404).json({msg:"No Datas!",msg_type:"error"});
                        }
                        else{
                           return res.status(200).json(result[0].dashboardStats);
                        }
                    }
                }
        )       
    }
    else{
        console.log(req.user);
        return res.status(401).json({msg:"Un authorized access",msg_type:"error"});
    }

}

exports.dashboardWeekReport = async (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        return res.status(400).json({ msg: 'From date and to date are required', msg_type: 'error' });
    } else {

        const reportQuery = `WITH RECURSIVE date_range AS (
                                SELECT ? AS fd
                                UNION ALL
                                SELECT fd + INTERVAL 1 DAY
                                FROM date_range
                                WHERE fd <= ?
                            )
                            SELECT 
                                dr.fd,
                                COALESCE(COUNT(DISTINCT f.dId), 0) AS fc
                            FROM date_range dr
                            LEFT JOIN feeds f
                                ON DATE(f.date_time) = dr.fd
                            WHERE dr.fd >= ? AND dr.fd <= ?
                            GROUP BY dr.fd
                            ORDER BY dr.fd ASC`;

        db.query(reportQuery, [from,to,from,to], (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ msg: 'Failed to load weekly report', msg_type: 'error' });
            } else {
                if (result.length === 0) {
                    return res.status(404).json({ msg: 'No Data!', msg_type: 'error' });
                } else {
                    return res.status(200).json(result);
                }
            }
        });
    }
};

