export function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = max === 0 ? 0 : Math.round((value / max) * 100)

  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="Weekly task completion"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${percentage}% complete`}
    >
      <span className="progress-fill" style={{ width: `${percentage}%` }} />
    </div>
  )
}
