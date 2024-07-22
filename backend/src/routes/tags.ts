import express,{Request,Response} from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomRequest, authMiddleware } from '../middleware';
import {z} from "zod";
import jwt from "jsonwebtoken";
import StatusCodes from '../StatusCodes';
import JWT_PASSWORD from '../config';
import { STATUS_CODES } from 'http';
import {AdminZod} from "@amartya_gupta/medium_type";
import cors from 'cors';



const TagRouter = express.Router();
TagRouter.use(express.json());
TagRouter.use(cors());

const prisma = new PrismaClient();



type AdminZodType = z.infer<typeof AdminZod>;

TagRouter.post("/signin",async (req:Request,res:Response) => {
    const {success} = AdminZod.safeParse(req.body);
    if(!success){
        return res.status(StatusCodes.NOT_FOUND).json({
            message : "admin credential invalid"
        })
    }
    const {name,password}:AdminZodType = req.body;
    try{
        const AdminExist = await prisma.admin.findFirst({
            where:{
                name:name,
                password:password
            },
            select:{
                id:true
            }
        })
        if(!AdminExist){
            return res.status(StatusCodes.CONFLICT).json({
                message : "admin doesn't exist"
            })
        }
        const token = jwt.sign({id:AdminExist.id},JWT_PASSWORD);
        res.status(StatusCodes.OK).json({
            token : token
        });
    }catch(error){
        console.log(error);
        res.status(StatusCodes.BAD_GATEWAY).json({
            message : "can't connect to database"
        })
    }
})

TagRouter.post("/",authMiddleware,async (req:CustomRequest,res:Response) => {
    const Id:string = req.id as string;
    try{
        const AdminExist = await prisma.admin.findFirst({
            where:{
                id:Number(Id)
            }
        })
        if(!AdminExist){
            return res.status(StatusCodes.CONFLICT).json({
                message : "admin doesn't exist"
            })
        }
        const tagArr:{arr:string[]} = req.body as {arr:string[]};
        await prisma.admin.update({
            where: {
              id: Number(Id),
            },
            data: {
              tag: {
                // Connect the existing tags 
                connect: [],
                // Connect the new tags
                connectOrCreate: tagArr.arr.map(tag => ({
                  where: { tag },
                  create: { tag },
                })),
              },
            },
        });
    
    
        
        res.status(StatusCodes.OK).json({
            message : "tags added"
        })    
    }catch(error){
        console.log(error);
        res.status(StatusCodes.BAD_GATEWAY).json({
            message : "can't connect to database"
        })
    }
})

TagRouter.get("/tag",authMiddleware,async (req:Request,res:Response) => {
    try{
        const tags:{tag:string}[] = await prisma.tags.findMany({
            select:{
                tag:true
            }
        });
        return res.status(StatusCodes.OK).json({
            arr:tags
        })
    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_GATEWAY).json({
            message: "can't connect to database"
        })
    }

})





export default TagRouter;