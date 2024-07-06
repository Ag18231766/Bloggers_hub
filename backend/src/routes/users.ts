import express,{Response,Request} from 'express';
import z from 'zod';
import jwt from 'jsonwebtoken';
import StatusCodes from '../StatusCodes';
import { PrismaClient } from '@prisma/client';
import JWT_PASSWORD from '../config';
import { CustomRequest, UserPayload, authMiddleware } from '../middleware';
import { STATUS_CODES } from 'http';



const UserRouter = express.Router();
const prisma = new PrismaClient();


// middlewares
UserRouter.use(express.json());


// zod definitions

const SignUpUserSchema = z.object({
   id : z.number(),
   email : z.string().email(),
   username : z.string(),
   password : z.string().min(8)
})
const SignInUserSchema = SignUpUserSchema.pick({'email':true,'password':true})


// type definitions

 

type SignUpUserSchemaType = z.infer<typeof SignUpUserSchema>;
type SignInUserSchema = z.infer<typeof SignInUserSchema>;
type NewUserType = Pick<SignUpUserSchemaType,"id">;






// routehandlers




UserRouter.post('/signup',async (req:Request,res:Response)=> {
   
   const {success} = SignUpUserSchema.partial({id:true}).safeParse(req.body);
   
   if(!success){
      return res.status(StatusCodes.BADREQUEST).json({
         message : "either email doesn't exist or password isn't of 8 characters"
      })
   }
   const {username,email,password} = req.body;

   try{
      const UserExist:SignUpUserSchemaType | null = await prisma.user.findFirst({
         where : {
            email:email
         }
      })
      
      if(UserExist){
         return res.status(StatusCodes.CONFLICT).json({
            message: "User with these credentials already exits"
         })
      }
      const newUser:NewUserType = await prisma.user.create({
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

   if(!Id){
      return res.json({
         message : 'id not defined'
      })
   }
   try{
      const UserExist:NewUserType | null = await prisma.user.findFirst({
         where:{
            id:Number(Id)
         },
         select:{
            id:true
         }
      })
      if(!UserExist){
         return res.status(StatusCodes.NOT_FOUND).json({
            message : "user doesn't exist"
         })
      }
      const token = jwt.sign({id:Id},JWT_PASSWORD);
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
UserRouter.post('/signinPassword',async (req:Request,res:Response) => {
   const {email,password}:SignInUserSchema = req.body;
   try{
      const UserExist:NewUserType | null = await prisma.user.findFirst({
         where:{
            email:email,
            password:password
         },
         select:{
            id:true
         }
      })
      if(!UserExist){
         return res.json({
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