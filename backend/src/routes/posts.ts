import express,{Request,Response} from 'express';
import { CustomRequest, authMiddleware } from '../middleware';
import { PrismaClient } from '@prisma/client';
import z, { number } from 'zod';
import StatusCodes from '../StatusCodes';

const PostsRouter = express.Router();
const prisma = new PrismaClient();

PostsRouter.use(express.json());

const PostsSchemaZod = z.object({
   id : z.number(),
   userId: z.number(),
   title: z.string(),
   Content: z.string(),
});

type PostsSchema = z.infer<typeof PostsSchemaZod>;
type AllpostsType = Pick<PostsSchema,'title'>;
type SinglePostSchema = Pick<PostsSchema,'title' | 'Content'>;
type BodyType = Pick<PostsSchema,'title' | 'Content' | 'userId'>

PostsRouter.get('/yourposts',async (req:CustomRequest,res:Response) => {
   const Id = req.id as string;
   const UserPosts:AllpostsType[] = await prisma.posts.findMany({
      where:{
         userId:Number(Id)
      },
      select:{
         title:true
      }
   })

   return res.json({
      userposts : UserPosts
   })
})

PostsRouter.get('/allposts',authMiddleware,async (req:Request,res:Response) => {
   const AllPosts:AllpostsType[] = await prisma.posts.findMany();
   return res.json({
      posts : AllPosts
   })
})

PostsRouter.post('/',authMiddleware,async (req:CustomRequest,res:Response) => {
   const Id = Number(req.id as string);
    
   if(!Id){
      return res.json({
         message : "not number"
      })
   }
   const {title,Content}:SinglePostSchema = req.body;
   const NewPost:AllpostsType = await prisma.posts.create({
      data:{
         userId:Id,
         title:title,
         Content:Content
      },
      select:{
         title:true
      }
   })
   res.status(StatusCodes.OK).json({
      title:NewPost.title
   })
})

PostsRouter.get('/:id',authMiddleware,async (req:Request,res:Response) => {
   const id = req.params.id as string;
   const post:SinglePostSchema | null = await prisma.posts.findFirst({
      select:{
         title:true,
         Content:true
      },
      where:{
         id:Number(id)
      }
   })
   if(!post){
      return res.json({
         message : "post doesn't exist"
      })
   }
   return res.json({
      title : post.title,
      Content:post.Content
   })
})

PostsRouter.put('/:postid',authMiddleware,async (req:CustomRequest,res:Response) => {
   const id = req.params.postid as string;
   const {title,Content}:BodyType = req.body;
   const Id = req.id as string;
   const PostToUpdate = await prisma.posts.update({
      where:{
         id:Number(id),
         userId:Number(Id)
      },
      data:{
         title,
         Content
      }
     
   })
   if(!PostToUpdate){
      return res.json({
         message : "post doesn't exist"
      })
   }
   return res.json({
      title : PostToUpdate.title,
      Content:PostToUpdate.Content
   })
})

PostsRouter.delete('/:postid',authMiddleware,async (req:CustomRequest,res:Response) => {
   const Id = req.id as string;
   const id = req.params.postid as string;
   const IsOwner:PostsSchema | null = await prisma.posts.findFirst({
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
})

export default PostsRouter;