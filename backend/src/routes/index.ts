import express from 'express'
import UserRouter from './users';
import PostsRouter from './posts';

const RootRouter = express.Router();


RootRouter.use("/users",UserRouter);
RootRouter.use("/posts",PostsRouter);




export default RootRouter;