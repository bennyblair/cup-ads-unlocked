import { useEffect } from "react"
import { useLocation } from "react-router-dom"

import { applyDocumentHead, resolvePage } from "@/seo/metadata"

const DocumentHead = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    applyDocumentHead(resolvePage(pathname))
  }, [pathname])

  return null
}

export default DocumentHead
