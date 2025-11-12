import { z } from "zod";

/**
 * This module parses every runtime variable
 * once at startup and provides a typed object for the rest of the application.
 * Always import values from `Env` instead of using `process.env` directly.
 */

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  NEXT_PUBLIC_RANDOM_USER_API: z
    .string()
    .url()
    .default("https://randomuser.me/api/"),

  NEXT_PUBLIC_RANDOM_USER_SEED: z.string().default("bitikit-challenge"),

  NEXT_PUBLIC_DB_NAME: z.string().default("bitikit-users"),

  NEXT_PUBLIC_DB_VERSION: z.coerce.number().int().positive().default(1),

  NEXT_PUBLIC_DEFAULT_RESULTS_PER_PAGE: z.coerce
    .number()
    .int()
    .positive()
    .default(10),

  NEXT_PUBLIC_DEFAULT_TOTAL_PAGES: z.coerce
    .number()
    .int()
    .positive()
    .default(10),

  NEXT_PUBLIC_CACHE_MAX_AGE_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 60 * 1000), // 5 minutes

  NEXT_PUBLIC_DEBUG_MODE: z.coerce.boolean().default(false),
});

type EnvSchema = z.infer<typeof envSchema>;

class EnvironmentError extends Error {
  constructor(message: string, readonly details: Record<string, string>) {
    super(message);
    this.name = "EnvironmentError";
  }
}

function parseEnv(): EnvSchema {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_RANDOM_USER_API: process.env.NEXT_PUBLIC_RANDOM_USER_API,
      NEXT_PUBLIC_RANDOM_USER_SEED: process.env.NEXT_PUBLIC_RANDOM_USER_SEED,
      NEXT_PUBLIC_DB_NAME: process.env.NEXT_PUBLIC_DB_NAME,
      NEXT_PUBLIC_DB_VERSION: process.env.NEXT_PUBLIC_DB_VERSION,
      NEXT_PUBLIC_DEFAULT_RESULTS_PER_PAGE:
        process.env.NEXT_PUBLIC_DEFAULT_RESULTS_PER_PAGE,
      NEXT_PUBLIC_DEFAULT_TOTAL_PAGES:
        process.env.NEXT_PUBLIC_DEFAULT_TOTAL_PAGES,
      NEXT_PUBLIC_CACHE_MAX_AGE_MS: process.env.NEXT_PUBLIC_CACHE_MAX_AGE_MS,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.reduce<Record<string, string>>(
        (acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        },
        {}
      );

      throw new EnvironmentError(
        "Environment configuration validation failed",
        details
      );
    }

    throw error;
  }
}

export const Env = parseEnv();

export type { EnvSchema };
