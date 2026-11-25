export const CupMark = () => (
  <svg className="cup-mark" viewBox="0 0 32 32" aria-hidden="true">
    <path
      fill="currentColor"
      d="M7 7h13v2.2H7V7zm1.2 4.2h11.2l-.9 11.2a2.4 2.4 0 0 1-2.4 2.2h-4.6a2.4 2.4 0 0 1-2.4-2.2L8.2 11.2zm12.2.6h2.2a3.6 3.6 0 0 1 0 7.2h-1.5l-.4-2h1.7a1.6 1.6 0 1 0 0-3.2h-1.6l-.4-2z"
    />
  </svg>
)

export const BrandHeader = ({
  onSignOut,
  syncedLabel,
  onRefresh,
  refreshing,
}: {
  onSignOut?: () => void
  syncedLabel?: string
  onRefresh?: () => void
  refreshing?: boolean
}) => (
  <header className="topbar">
    <a className="wordmark" href="https://cupspace.com.au">
      <CupMark />
      <span>
        Cup<span className="wordmark-space">Space</span>
      </span>
    </a>
    <div className="topbar-actions">
      <span className="stamp">Pipeline</span>
      {syncedLabel ? <span className="synced">{syncedLabel}</span> : null}
      {onRefresh ? (
        <button type="button" className="text-button" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? "Syncing…" : "Sync"}
        </button>
      ) : null}
      {onSignOut ? (
        <button type="button" className="text-button" data-testid="sign-out" onClick={onSignOut}>
          Sign out
        </button>
      ) : null}
    </div>
  </header>
)
