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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function temp(user, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const tags = yield prisma.user.create({
            data: {
                username: user,
                email: email,
                password: password
            }
        });
    });
}
function insertion() {
    for (let j = 0; j < 10000; j++) {
        temp(String(j), String(j) + "@gmail.com", "randomPassword");
    }
}
insertion();
// 21056 - 31055
// async function temp():Promise<void>{
//     const email = 'emelie@prisma.io'
//     const result = await prisma.$queryRaw`SELECT * FROM User WHERE email = ${email}`
//     // await prisma.user.findMany({
//     //     where:{
//     //         id:50004,
//     //     },
//     //     select:{
//     //         posts:{
//     //             select:{
//     //                 title:true
//     //             },
//     //             orderBy:
//     //         }
//     //     }
//     // })
// }
// temp();
// console.log('hi');
