import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { error } from 'console';

const __filename= fileURLToPath(import.meta.url);
const __dirname=dirname(__filename);
const filepath=path.join(__dirname,'../model/data.json');

export const index=async (req, res) => {
   
    const data = req.body;
    
    // Required fields check kar rahe hain proper validation ke saath
    if (!data.email || !data.password || !data.username || !data.role) {
        return res.status(400).send("Email, password, username, and role are required");
    }
    
    try{
        let fileData=[];
        try{
            let fileContent=  fs.readFileSync(filepath,'utf-8');
            fileData=JSON.parse(fileContent);
            const exist=fileData.find(user => user.email ===data.email);
            console.log(exist)
            if(exist)
            {
                return res.status(400).send("user already exist");
            }
        } catch (err) {
            
            
            console.error('File read karne ya parse karne mein error:', err);
        }

        fileData.push(data);
        console.log(fileData)
         fs.writeFile(filepath,JSON.stringify(fileData,null,2),(err)=>{
            console.log(err);
         });
        return res.status(201).send("User registered successfully");
    } catch (err) {
        console.error('Registration mein error:', err);
        return res.status(500).send("Internal server error");
    

}
 }
export const login = async (req, res) => {
    const { email, password, role } = req.body;

    // Required fields check kar rahe hain proper validation ke saath
    if (!email || !password || !role) {
        return res.status(400).send("Email, password and role are required");
    }

    try {
        const fileContent = fs.readFileSync(filepath, 'utf-8');
        const fileData = JSON.parse(fileContent);
        
        const user = fileData.find(u => u.email === email && u.password === password && u.role === role);

        if (!user) {
            return res.status(401).send("Invalid email, password or role");
        }
        
        // User ka data session mein store kar rahe hain
        req.session.user = {
            email: user.email,
            role: user.role,
            username: user.username
        };

        return res.status(200).send("Login successful");
    } catch (err) {
        console.error('Login mein error:', err);
        return res.status(500).send("Internal server error");
    }
};
