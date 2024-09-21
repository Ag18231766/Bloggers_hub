import express,{Response,Request} from 'express';
import z, { string } from 'zod';
import jwt from 'jsonwebtoken';
import StatusCodes from '../StatusCodes';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { CustomRequest, UserPayload, authMiddleware } from '../middleware';
import { STATUS_CODES } from 'http';
import {SignUpUserSchema,SignInUserSchema} from '@amartya_gupta/medium_type';
import cors from 'cors';


const UserRouter = express.Router();
const prisma = new PrismaClient();


// middlewares
UserRouter.use(express.json());
UserRouter.use(cors());
dotenv.config();






// type definitions

 
type UserSchema = z.infer<typeof SignUpUserSchema>;
type SignUpUserSchemaType = Pick<UserSchema,"email"|"password"|"username">;
type SignInUserSchemaType = z.infer<typeof SignInUserSchema>;

const TagsInput = z.object({
   tagArr : z.array(z.string())
})





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
      const token = jwt.sign(payload, process.env.JWT_PASSWORD as string);
      
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
   console.log(email + " " + password);
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
      const token = jwt.sign({id:UserExist.id},process.env.JWT_PASSWORD as string);
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

UserRouter.put('/postTags',authMiddleware,async (req:CustomRequest,res:Response) => {
   const Id = Number((req.id as string));
   const {success} = TagsInput.safeParse(req.body);
   if(!success){
      return res.json({
         message : "either no tag selected or wrong input sent"
      })
   }
   const {tagArr} = req.body;
   
   console.log(tagArr);
   try{
      const User = await prisma.user.update({
         select:{
            id:true
         },
         data:{
            tags:{
               push:tagArr
            }
         },
         where:{
            id:Id
         }
      })
      if(!User){
         res.json({
            message:"user doesn't exist"
         })
      }
      return res.json({
         message:'tags added successfully'
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
         mesage : "database is not up"
      })
   }
})


export default UserRouter;