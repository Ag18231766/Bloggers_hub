import express from 'express'
import UserRouter from './users';
import PostsRouter from './posts';
import TagRouter from './tags';
import cors from 'cors';

const RootRouter = express.Router();


RootRouter.use("/users",UserRouter);
RootRouter.use("/posts",PostsRouter);
RootRouter.use("/tags",TagRouter);
RootRouter.use(cors());




export default RootRouter;