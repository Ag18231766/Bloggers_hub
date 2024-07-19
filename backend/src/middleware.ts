import StatusCodes from './StatusCodes';
import { Request,Response,NextFunction, response } from "express";
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import JWT_PASSWORD from "./config";
import { any, object, string } from "zod";



interface UserPayload extends JwtPayload{
    id: string
}

interface CustomRequest extends Request {
    id?: string;
    token?: string;
}

const authMiddleware = (req:CustomRequest,res:Response,next:NextFunction) => {

    const {authheader} = req.headers;

    if(!authheader || Array.isArray(authheader)){
        res.json({
            message : 'authorization key not found'
        })
        return;
    }

    
    const token:string = authheader.split(' ')[1];

    try{
    
        const decoded = jwt.verify(token,JWT_PASSWORD) as UserPayload;
    
        
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