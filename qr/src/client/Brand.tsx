export const BrandHeader = ({ onSignOut }: { onSignOut?: () => void }) => (
  <header className="topbar">
    <a className="wordmark" href="https://cupspace.com.au" rel="noreferrer">
      cupspace<sup>®</sup>
    </a>
    <div className="topbar-actions">
      <span className="pill">QR Studio</span>
      {onSignOut ? (
        <button type="button" className="text-button" data-testid="sign-out" onClick={onSignOut}>
          Sign out
        </button>
      ) : null}
    </div>
  </header>
)
