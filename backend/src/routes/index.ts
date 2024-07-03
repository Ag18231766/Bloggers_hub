import express from 'express'
import UserRouter from './users';
import PostsRouter from './posts';
import TagRouter from './tags';

const RootRouter = express.Router();


RootRouter.use("/users",UserRouter);
RootRouter.use("/posts",PostsRouter);
RootRouter.use("/tags",TagRouter);



export default RootRouter;