import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../server/api/root";
import { createTRPCContext } from "../../server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import requestIp from "request-ip";

const ipHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "Invalid method" });
  }
  const ctx = createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  try {
    const { uuid } = req.query;
    const ip = requestIp.getClientIp(req);

    if (!uuid) {
      return res.status(400).json({ error: "Missing uuid" });
    }
    if (typeof uuid !== "string") {
      return res.status(400).json({ error: "Invalid uuid" });
    }
    if (!ip) {
      return res.status(400).json({ error: "Missing ip" });
    }
    if (typeof ip !== "string") {
      return res.status(400).json({ error: "Invalid ip" });
    }
    const { device } = await caller.home.manageDevice({
      uuid,
      ip,
    });
    while (device === null) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return res.status(200).json({ device: device });
  } catch (err) {
    if (err instanceof TRPCError) {
      return res.status(getHTTPStatusCodeFromError(err)).json({
        message: err.message,
        code: err.code,
      });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default ipHandler;
