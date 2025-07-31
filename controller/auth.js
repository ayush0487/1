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
            
            console.error('Error reading or parsing file:', err);
        }
        fileData.push(data);
        console.log(fileData)
         fs.writeFile(filepath,JSON.stringify(fileData,null,2),(err)=>{
            console.log(err);
         });
        return res.status(201).send("User registered successfully");
    } catch (err) {
        console.error('Error in registration:', err);
        return res.status(500).send("Internal server error");
    

}
 }
export const login = async (req, res) => {
    const { email, password, role } = req.body;

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
        
        // Store user data in session
        req.session.user = {
            email: user.email,
            role: user.role,
            username: user.username
        };

        return res.status(200).send("Login successful");
    } catch (err) {
        console.error('Error in login:', err);
        return res.status(500).send("Internal server error");
    }
};
