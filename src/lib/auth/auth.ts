import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { database } from '@/database'
import { admin } from 'better-auth/plugins/admin'
import { nextCookies } from 'better-auth/next-js'
import { openAPI, username } from 'better-auth/plugins'
import { session, user, account, verification } from '@/database/schema'
import { createAuthMiddleware, APIError } from 'better-auth/api'
import { count } from 'drizzle-orm'

export const auth = betterAuth({
    database: drizzleAdapter(database, {
        provider: 'pg',
        schema: {
            session, user, account, verification
        }
    }),
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path != "/sign-up/email") {
                return;
            }
            // sign up is deactivated if at least one account exists
            const [{ count: userCount }] = await database
                .select({ count: count() })
                .from(user);
            if (userCount > 0) {
                throw new APIError("FORBIDDEN", {
                    message: "Sign up is disabled",
                    keyCode: "SIGN_UP_DISABLED",
                });
            }
        }),
    },
    advanced: {
        cookiePrefix: 'tournament'
    },
    emailAndPassword: { enabled: true},
    plugins: [admin(), username(), nextCookies(), openAPI()]
})
