const crypto = require("crypto");

const secretkey = process.env.SECRET_KEY;
const iv = crypto.randomBytes(10);

const encrypt = (data)=>{
    const cipher = crypto.createCipheriv("aes-256-ccm",Buffer.from(secretkey),iv);
    let encrypted = cipher.update(data,'utf-8',"hex");
    encrypted += cipher.final("hex");
    return { iv : iv.toString("hex"), encryptedData:encrypted}
}

const decrypt = (encryptedData,iv) =>{
    const decipher = crypto.createDecipheriv("aes-256-ccm",Buffer.from(secretkey),Buffer.from(iv,"hex"));
    let decrypted = decipher.update(encryptedData,"hex","utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
};

module.exports = {encrypt,decrypt};