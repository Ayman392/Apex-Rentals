import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

const baseURL = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");

export const auth = betterAuth({
  baseURL,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Explicitly disabled per assignment guideline
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      overrideUserInfoOnSignIn: true,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      overrideUserInfoOnSignIn: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "Customer",
        input: true, // Allow passing role on signup
      },
      phone: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const allowedRoles = ["Customer", "Owner"];
          const safeRole = allowedRoles.includes(String(user.role))
            ? user.role
            : "Customer";
          return {
            data: {
              ...user,
              role: safeRole,
            },
          };
        },
      },
    },
  },
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "RS256",
        },
      },
      jwt: {
        issuer: `${baseURL}/api/auth`,
        audience: "apex-rentals-api",
      },
    }),
  ],
});