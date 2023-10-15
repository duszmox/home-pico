import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

const ipHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Invalid method" });
  }
  const ctx = createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  try {
    const { uuid, password } = req.body;
    if (!uuid) {
      return res.status(400).json({ error: "Missing uuid" });
    }
    if (typeof uuid !== "string") {
      return res.status(400).json({ error: "Invalid uuid" });
    }

    if (!password) {
      return res.status(400).json({ error: "Missing password" });
    }
    if (typeof password !== "string") {
      return res.status(400).json({ error: "Invalid password" });
    }

    const { message } = await caller.home.regMobile({
      uuid: uuid as string,
      password: password as string,
    });

    return res.status(201).json({ message: message });
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
