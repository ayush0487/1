import express from 'express'
import mainRouter from "./routers/index.js";
import fs from 'fs';
import session from 'express-session';

const app = express()
const port = 3000

app.use(express.json());
app.use(express.static('public'));
// app.get('/',(req,res)=>{
//   res.send("h11");


// })

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'frgthyjukilo;pddfcgvhbnjkm,l;.ghjkl;',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));
app.use('/',mainRouter);


app.get('/data', (req, res) => {
  fs.readFile('./model/data.json', 'utf8', (err, data) => {
    if (err) {    
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Failed to read data' });
    } else {
      data = JSON.parse(data);
      let data1 = [];
      data1 = data.filter(item => item.role == "user" );
      res.json(data1);
    }
  });
});

app.listen(port,() => {
  console.log(`Server running at http://localhost:${port}`)
})
