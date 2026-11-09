// Friendly empty / error message with an icon and an optional action button.
// variant: 'empty' (default) or 'error'
function StateMessage({ icon = 'ti-inbox', title, children, actionLabel, onAction, variant = 'empty', role }) {
  return (
    <div className={`nq-state nq-state-${variant}`} role={role || (variant === 'error' ? 'alert' : 'status')}>
      <span className="nq-state-icon" aria-hidden="true">
        <i className={`ti ${icon}`}></i>
      </span>
      <h3 className="nq-state-title">{title}</h3>
      {children && <p className="nq-state-text">{children}</p>}
      {actionLabel && onAction && (
        <button type="button" className="nq-state-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default StateMessage