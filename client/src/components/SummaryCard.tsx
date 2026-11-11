import type { ReactNode } from 'react'

interface SummaryCardProps {
  label: string
  count: number
  caption: string
  tone: 'blue' | 'pink'
  icon: ReactNode
  loading?: boolean
}

export function SummaryCard({ label, count, caption, tone, icon, loading = false }: SummaryCardProps) {
  return (
    <article className={`summary-card summary-${tone}`} aria-busy={loading}>
      <div className="summary-icon">{icon}</div>
      <div className="summary-copy">
        <span className="summary-label">{label}</span>
        {loading ? (
          <span className="count-skeleton" aria-label="Loading count" />
        ) : (
          <>
            <strong>{String(count).padStart(2, '0')}</strong>
            <span className="summary-caption">{caption}</span>
          </>
        )}
      </div>
    </article>
  )
}
