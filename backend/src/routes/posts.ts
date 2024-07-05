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

   const AvailableTags = await prisma.tags.findMany();
   const {title,body,tags}:SinglePostSchema = req.body;
   const TagsNeeded = AvailableTags.filter(t => {
         return tags.includes(t.tag);
   })
   // const AllPosts = await prisma.posts.findMany();
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
   // await prisma.tags.create({
   //    data:{
   //       tag: "sdlfc",
   //       adminId:1,
   //       posts:{
   //          create : AllPosts.map(t => ({
   //             post:{
   //                connect:{
   //                   id : t.id
   //                }
   //             }
   //          }))
   //       }
   //    }
   // })

   

   res.status(StatusCodes.OK).json({
      title: newPost.title
   })
})

PostsRouter.get('/:filter',authMiddleware,async (req:CustomRequest,res:Response) => {
   const filter = req.params.filter as string;
   const Id = req.id as string;
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
})

PostsRouter.put('/:postid',authMiddleware,async (req:CustomRequest,res:Response) => {
   const id = req.params.postid as string;
   const {title,body}:BodyType = req.body;
   const Id = req.id as string;
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
})

PostsRouter.delete('/:postid',authMiddleware,async (req:CustomRequest,res:Response) => {
   const Id = req.id as string;
   const id = req.params.postid as string;
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
})

export default PostsRouter;