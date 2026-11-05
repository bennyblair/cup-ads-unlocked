import { type ReactNode, useEffect, useRef } from "react"

export const Dialog = ({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    const onDialogClose = () => onCloseRef.current()
    dialog.addEventListener("close", onDialogClose)
    return () => {
      document.documentElement.style.overflow = previousOverflow
      dialog.removeEventListener("close", onDialogClose)
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dialog-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog-panel">
        <div className="dialog-header">
          <h2 id="dialog-title">{title}</h2>
          <button type="button" className="close-button" data-testid="dialog-close" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
