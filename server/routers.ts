import { createHash } from "node:crypto";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import { fireguardRouter } from "./routers/fireguard";
import { createLocalUser, getUserByEmail, updateUserLastSignedIn } from "./db";
import { hashPassword, verifyPassword } from "./auth/local";
import { TRPCError } from "@trpc/server";

const emailSchema = z.string().trim().toLowerCase().email("Digite um e-mail válido.");
const passwordSchema = z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").regex(/[A-Za-z]/, "A senha deve conter uma letra.").regex(/[0-9]/, "A senha deve conter um número.");
const birthDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.").refine(value => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date <= new Date() && date.getUTCFullYear() >= 1900;
}, "Informe uma data de nascimento válida.");

const publicUser = (user: NonNullable<Awaited<ReturnType<typeof getUserByEmail>>>) => {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

const authCookie = (ctx: Parameters<typeof getSessionCookieOptions>[0]) => {
  return { ...getSessionCookieOptions(ctx), maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true } as const;
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user ? publicUser(opts.ctx.user) : null),
    register: publicProcedure
      .input(z.object({
        name: z.string().trim().min(3, "Informe seu nome completo."),
        companyName: z.string().trim().min(2, "Informe o nome da empresa."),
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
        birthDate: birthDateSchema,
        phone: z.string().trim().min(8, "Informe um telefone válido."),
      }).superRefine((input, ctx) => {
        if (input.password !== input.confirmPassword) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmPassword"], message: "As senhas não coincidem." });
        }
      }))
      .mutation(async ({ input, ctx }) => {
        const email = input.email;
        const existing = await getUserByEmail(email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Já existe uma conta com este e-mail." });

        const openId = `email:${createHash("sha256").update(email).digest("hex")}`;
        const passwordHash = await hashPassword(input.password);
        let user;
        try {
          user = await createLocalUser({
            openId,
            name: input.name,
            companyName: input.companyName,
            email,
            passwordHash,
            birthDate: new Date(`${input.birthDate}T00:00:00.000Z`),
            phone: input.phone,
          });
        } catch (error) {
          if (String(error).toLowerCase().includes("duplicate") || String(error).toLowerCase().includes("unique")) {
            throw new TRPCError({ code: "CONFLICT", message: "Já existe uma conta com este e-mail." });
          }
          throw error;
        }
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível criar sua conta." });

        const token = await sdk.createLocalSessionToken(user.openId, user.name ?? input.name);
        ctx.res.cookie(COOKIE_NAME, token, authCookie(ctx.req));
        return publicUser(user);
      }),
    login: publicProcedure
      .input(z.object({ email: emailSchema, password: z.string().min(1, "Digite sua senha.") }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha inválidos." });
        }
        await updateUserLastSignedIn(user.id);
        const token = await sdk.createLocalSessionToken(user.openId, user.name ?? "FireGuard");
        ctx.res.cookie(COOKIE_NAME, token, authCookie(ctx.req));
        return publicUser(user);
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  fireguard: fireguardRouter,
});

export type AppRouter = typeof appRouter;
