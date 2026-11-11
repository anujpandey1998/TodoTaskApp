import { Icon } from '../components/Icon'

export function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  return (
    <main className="phone-shell onboarding-shell">
      <div className="onboarding-hero" aria-hidden="true">
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />
        <div className="hero-sparkle sparkle-one" />
        <div className="hero-sparkle sparkle-two" />
        <div className="hero-task-card">
          <div className="hero-card-check"><Icon name="check" size={17} /></div>
          <div className="hero-card-line" />
          <div className="hero-card-line short" />
          <div className="hero-card-dot" />
        </div>
        <div className="hero-checklist">
          <span><i /> <b /></span>
          <span><i /> <b /></span>
          <span><i /> <b /></span>
        </div>
      </div>
      <section className="onboarding-copy">
        <div className="onboarding-dots" aria-hidden="true"><i /><i /><i /></div>
        <h1>Manage What To Do</h1>
        <p>The best way to manage what you have to do, don't forget your plans</p>
        <button type="button" className="primary-button onboarding-button" onClick={onComplete}>
          Get Started
          <Icon name="right" size={17} />
        </button>
      </section>
    </main>
  )
}
