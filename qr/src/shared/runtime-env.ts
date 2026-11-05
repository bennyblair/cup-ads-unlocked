import { MIN_PASSWORD_LENGTH, MIN_SECRET_LENGTH } from "./session.ts"

type EnvRecord = Record<string, string | undefined>

const processValue = (name: string): string | undefined => {
  const runtime = globalThis as { process?: { env?: EnvRecord } }
  const value = runtime.process?.env?.[name]
  return typeof value === "string" ? value : undefined
}

const netlifyValue = (name: string): string | undefined => {
  const runtime = globalThis as {
    Netlify?: { env?: { get?: (key: string) => string | undefined } }
  }
  try {
    const value = runtime.Netlify?.env?.get?.(name)
    return typeof value === "string" ? value : undefined
  } catch {
    return undefined
  }
}

// Serverless functions receive secrets on process.env. Edge functions receive
// them on Netlify.env. Prefer whichever source actually holds a usable value.
export const readRuntimeEnv = (name: string, minimum = 1): string => {
  const values = [processValue(name), netlifyValue(name)].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  )
  return values.find((value) => value.length >= minimum) ?? values[0] ?? ""
}

export type RuntimeEnvPresence = {
  fromProcess: boolean
  fromNetlify: boolean
  valid: boolean
}

const nonEmpty = (value: string | undefined) => typeof value === "string" && value.length > 0

export const runtimeEnvPresence = (name: string, minimum: number): RuntimeEnvPresence => {
  const fromProcess = processValue(name)
  const fromNetlify = netlifyValue(name)
  return {
    fromProcess: nonEmpty(fromProcess),
    fromNetlify: nonEmpty(fromNetlify),
    valid:
      (typeof fromProcess === "string" && fromProcess.length >= minimum) ||
      (typeof fromNetlify === "string" && fromNetlify.length >= minimum),
  }
}

export const authEnvPresence = () => ({
  password: runtimeEnvPresence("QR_ADMIN_PASSWORD", MIN_PASSWORD_LENGTH),
  sessionSecret: runtimeEnvPresence("QR_SESSION_SECRET", MIN_SECRET_LENGTH),
})

export const readAuthEnv = () => ({
  password: readRuntimeEnv("QR_ADMIN_PASSWORD", MIN_PASSWORD_LENGTH),
  sessionSecret: readRuntimeEnv("QR_SESSION_SECRET", MIN_SECRET_LENGTH),
})
