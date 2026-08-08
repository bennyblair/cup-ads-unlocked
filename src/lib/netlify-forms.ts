import { saveDevelopmentCafeSubmission } from "@/lib/cafe-api"

export const submitNetlifyForm = async (
  formName: string,
  form: HTMLFormElement,
) => {
  const formData = new FormData(form)
  formData.set("form-name", formName)

  // Vite cannot emulate Netlify Forms locally. Production and deploy previews
  // post to Netlify; local development simulates the successful UI state.
  if (import.meta.env.DEV) {
    if (formName === "cafe-form") {
      saveDevelopmentCafeSubmission(formData)
    }
    await new Promise((resolve) => window.setTimeout(resolve, 450))
    return
  }

  const payload = new URLSearchParams()
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      payload.append(key, value)
    }
  })

  const response = await fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  })

  if (!response.ok) {
    throw new Error("We could not submit your form. Please try again.")
  }
}
