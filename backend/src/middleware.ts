import StatusCodes from './StatusCodes';
import { Request,Response,NextFunction, response } from "express";
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { any, object, string } from "zod";

dotenv.config();

interface UserPayload extends JwtPayload{
    id: string
}

interface CustomRequest extends Request {
    id?: string;
    token?: string;
}

const authMiddleware = (req:CustomRequest,res:Response,next:NextFunction) => {

    const {authheader} = req.headers;

    // console.log(authheader);
    if(!authheader || Array.isArray(authheader)){
        res.json({
            message : 'authorization key not found'
        })
        return;
    }
    // console.log('hello');

    
    const token:string = authheader.split(' ')[1];
    // console.log(token);

    try{
        console.log(process.env.JWT_PASSWORD);
        const decoded = jwt.verify(token,process.env.JWT_PASSWORD as string) as UserPayload;
    
        // console.log(decoded + "josd");
        if(decoded){
            req.id = decoded.id;
            req.token = token;
            next();
        }else{
            res.json({
                message : "you don't have an account"
            })
        }
    }catch(err){
        return res.status(StatusCodes.FORBIDDEN).json({});
    }
    

}


export  {authMiddleware,CustomRequest,UserPayload};