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
      let device = await db.pico.findFirst({
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
        device = await db.pico.create({
          data: {
            uuid,
            ip,
          },
        });
      }
      return { device };
    }),
  getDevice: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { uuid } = input;
      const device = await db.pico.findFirst({
        where: {
          uuid,
        },
      });
      if (device) {
        return { device };
      } else {
        throw new Error("Device not found");
      }
    }),
  openGate: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
        gate: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { uuid } = input;
      const device = await db.pico.findFirst({
        where: {
          uuid,
        },
      });
      if (device) {
        // make a request to the device
        const respose = await fetch(
          `http://${device.ip}/gate/open/${input.gate}`,
        );
        if (respose.ok) {
          return { message: "Gate opened" };
        } else {
          throw new Error("Error opening gate");
        }
      } else {
        throw new Error("Device not found");
      }
    }),
  closeGate: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
        gate: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { uuid } = input;
      const device = await db.pico.findFirst({
        where: {
          uuid,
        },
      });
      if (device) {
        // make a request to the device
        const respose = await fetch(
          `http://${device.ip}/gate/close/${input.gate}`,
        );
        if (respose.ok) {
          return { message: "Gate closed" };
        } else {
          throw new Error("Error closing gate");
        }
      } else {
        throw new Error("Device not found");
      }
    }),
});
