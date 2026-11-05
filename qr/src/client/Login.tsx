import { type FormEvent, useRef, useState } from "react"

import { login } from "./api"
import { BrandHeader } from "./Brand"

export const Login = () => {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const lock = useRef(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (lock.current) return
    lock.current = true
    setPending(true)
    setError("")
    try {
      await login(password)
      window.location.assign("/")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.")
      lock.current = false
      setPending(false)
    }
  }

  return (
    <main className="shell">
      <BrandHeader />
      <section className="login-card">
        <p className="eyebrow">Private</p>
        <h1>Sign in to QR Studio.</h1>
        <p className="lede">Campaign links stay public. Creating and editing them stays here.</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={16}
            maxLength={200}
          />
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="primary-button" type="submit" data-testid="sign-in" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  )
}
