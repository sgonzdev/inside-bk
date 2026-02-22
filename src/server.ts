import { createServer } from "http";
import app from "./app";
import { env } from "./shared/config/env";
import { initializeSocket } from "./infrastructure/websocket/socket";
import { ensureBucket } from "./infrastructure/storage/storage";

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(env.PORT, async () => {
  await ensureBucket();
  console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});
