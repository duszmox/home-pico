import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

const ipHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(400).json({ error: "Invalid method" });
  }
  const ctx = createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  try {
    const { uuid } = req.query;
    if (!uuid) {
      return res.status(400).json({ error: "Missing uuid" });
    }
    if (typeof uuid !== "string") {
      return res.status(400).json({ error: "Invalid uuid" });
    }

    for (let i = 0; i < 16; i++) {
      await caller.home.openGate({
        uuid: uuid as string,
        gate: i,
      });
    }
    for (let i = 0; i < 16; i++) {
      await caller.home.closeGate({
        uuid: uuid as string,
        gate: i,
      });
    }
    const { message } = await caller.home.closeGate({
      uuid: uuid as string,
      gate: 0,
    });

    return res.status(200).json({ message: message });
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
