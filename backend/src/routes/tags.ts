import express,{Request,Response} from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomRequest, authMiddleware } from '../middleware';
import {z} from "zod";
import jwt from "jsonwebtoken";
import StatusCodes from '../StatusCodes';
import JWT_PASSWORD from '../config';
const TagRouter = express.Router();
TagRouter.use(express.json());

const prisma = new PrismaClient();

const AdminZod = z.object({
    name:z.string(),
    password:z.string().min(8)
});

TagRouter.post("/signin",async (req:Request,res:Response) => {
    const {success} = AdminZod.safeParse(req.body);
    if(!success){
        return res.status(StatusCodes.NOT_FOUND).json({
            message : "admin credential invalid"
        })
    }
    const {name,password} = req.body;
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
})

TagRouter.post("/",authMiddleware,async (req:CustomRequest,res:Response) => {
    const Id:string = req.id as string;
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
    await prisma.tags.updateMany({
        where:{
            tag:{in:tagArr.arr}
        },
        data:{
            adminId:Number(Id)
        }
    })
    res.status(StatusCodes.OK).json({
        message : "tags added"
    })
})





export default TagRouter;