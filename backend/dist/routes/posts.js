"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const client_1 = require("@prisma/client");
const StatusCodes_1 = __importDefault(require("../StatusCodes"));
const cors_1 = __importDefault(require("cors"));
const PostsRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
PostsRouter.use(express_1.default.json());
PostsRouter.use((0, cors_1.default)());
PostsRouter.get('/yourposts', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.id;
    try {
        const UserPosts = yield prisma.user.findFirst({
            where: {
                id: Number(Id)
            },
            select: {
                username: true,
                posts: {
                    select: {
                        title: true,
                        body: true,
                        createdAt: true
                    }
                }
            }
        });
        return res.json({
            userposts: UserPosts
        });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
PostsRouter.get('/allposts/:title/:page', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.params.page);
    const title = req.params.title;
    let SkipPosts;
    if (page != 0) {
        SkipPosts = 10 * (page - 1);
    }
    else {
        SkipPosts = 0;
    }
    try {
        const AllPosts = yield prisma.posts.findMany({
            take: 10,
            skip: SkipPosts,
            where: {
                title: {
                    contains: title
                }
            }
        });
        return res.json({
            posts: AllPosts
        });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
PostsRouter.post('/', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = Number(req.id);
    if (!Id) {
        return res.json({
            message: "not number"
        });
    }
    try {
        const AvailableTags = yield prisma.tags.findMany();
        const { title, body, tags } = req.body;
        const TagsNeeded = AvailableTags.filter(t => {
            return tags.includes(t.tag);
        });
        const newPost = yield prisma.posts.create({
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
            include: {
                tags: true
            }
        });
        res.status(StatusCodes_1.default.OK).json({
            title: newPost.title
        });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
PostsRouter.get('/:filter', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = req.params.filter;
    const Id = req.id;
    try {
        const post = yield prisma.user.findFirst({
            where: {
                id: Number(Id)
            },
            select: {
                posts: {
                    where: {
                        title: {
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
        if (!post) {
            return res.json({
                message: "post doesn't exist"
            });
        }
        return res.json({
            post: post.posts
        });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
PostsRouter.put('/:postid', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.postid;
    const { title, body } = req.body;
    const Id = req.id;
    try {
        const PostToUpdate = yield prisma.posts.update({
            where: {
                id: Number(id),
                userId: Number(Id)
            },
            data: {
                title,
                body
            }
        });
        if (!PostToUpdate) {
            return res.json({
                message: "post doesn't exist"
            });
        }
        return res.json({
            title: PostToUpdate.title,
            body: PostToUpdate.body
        });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
PostsRouter.delete('/:postid', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.id;
    const id = req.params.postid;
    try {
        const IsOwner = yield prisma.posts.findFirst({
            where: {
                userId: {
                    equals: Number(Id)
                },
                id: {
                    equals: Number(id)
                }
            },
        });
        if (!IsOwner) {
            return res.json({
                message: `you are the owner of the post with postId ${id}`
            });
        }
        yield prisma.posts.delete({
            where: {
                id: Number(id),
                userId: Number(Id)
            }
        });
        return res.json({
            message: "post deleted successfully"
        });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
exports.default = PostsRouter;
