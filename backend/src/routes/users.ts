import express,{Response,Request} from 'express';
import z from 'zod';
import jwt from 'jsonwebtoken';
import StatusCodes from '../StatusCodes';
import { PrismaClient } from '@prisma/client';
import JWT_PASSWORD from '../config';
import { CustomRequest, UserPayload, authMiddleware } from '../middleware';
import { STATUS_CODES } from 'http';
import {SignUpUserSchema,SignInUserSchema} from '@amartya_gupta/medium_type';
import cors from 'cors';


const UserRouter = express.Router();
const prisma = new PrismaClient();


// middlewares
UserRouter.use(express.json());
UserRouter.use(cors());






// type definitions

 
type UserSchema = z.infer<typeof SignUpUserSchema>;
type SignUpUserSchemaType = Pick<UserSchema,"email"|"password"|"username">;
type SignInUserSchemaType = z.infer<typeof SignInUserSchema>;






// routehandlers




UserRouter.post('/signup',async (req:Request,res:Response)=> {
   


   
   const {success} = SignUpUserSchema.partial({id:true}).safeParse(req.body);
   
   
   if(!success){
      return res.status(StatusCodes.OK).json({
         message : "either email doesn't exist or password isn't of 8 characters"
      })
   }
   const {username,email,password}:SignUpUserSchemaType = req.body;
   
   try{
      const UserExist = await prisma.user.findFirst({
         where : {
            email:email
         }
      })
      
      if(UserExist){
         return res.status(StatusCodes.OK).json({
            message: "User with these credentials already exits"
         })
      }
      const newUser = await prisma.user.create({
         data:{
            username,
            email,
            password
         },
         select:{
            id:true
         }
      })
      const payload: UserPayload = { id: newUser.id.toString() };
      const token = jwt.sign(payload, JWT_PASSWORD);
      
      return res.json({
         token : token
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
         mesage : "database is not up"
      })
   }
   
   
})


UserRouter.post('/signin',authMiddleware,async (req:CustomRequest,res:Response) => {
   const Id = req.id as string;
   const token = req.token as string;
   if(!Id){
      return res.json({
         message : 'id not defined'
      })
   }
   try{
      const UserExist = await prisma.user.findFirst({
         where:{
            id:Number(Id)
         },
         select:{
            username:true
         }
      })
      if(!UserExist){
         return res.status(StatusCodes.OK).json({
            message : "user doesn't exist"
         })
      }
      return res.json({
         token : token,
         username:UserExist.username
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
         mesage : "database is not up"
      })
   }
   
})
UserRouter.post('/signinPassword',async (req:Request,res:Response) => {
   const {email,password}:SignInUserSchemaType = req.body;
   try{
      const UserExist = await prisma.user.findFirst({
         where:{
            email:email,
            password:password
         },
         select:{
            id:true
         }
      })
      if(!UserExist){
         return res.status(StatusCodes.OK).json({
            message : "user doesn't exist"
         })
      }
      const token = jwt.sign({id:UserExist.id},JWT_PASSWORD);
      return res.json({
         token : token
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
         mesage : "database is not up"
      })
   }
   

})


export default UserRouter;