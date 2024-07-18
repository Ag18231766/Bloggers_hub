"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./users"));
const posts_1 = __importDefault(require("./posts"));
const tags_1 = __importDefault(require("./tags"));
const cors_1 = __importDefault(require("cors"));
const RootRouter = express_1.default.Router();
RootRouter.use("/users", users_1.default);
RootRouter.use("/posts", posts_1.default);
RootRouter.use("/tags", tags_1.default);
RootRouter.use((0, cors_1.default)());
exports.default = RootRouter;
