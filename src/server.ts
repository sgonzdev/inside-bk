import { createServer } from "http";
import app from "./app";
import { env } from "./shared/config/env";
import { initializeSocket } from "./infrastructure/websocket/socket";
import { ensureBucket } from "./infrastructure/storage/storage";
import { verifyEmailTransport } from "./infrastructure/email/email.service";

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(env.PORT, async () => {
  await ensureBucket();
  console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  // No bloquea el arranque: solo avisa en el log si el SMTP está mal
  void verifyEmailTransport();
});
