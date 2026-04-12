import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getFeedItems, getFeedItemCount } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  feed: router({
    list: publicProcedure
      .input((input: unknown) => {
        const obj = input as any;
        return {
          limit: typeof obj?.limit === "number" ? obj.limit : 50,
          offset: typeof obj?.offset === "number" ? obj.offset : 0,
          type: typeof obj?.type === "string" ? obj.type : undefined,
          source: typeof obj?.source === "string" ? obj.source : undefined,
          search: typeof obj?.search === "string" ? obj.search : undefined,
        };
      })
      .query(async ({ input }) => {
        const items = await getFeedItems(input.limit, input.offset, {
          type: input.type,
          source: input.source,
          search: input.search,
        });
        const total = await getFeedItemCount({
          type: input.type,
          source: input.source,
        });
        return { items, total };
      }),

    sources: publicProcedure.query(async () => {
      return [
        { id: "tds", name: "Towards Data Science", type: "article" },
        { id: "arxiv", name: "arXiv cs.AI", type: "article" },
        { id: "deeplearning", name: "DeepLearning.AI The Batch", type: "article" },
        { id: "emergent_mind", name: "Emergent Mind", type: "article" },
        { id: "techxplore", name: "TechXplore ML/AI", type: "article" },
        { id: "papers_with_code", name: "Papers with Code", type: "article" },
        { id: "github", name: "GitHub Trending", type: "github" },
        { id: "ai_tools", name: "There's An AI For That", type: "ai_tool" },
        { id: "twitter", name: "Twitter/X", type: "tweet" },
      ];
    }),
  }),
});

export type AppRouter = typeof appRouter;
