"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use("/api/v1", routes_1.default);
app.use(cors_1.default);
app.get('/', (req, res) => {
    res.json({
        message: "hello from index.ts"
    });
});
app.listen(5000, () => {
    console.log('running on port 5000');
});
