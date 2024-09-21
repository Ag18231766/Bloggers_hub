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
const client_1 = require("@prisma/client");
const middleware_1 = require("../middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const StatusCodes_1 = __importDefault(require("../StatusCodes"));
const dotenv_1 = __importDefault(require("dotenv"));
const medium_type_1 = require("@amartya_gupta/medium_type");
const cors_1 = __importDefault(require("cors"));
const TagRouter = express_1.default.Router();
TagRouter.use(express_1.default.json());
TagRouter.use((0, cors_1.default)());
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
TagRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = medium_type_1.AdminZod.safeParse(req.body);
    if (!success) {
        return res.status(StatusCodes_1.default.NOT_FOUND).json({
            message: "admin credential invalid"
        });
    }
    const { name, password } = req.body;
    try {
        const AdminExist = yield prisma.admin.findFirst({
            where: {
                name: name,
                password: password
            },
            select: {
                id: true
            }
        });
        if (!AdminExist) {
            return res.status(StatusCodes_1.default.CONFLICT).json({
                message: "admin doesn't exist"
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: AdminExist.id }, process.env.JWT_PASSWORD);
        res.status(StatusCodes_1.default.OK).json({
            token: token
        });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
TagRouter.post("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.id;
    try {
        const AdminExist = yield prisma.admin.findFirst({
            where: {
                id: Number(Id)
            }
        });
        if (!AdminExist) {
            return res.status(StatusCodes_1.default.CONFLICT).json({
                message: "admin doesn't exist"
            });
        }
        const tagArr = req.body;
        yield prisma.admin.update({
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
        res.status(StatusCodes_1.default.OK).json({
            message: "tags added"
        });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
TagRouter.get("/tag", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tags = yield prisma.tags.findMany({
            select: {
                tag: true,
                id: true
            }
        });
        return res.status(StatusCodes_1.default.OK).json({
            arr: tags
        });
    }
    catch (error) {
        console.log(error);
        return res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
TagRouter.get("/:tagId/:page", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tagId = Number(req.params.tagId);
    const page = Number(req.params.page);
    let skipPosts;
    if (page > 0) {
        skipPosts = 10 * (page - 1);
    }
    else if (page == 0) {
        skipPosts = 0;
    }
    else {
        return res.status(StatusCodes_1.default.BADREQUEST).json({
            message: "page entered is negative"
        });
    }
    try {
        const posts = yield prisma.postTag.findMany({
            where: {
                tagId: tagId
            },
            select: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        body: true,
                        createdAt: true,
                        user: {
                            select: {
                                username: true
                            }
                        }
                    }
                }
            },
            take: 10,
            skip: skipPosts
        });
        const userPosts = posts.map((t) => t.post);
        res.json({
            userPosts
        });
    }
    catch (error) {
        console.log(error);
        return res.status(StatusCodes_1.default.BAD_GATEWAY).json({
            message: "can't connect to database"
        });
    }
}));
exports.default = TagRouter;
