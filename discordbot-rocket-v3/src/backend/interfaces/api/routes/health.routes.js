import { Router } from "express";
function createHealthRouter() {
  const router = Router();

  router.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  return router;
}

export default createHealthRouter;
