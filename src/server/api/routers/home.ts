import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const homeRouter = createTRPCRouter({
  manageDevice: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
        ip: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { uuid, ip } = input;
      const device = await db.pico.findFirst({
        where: {
          uuid,
        },
      });
      if (device) {
        await db.pico.update({
          where: {
            uuid: device.uuid,
          },
          data: {
            ip,
          },
        });
      } else {
        await db.pico.create({
          data: {
            uuid,
            ip,
          },
        });
      }
      return { device };
    }),
});
