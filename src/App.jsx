import { useEffect, useMemo, useState } from 'react'
import {
  RISK_QUESTIONS,
  CAPABILITY_QUESTIONS,
  RAG_QUESTIONS,
  PEOPLE_QUESTIONS,
} from './data/questions.js'
import { AREAS, KIND_LABEL } from './data/practices.js'
import Sizing from './Sizing.jsx'
import {
  TIER_NAMES,
  TIER_TEXT,
  computeTier,
  practicesFor,
  showRag,
  unknownAnswers,
  buildReport,
} from './logic.js'

const STORE = 'ai-release-guide:v1'

const DEFAULT_SIZING = { slices: 4, target: 90, expected: 98, confidence: '95', available: '' }

function loadState() {
  const fresh = { name: '', description: '', answers: {}, sizing: DEFAULT_SIZING }
  try {
    const raw = localStorage.getItem(STORE)
    if (raw) return { ...fresh, ...JSON.parse(raw) }
  } catch {
    // storage may be unavailable; the app works without it
  }
  return fresh
}

function Question({ q, value, onChange }) {
  const id = `q-${q.id}`
  return (
    <div className="question">
      <div className="q-head">
        <span className="q-id">{q.id}</span>
        <label htmlFor={id} className="q-label">{q.label}</label>
      </div>
      {q.help && <p className="q-help">{q.help}</p>}
      {q.type === 'select' && (
        <select id={id} value={value ?? ''} onChange={(e) => onChange(q.id, e.target.value || undefined)}>
          <option value="">Select an answer</option>
          {q.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
      {q.type === 'radio' && (
        <div className="segmented" role="radiogroup" aria-label={q.label}>
          {q.options.map((o) => (
            <label key={o.value} className={value === o.value ? 'seg on' : 'seg'}>
              <input
                type="radio"
                name={id}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(q.id, o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
      {q.type === 'checks' && (
        <div className="checks">
          {q.options.map((o) => {
            const list = Array.isArray(value) ? value : []
            const checked = list.includes(o.value)
            return (
              <label key={o.value} className="check">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? list.filter((v) => v !== o.value) : [...list, o.value]
                    onChange(q.id, next.length ? next : undefined)
                  }}
                />
                {o.label}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Section({ title, intro, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {intro && <p className="intro">{intro}</p>}
      {children}
    </section>
  )
}

function SourceChip({ s }) {
  return (
    <a className={`chip ${s.kind}`} href={s.url} target="_blank" rel="noreferrer noopener">
      {s.label}
      {s.note && <span className="chip-note"> ({s.note})</span>}
    </a>
  )
}

function PracticeCard({ p }) {
  return (
    <details className="practice">
      <summary>
        <span className={`level ${p.applied}`}>{p.applied === 'required' ? 'Core' : 'Recommended'}</span>
        <span className="p-title">{p.title}</span>
      </summary>
      <div className="p-body">
        <p className="p-kind">{KIND_LABEL[p.kind]}</p>
        {p.condition && <p className="p-cond">{p.condition}</p>}
        <p>{p.what}</p>
        {p.steps && (
          <ul className="p-steps">
            {p.steps.map((s) => <li key={s}>{s}</li>)}
          </ul>
        )}
        <p><strong>Why:</strong> {p.why}</p>
        {p.note && <p className="p-note">{p.note}</p>}
        <div className="chips">
          {p.sourceList.map((s) => <SourceChip key={s.id} s={s} />)}
        </div>
      </div>
    </details>
  )
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [showRec, setShowRec] = useState(true)
  const [copied, setCopied] = useState(false)
  const { name, description, answers, sizing } = state
  const setSizing = (next) => setState((s) => ({ ...s, sizing: next }))

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const setAnswer = (id, value) =>
    setState((s) => {
      const next = { ...s.answers }
      if (value === undefined) delete next[id]
      else next[id] = value
      return { ...s, answers: next }
    })

  const result = useMemo(() => computeTier(answers), [answers])
  const practices = useMemo(() => practicesFor(answers), [answers])
  const unknown = unknownAnswers(answers)
  const rag = showRag(answers)
  const visible = practices.filter((p) => showRec || p.applied === 'required')
  const areas = AREAS.filter((a) => visible.some((p) => p.area === a))
  const required = practices.filter((p) => p.applied === 'required').length
  const recommended = practices.length - required
  const tierClass = result.tier === null ? 'none' : ['low', 'medium', 'high'][result.tier]

  const report = () => buildReport({ name, description, answers, sizing })

  const download = () => {
    const blob = new Blob([report()], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-release-guide-${(name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report())
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      download()
    }
  }

  const reset = () => {
    if (window.confirm('Clear all answers?')) {
      setState({ name: '', description: '', answers: {}, sizing: DEFAULT_SIZING })
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">AI Release Guide</p>
        <h1>How should we evaluate this AI product?</h1>
        <p className="lede">
          Describe your product and answer a few questions. You get a risk level and a list of evaluation
          practices, each with its source. Everything runs in your browser. Nothing is sent anywhere.
        </p>
      </header>

      <div className="layout">
        <div className="form">
          <Section title="1. Your product" intro="Optional. The text appears in the exported report only. It does not change the result.">
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                placeholder="For example: Customer-facing assistant"
                onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
              />
            </label>
            <label className="field">
              <span>What does it do?</span>
              <textarea
                rows={4}
                value={description}
                placeholder="Who uses it, what it answers or does, which data and tools it touches."
                onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
              />
            </label>
          </Section>

          <Section
            title="2. What can go wrong"
            intro="These answers set the risk level. The highest answer wins. If you do not know, choose “I don't know”: it counts as High."
          >
            {RISK_QUESTIONS.map((q) => (
              <Question key={q.id} q={q} value={answers[q.id]} onChange={setAnswer} />
            ))}
          </Section>

          <Section
            title="3. What the system can do"
            intro="These answers do not change the risk level. They switch extra practices on."
          >
            {CAPABILITY_QUESTIONS.map((q) => (
              <Question key={q.id} q={q} value={answers[q.id]} onChange={setAnswer} />
            ))}
          </Section>

          {rag && (
            <Section
              title="4. RAG evaluation"
              intro="Shown because the system reads external content (retrieval-augmented generation)."
            >
              {RAG_QUESTIONS.map((q) => (
                <Question key={q.id} q={q} value={answers[q.id]} onChange={setAnswer} />
              ))}
            </Section>
          )}

          <Section title={rag ? '5. People and feedback' : '4. People and feedback'}>
            {PEOPLE_QUESTIONS.map((q) => (
              <Question key={q.id} q={q} value={answers[q.id]} onChange={setAnswer} />
            ))}
          </Section>
        </div>

        <aside className="summary" aria-live="polite">
          <div className={`tier-card ${tierClass}`}>
            <p className="tier-label">Risk level</p>
            {result.tier === null ? (
              <>
                <p className="tier-name">Not set yet</p>
                <p className="tier-text">Answer the questions in section 2 to see the level.</p>
              </>
            ) : (
              <>
                <p className="tier-name">{TIER_NAMES[result.tier]}</p>
                <p className="tier-text">{TIER_TEXT[result.tier]}</p>
                <p className="tier-why">
                  <strong>Set by:</strong>{' '}
                  {result.drivers.map((d) => `${d.id} (${d.answer})`).join(', ')}
                </p>
                {result.answered < result.total && result.tier < 2 && (
                  <p className="tier-warn">
                    {result.answered} of {result.total} risk questions answered. The level can still go up.
                  </p>
                )}
              </>
            )}
            {unknown.length > 0 && (
              <p className="tier-warn">
                Unknown answers: {unknown.join(', ')}. Treated as the riskiest option. Find out and answer them.
              </p>
            )}
          </div>

          {result.tier !== null && (
            <div className="counts">
              <div><strong>{required}</strong><span>core practices</span></div>
              <div><strong>{recommended}</strong><span>recommended</span></div>
            </div>
          )}

          <div className="actions">
            <button onClick={download} disabled={result.tier === null}>Download report</button>
            <button className="secondary" onClick={copy} disabled={result.tier === null}>
              {copied ? 'Copied' : 'Copy report'}
            </button>
            <button className="ghost" onClick={reset}>Clear</button>
          </div>
          <p className="fine">
            Guidance based on public sources. It is not a standard, not legal advice and not a release approval.
          </p>
        </aside>
      </div>

      {result.tier !== null && (
        <section className="results">
          <div className="results-head">
            <h2>Evaluation practices</h2>
            <label className="toggle">
              <input type="checkbox" checked={showRec} onChange={(e) => setShowRec(e.target.checked)} />
              Show recommended practices
            </label>
          </div>
          <p className="intro">
            Core practices are what this guide treats as expected at this level. Recommended practices help but
            are not expected. Open a practice to see why it matters and where it comes from. Source references were
            checked against the original texts on 2026-10-26 (for the OWASP Agentic Top 10, entry titles only).
          </p>
          {areas.map((area) => (
            <div key={area} className="area">
              <h3>{area}</h3>
              {visible.filter((p) => p.area === area).map((p) => <PracticeCard key={p.id} p={p} />)}
            </div>
          ))}
        </section>
      )}

      <Sizing sizing={sizing} setSizing={setSizing} />

      <footer className="foot">
        <p>
          Sources: NIST AI RMF 1.0 and AI 600-1, OWASP Top 10 for LLM Applications (2025) and for Agentic
          Applications (2026), FDA, Health Canada and MHRA Good Machine Learning Practice, WHO guidance on AI
          for health, FTC Act Section 5 and Health Breach Notification Rule. RAGAS is mentioned as an example tool.
        </p>
        <p>
          The risk-level rule (highest answer wins) and the Core and Recommended labels are this guide&rsquo;s own
          guidance. They are not taken from any of the sources.
        </p>
      </footer>
    </div>
  )
}
