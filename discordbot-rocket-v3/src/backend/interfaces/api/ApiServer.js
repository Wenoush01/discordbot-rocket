import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import createHealthRouter from "../api/routes/health.routes.js";
import createMusicRouter from "../api/routes/music/music.routes.js";
import path from "node:path";

function createApiServer({ config, logger, playbackService }) {
  const app = express();

  // Audio Assets API
  app.use("/assets", express.static(path.resolve("assets")));

  app.use(
    cors({
      origin: config.cors.origin,
    }),
  );

  app.use(express.json());

  // Register API routes
  app.use("/api", createHealthRouter());
  app.use("/api/music", createMusicRouter({ playbackService }));

  app.use((error, req, res, next) => {
    logger.error(
      `[API Server] Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  });

  const httpServer = createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.origin,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`[API Server] New client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      logger.info(`[API Server] Client disconnected: ${socket.id}`);
    });
  });

  return {
    app,
    io,
    async start() {
      await new Promise((resolve, reject) => {
        httpServer.once("error", reject);
        httpServer.listen(config.http.port, config.http.host, () => {
          logger.info(
            "[API Server] Listening on http://" +
              config.http.host +
              ":" +
              config.http.port,
          );
          resolve();
        });
      });
    },
    async stop() {
      io.close();

      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) return reject(error);
          resolve();
        });
      });

      logger.info("[API Server] Server stopped");
    },
  };
}

export default createApiServer;
