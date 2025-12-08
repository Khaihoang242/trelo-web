/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import exitHook from "async-exit-hook";
import { CONNECT_DB, GET_DB } from "~/config/mongodb";
import { env } from "~/config/environment";
import { APIs_V1 } from "~/routes/v1";
import { errorHandlingMiddleware } from "~/middlewares/errorHandlingMiddleware";
import cookieParser from "cookie-parser";
import socketIo from "socket.io";
import http from 'http'
import { inviteUserToBoardSocket } from "./sockets/inviteUserToBoardSocket";
const STAR_SERVER = () => {
  const app = express();
  //fix vu Cache from disk cua expressJs
  app.use((req,res,next) =>{
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Cau hinh cookie parser
  app.use(cookieParser())
  //xu li cors
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/v1", APIs_V1);
  // middleware xu li loi tap trung
  app.use(errorHandlingMiddleware);
  // tao mot cai server mot boc app cuar express de lam real-time voi socket io
  const server = http.createServer(app)
  // Khoi tao bien io voi server vaf cors 
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    // goi cac socket theo tinh nang 
    inviteUserToBoardSocket(socket)
  })
  server.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Hello ${env.AUTHOR} Dev, I am running at ${env.APP_HOST}:${env.APP_PORT}/`
    );
  });
  exitHook(() => {
    console.log("Exit app");
  });
};
CONNECT_DB()
  .then(() => console.log("Connected to MongoDb Cloud Atlas"))
  .then(() => STAR_SERVER())
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });
