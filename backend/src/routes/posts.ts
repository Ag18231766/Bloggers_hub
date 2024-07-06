import express,{Request,Response} from 'express';
import { CustomRequest, authMiddleware } from '../middleware';
import { Posts, PrismaClient } from '@prisma/client';
import z, { number } from 'zod';
import StatusCodes from '../StatusCodes';
import { create } from 'domain';

const PostsRouter = express.Router();
const prisma = new PrismaClient();

PostsRouter.use(express.json());

const PostsSchemaZod = z.object({
   id : z.number(),
   userId: z.number(),
   title: z.string(),
   body: z.string(),
   tags : z.string().array()
});


type PostsSchema = z.infer<typeof PostsSchemaZod>;
type UserPostsSchema = Pick<PostsSchema,'id'|'userId'|'title'|'body'>;
type AllpostsType = Pick<PostsSchema,'title'>;
type SinglePostSchema = Pick<PostsSchema,'title' | 'body' | 'tags'>;
type BodyType = Pick<PostsSchema,'title' | 'body' | 'userId'>




PostsRouter.get('/yourposts',authMiddleware,async (req:CustomRequest,res:Response) => {
   const Id = req.id as string;

   try{
      const UserPosts:{posts:UserPostsSchema[]} | null = await prisma.user.findFirst({
         where:{
            id:Number(Id)
         },
         select:{
            posts:true
         }
      })
   
      return res.json({
         userposts : UserPosts
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
          message : "can't connect to database"
      })
   }

   
})

PostsRouter.get('/allposts',authMiddleware,async (req:Request,res:Response) => {
   
   try{
      const AllPosts:AllpostsType[] = await prisma.posts.findMany();
      return res.json({
         posts : AllPosts
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
          message : "can't connect to database"
      })
   }
})

PostsRouter.post('/',authMiddleware,async (req:CustomRequest,res:Response) => {
   const Id = Number(req.id as string);
    
   if(!Id){
      return res.json({
         message : "not number"
      })
   }

   try{
      const AvailableTags = await prisma.tags.findMany();
      const {title,body,tags}:SinglePostSchema = req.body;
      const TagsNeeded = AvailableTags.filter(t => {
            return tags.includes(t.tag);
      })
      const newPost = await prisma.posts.create({
         data: {
            title,
            body,
            user: {
               connect: {
                  id: Number(Id)
               },
            },
            tags: {
               create: TagsNeeded.map(t => ({
                  tag: {
                    connect: {
                      id: t.id,
                    },
                  },
               })),
           },
         },
         include:{
            tags:true
         }
      });
   
      res.status(StatusCodes.OK).json({
         title: newPost.title
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
          message : "can't connect to database"
      })
   }
   
})

PostsRouter.get('/:filter',authMiddleware,async (req:CustomRequest,res:Response) => {
   const filter = req.params.filter as string;
   const Id = req.id as string;
   try{
      const post = await prisma.user.findFirst({
         where:{
            id:Number(Id)
         },
         select: {
            posts: {
              where: {
               title:{
                  contains: filter
               }
              },
              select: {
                id: true,
                title: true,
                body: true,
                tags: true
              }
            }
         }
      });
      if(!post){
         return res.json({
            message : "post doesn't exist"
         })
      }
      return res.json({
         post : post.posts
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
          message : "can't connect to database"
      })
   }
   
})

PostsRouter.put('/:postid',authMiddleware,async (req:CustomRequest,res:Response) => {
   const id = req.params.postid as string;
   const {title,body}:BodyType = req.body;
   const Id = req.id as string;
   try{
      const PostToUpdate = await prisma.posts.update({
         where:{
            id:Number(id),
            userId:Number(Id)
         },
         data:{
            title,
            body
         }
        
      })
      if(!PostToUpdate){
         return res.json({
            message : "post doesn't exist"
         })
      }
      return res.json({
         title : PostToUpdate.title,
         body:PostToUpdate.body
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
          message : "can't connect to database"
      })
   }
   
})

PostsRouter.delete('/:postid',authMiddleware,async (req:CustomRequest,res:Response) => {
   const Id = req.id as string;
   const id = req.params.postid as string;
   try{
      const IsOwner:UserPostsSchema | null = await prisma.posts.findFirst({
         where:{
            userId:{
               equals:Number(Id)
            },
            id:{
               equals:Number(id)
            }
         },
      })
      if(!IsOwner){
         return res.json({
            message : `you are the owner of the post with postId ${id}`
         })
      }
      await prisma.posts.delete({
         where:{
            id:Number(id),
            userId:Number(Id)
         }
      })
      return res.json({
         message : "post deleted successfully"
      })
   }catch(error){
      console.log(error);
      res.status(StatusCodes.BAD_GATEWAY).json({
          message : "can't connect to database"
      })
   }
   
})

export default PostsRouter;