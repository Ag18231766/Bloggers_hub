import express,{Response,Request} from 'express';
import z from 'zod';
import jwt from 'jsonwebtoken';
import StatusCodes from '../StatusCodes';
import { PrismaClient } from '@prisma/client';
import JWT_PASSWORD from '../config';
import { CustomRequest, UserPayload, authMiddleware } from '../middleware';



const UserRouter = express.Router();
const prisma = new PrismaClient();


// middlewares
UserRouter.use(express.json());


// zod definitions

const SignUpUserSchema = z.object({
   id : z.number(),
   email : z.string().email(),
   userName : z.string(),
   password : z.string().min(8)
})
const SignInUserSchema = SignUpUserSchema.pick({'email':true,'password':true})


// type definitions

 

type SignUpUserSchemaType = z.infer<typeof SignUpUserSchema>;
type SignInUserSchema = z.infer<typeof SignInUserSchema>;
type NewUserType = Pick<SignUpUserSchemaType,"id">;






// routehandlers


UserRouter.get('/',(req,res) => {
   return res.json({
      message : "hello from userRouter"
   })
})

UserRouter.post('/signup',async (req:Request,res:Response)=> {
   
   const {success} = SignUpUserSchema.partial({id:true}).safeParse(req.body);
   
   if(!success){
      return res.status(StatusCodes.BADREQUEST).json({
         message : "either email doesn't exist or password isn't of 8 characters"
      })
   }
   const {userName,email,password} = req.body;
   
   const UserExist:SignUpUserSchemaType | null = await prisma.users.findFirst({
      where : {
         email:email
      }
   })
   
   if(UserExist){
      return res.status(StatusCodes.CONFLICT).json({
         message: "User with these credentials already exits"
      })
   }
   const newUser:NewUserType = await prisma.users.create({
      data:{
         userName,
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
})


UserRouter.post('/signin',authMiddleware,async (req:CustomRequest,res:Response) => {
   const Id = req.id as string;

   if(!Id){
      return res.json({
         message : 'id not defined'
      })
   }
   const UserExist:NewUserType | null = await prisma.users.findFirst({
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
})
UserRouter.post('/signinPassword',async (req:Request,res:Response) => {
   const {email,password}:SignInUserSchema = req.body;
   console.log(req.body);
   const UserExist:NewUserType | null = await prisma.users.findFirst({
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

})


export default UserRouter;