import express from 'express';
import RootRouter from './routes';
import cors from 'cors'
import { prototype } from 'events';

const app = express();


app.use("/api/v1",RootRouter);
app.use(cors());

app.get('/',(req,res) => {
    res.json({
        message : "hello from index.ts"
    })
})

app.listen(5000,() => {
    console.log('running on port 5000');
})