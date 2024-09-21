import express,{Request,Response} from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomRequest, authMiddleware } from '../middleware';
import {z} from "zod";
import jwt from "jsonwebtoken";
import StatusCodes from '../StatusCodes';
import dotenv from 'dotenv';
import { STATUS_CODES } from 'http';
import {AdminZod} from "@amartya_gupta/medium_type";
import cors from 'cors';



const TagRouter = express.Router();
TagRouter.use(express.json());
TagRouter.use(cors());
dotenv.config();

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
        const token = jwt.sign({id:AdminExist.id},process.env.JWT_PASSWORD as string);
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
        const tags:{tag:string,id:number}[] = await prisma.tags.findMany({
            select:{
                tag:true,
                id:true
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

TagRouter.get("/:tagId/:page",authMiddleware,async (req:CustomRequest,res:Response) => {
    const tagId = Number(req.params.tagId);
    const page = Number(req.params.page as string);
    let skipPosts;
    if(page > 0){
        skipPosts = 10 * (page - 1);
    }else if(page == 0){
        skipPosts = 0;
    }else{
        return res.status(StatusCodes.BADREQUEST).json({
            message:"page entered is negative"
        })
    }
    try{
        const posts = await prisma.postTag.findMany({
            where:{
                tagId:tagId
            },
            select:{
                post:{
                    select:{
                        id:true,
                        title:true,
                        body:true,
                        createdAt:true,
                        user:{
                            select:{
                                username:true
                            }
                        }
                    }
                }
            },
            take:10,
            skip:skipPosts

        })
        const userPosts = posts.map((t) => t.post);
        res.json({
            userPosts
        })

    }catch(error){
        console.log(error);
        return res.status(StatusCodes.BAD_GATEWAY).json({
            message: "can't connect to database"
        })
    }
})





export default TagRouter;