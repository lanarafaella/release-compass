import { useEffect, useMemo, useRef, useState } from 'react'
import {
  RISK_QUESTIONS,
  CAPABILITY_QUESTIONS,
  RAG_QUESTIONS,
  PEOPLE_QUESTIONS,
} from './data/questions.js'
import { AREAS, KIND_LABEL } from './data/practices.js'
import Sizing from './Sizing.jsx'
import { planRows, planBudget, SIZE_CAP } from './logic.js'
import { Logo, TierBars, KindIcon } from './Brand.jsx'
import { APP_NAME, TAGLINE } from './brand.js'
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

const newRow = (r) => ({ id: Math.random().toString(36).slice(2, 9), name: '', kind: 'rate', target: 90, expected: 98, maxFail: 5, have: '', ...r })

const DEFAULT_SIZING = {
  confidence: '95',
  mode: 'need',
  budget: 200,
  rows: [
    newRow({ name: 'Accuracy', target: 90, expected: 98 }),
    newRow({ name: 'Tone and format', target: 90, expected: 98 }),
    newRow({ name: 'Safety, zero tolerance', kind: 'zero', maxFail: 5 }),
  ],
}

// Older saved state had one threshold for every slice. Turn it into one row per slice.
function migrateSizing(sz) {
  if (!sz || sz.rows) return sz || DEFAULT_SIZING
  const n = Math.max(1, Math.min(20, Math.floor(Number(sz.slices) || 1)))
  return {
    confidence: sz.confidence || '95',
    rows: Array.from({ length: n }, (_, i) => newRow({ name: `Slice ${i + 1}`, target: sz.target, expected: sz.expected })),
  }
}

const TABS = [
  { id: 'risk', label: 'Product & risk' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'plan', label: 'Evaluation plan' },
  { id: 'size', label: 'Test set size' },
]

function hashTab() {
  const id = window.location.hash.replace('#', '')
  return TABS.some((t) => t.id === id) ? id : 'risk'
}

function loadState() {
  const fresh = { name: '', description: '', answers: {}, sizing: DEFAULT_SIZING }
  try {
    const raw = localStorage.getItem(STORE)
    if (raw) {
      const saved = JSON.parse(raw)
      return { ...fresh, ...saved, sizing: migrateSizing(saved.sizing) }
    }
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
        <select id={id} className={value ? 'answered' : undefined} value={value ?? ''} onChange={(e) => onChange(q.id, e.target.value || undefined)}>
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
              <label key={o.value} className={checked ? 'check on' : 'check'}>
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

function Section({ title, intro, children, grid }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {intro && <p className="intro">{intro}</p>}
      <div className={grid ? `q-grid${grid === 'wide' ? ' wide' : ''}` : undefined}>{children}</div>
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
    <details className={`practice ${p.applied}`}>
      <summary>
        <span className={`level ${p.applied}`}>{p.applied === 'required' ? 'Core' : 'Recommended'}</span>
        <span className="p-title">{p.title}</span>
      </summary>
      <div className="p-body">
        <p className="p-kind"><KindIcon kind={p.kind} />{KIND_LABEL[p.kind]}</p>
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

function TierCard({ result, unknown }) {
  const tierClass = result.tier === null ? 'none' : ['low', 'medium', 'high'][result.tier]
  return (
    <div className={`tier-card ${tierClass}`}>
      <p className="tier-label">Risk level</p>
      {result.tier === null ? (
        <>
          <p className="tier-name">Not set yet</p>
          <p className="tier-text">Answer the questions on the Product &amp; risk tab to see the level.</p>
        </>
      ) : (
        <>
          <div className="tier-head">
            <TierBars tier={result.tier} />
            <p className="tier-name">{TIER_NAMES[result.tier]}</p>
          </div>
          <p className="tier-text">{TIER_TEXT[result.tier]}</p>
          <p className="tier-why">
            <strong>Set by:</strong> {result.drivers.map((d) => `${d.id} (${d.answer})`).join(', ')}
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
  )
}

function LiveSummary({ download, copy, copied, result, unknown, practices, newIds, capAnswered, capTotal, sizing, tab, go }) {
  const required = practices.filter((p) => p.applied === 'required').length
  const recommended = practices.length - required
  const added = practices.filter((p) => p.condition)
  const plan = planRows(sizing)
  const budgetPlan = planBudget(sizing)
  return (
    <aside className="summary" aria-live="polite" aria-label="Live summary">
      <TierCard key={result.tier} result={result} unknown={unknown} />

      <div className="actions">
        <button type="button" onClick={download}>Download report</button>
        <button type="button" className="secondary" onClick={copy}>{copied ? 'Copied' : 'Copy report'}</button>
      </div>

      {result.tier !== null && (
        <div className="side-card">
          <p className="tier-label">Your plan so far</p>
          <div className="side-counts">
            <div><strong>{required}</strong><span>core</span></div>
            <div><strong>{recommended}</strong><span>recommended</span></div>
          </div>
          <p className="side-line">Capabilities answered: {capAnswered} of {capTotal}</p>
          {tab !== 'plan' && (
            <button type="button" className="secondary small" onClick={() => go('plan')}>Open the plan</button>
          )}
        </div>
      )}

      <div className="side-card">
        <p className="tier-label">Added by your answers</p>
        {added.length === 0 ? (
          <p className="side-line">Nothing yet. Capability answers add practices here.</p>
        ) : (
          <ul className="side-list">
            {added.map((p) => (
              <li key={p.id} className={newIds.includes(p.id) ? 'new' : undefined}>
                <span className={`level ${p.applied}`}>{p.applied === 'required' ? 'Core' : 'Rec.'}</span>
                <span>{p.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {tab === 'size' && (
        <div className="side-card">
          <p className="tier-label">Test set size</p>
          {sizing.mode === 'budget' ? (
            budgetPlan.valid ? (
              <p className="side-line">
                Budget {fmt(budgetPlan.budget)} cases. {budgetPlan.meeting} of {budgetPlan.rows.length} slices reach their target.
              </p>
            ) : (
              <p className="side-line">{budgetPlan.problem}</p>
            )
          ) : plan.allValid ? (
            <p className="side-line">{fmt(plan.total)} cases in total for {plan.rows.length} slice{plan.rows.length === 1 ? '' : 's'}.</p>
          ) : (
            <p className="side-line">Fill in every slice to see the total.</p>
          )}
        </div>
      )}

      <p className="fine">
        Guidance based on public sources. It is not a standard, not legal advice and not a release approval. Runs in your browser; nothing is sent anywhere.
      </p>
    </aside>
  )
}

function Pager({ back, next, go }) {
  return (
    <div className="pager">
      {back ? <button type="button" className="secondary" onClick={() => go(back.id)}>&larr; {back.label}</button> : <span />}
      {next ? <button type="button" onClick={() => go(next.id)}>Next: {next.label} &rarr;</button> : <span />}
    </div>
  )
}

const fmt = (n) => (n === Infinity ? `more than ${SIZE_CAP.toLocaleString('en-US')}` : n.toLocaleString('en-US'))

export default function App() {
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState(hashTab)
  const [area, setArea] = useState(null)
  const [showRec, setShowRec] = useState(true)
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(`${STORE}:theme`) === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  const tabRefs = useRef({})
  const { name, description, answers, sizing } = state
  const setSizing = (next) => setState((s) => ({ ...s, sizing: next }))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(`${STORE}:theme`, theme)
    } catch {
      // ignore
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  useEffect(() => {
    const onPop = () => setTab(hashTab())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const go = (id) => {
    if (id === tab) return
    window.history.pushState(null, '', `#${id}`)
    setTab(id)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const onTabKey = (e, index) => {
    let next = null
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length
    if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = TABS.length - 1
    if (next === null) return
    e.preventDefault()
    go(TABS[next].id)
    tabRefs.current[TABS[next].id]?.focus()
  }

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

  const capQuestions = [...CAPABILITY_QUESTIONS, ...(rag ? RAG_QUESTIONS : []), ...PEOPLE_QUESTIONS]
  const capAnswered = capQuestions.filter((q) => answers[q.id] !== undefined).length

  const prevIds = useRef(null)
  const newIds = prevIds.current ? practices.filter((p) => !prevIds.current.has(p.id)).map((p) => p.id) : []
  useEffect(() => {
    prevIds.current = new Set(practices.map((p) => p.id))
  }, [practices])

  const visible = practices.filter((p) => showRec || p.applied === 'required')
  const areas = AREAS.filter((a) => visible.some((p) => p.area === a))
  const currentArea = area === 'all' ? 'all' : areas.includes(area) ? area : areas[0]
  const shown = currentArea === 'all' ? visible : visible.filter((p) => p.area === currentArea)
  const required = practices.filter((p) => p.applied === 'required').length
  const recommended = practices.length - required

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

  const tabMeta = {
    risk: `${result.answered}/${result.total}`,
    capabilities: `${capAnswered}/${capQuestions.length}`,
    plan: result.tier === null ? '' : String(required),
    size: '',
  }
  const tierClass = result.tier === null ? 'none' : ['low', 'medium', 'high'][result.tier]

  return (
    <div className="page">
      <nav className="topbar" aria-label="Product">
        <span className="brand">
          <Logo />
          <span className="brand-name">{APP_NAME}</span>
        </span>
        <span className="topbar-right">
          <span className="privacy-pill">Runs in your browser. Nothing is sent anywhere.</span>
          <button type="button" className="ghost small" onClick={reset}>Reset</button>
          <button
            type="button"
            className="ghost small"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </span>
      </nav>

      {tab === 'risk' && (
        <header className="hero">
          <p className="eyebrow">{TAGLINE}</p>
          <h1>How should we evaluate this AI product?</h1>
          <p className="lede">
            Answer a few questions. You get a risk level and a list of evaluation practices, each with the public
            source behind it.
          </p>
        </header>
      )}

      <div className="tabbar">
        <div className="tabs" role="tablist" aria-label="Sections">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              ref={(el) => { tabRefs.current[t.id] = el }}
              className={tab === t.id ? 'tab on' : 'tab'}
              onClick={() => go(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <span className="tab-n">{i + 1}</span>
              <span className="tab-label">{t.label}</span>
              {tabMeta[t.id] && <span className="tab-count">{tabMeta[t.id]}</span>}
            </button>
          ))}
        </div>
        {result.tier !== null && (
          <span className={`tier-chip ${tierClass}`} title="Risk level">
            <TierBars tier={result.tier} />
            <span>{TIER_NAMES[result.tier]} risk</span>
          </span>
        )}
      </div>

      <div className="layout">
      <div className="panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'risk' && (
          <div className="form">
              <Section title="Your product" intro="Optional. The text appears in the exported report only. It does not change the result.">
                <div className="two-fields">
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
                      rows={3}
                      value={description}
                      placeholder="Who uses it, what it answers or does, which data and tools it touches."
                      onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
                    />
                  </label>
                </div>
              </Section>
              <Section
                grid
                title="What can go wrong"
                intro="These answers set the risk level. The highest answer wins. If you do not know, choose “I don't know”: it counts as High."
              >
                {RISK_QUESTIONS.map((q) => (
                  <Question key={q.id} q={q} value={answers[q.id]} onChange={setAnswer} />
                ))}
              </Section>
              <Pager next={TABS[1]} go={go} />
            </div>
        )}

        {tab === 'capabilities' && (
          <div className="form wide-form">
            <Section
              grid="wide"
              title="What the system can do"
              intro="These answers do not change the risk level. They switch extra practices on."
            >
              {CAPABILITY_QUESTIONS.map((q) => (
                <Question key={q.id} q={q} value={answers[q.id]} onChange={setAnswer} />
              ))}
            </Section>
            {rag && (
              <Section
                grid="wide"
                title="RAG evaluation"
                intro="Shown because the system reads external content (retrieval-augmented generation)."
              >
                {RAG_QUESTIONS.map((q) => (
                  <Question key={q.id} q={q} value={answers[q.id]} onChange={setAnswer} />
                ))}
              </Section>
            )}
            <Section grid="wide" title="People and feedback">
              {PEOPLE_QUESTIONS.map((q) => (
                <Question key={q.id} q={q} value={answers[q.id]} onChange={setAnswer} />
              ))}
            </Section>
            {unknown.length > 0 && (
              <p className="tier-warn wide-note">
                Unknown answers: {unknown.join(', ')}. They are treated as the riskiest option. Find out and answer them.
              </p>
            )}
            <Pager back={TABS[0]} next={TABS[2]} go={go} />
          </div>
        )}

        {tab === 'plan' && (
          <>
            {result.tier === null ? (
              <section className="card empty">
                <h2>No plan yet</h2>
                <p className="intro">Answer the risk questions first. The plan is built from your answers.</p>
                <button type="button" onClick={() => go('risk')}>Go to Product &amp; risk</button>
              </section>
            ) : (
              <>
                <div className="plan-top">
                  <div className="plan-side">
                    <div className="counts">
                      <div><strong>{required}</strong><span>core practices</span></div>
                      <div><strong>{recommended}</strong><span>recommended</span></div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={showRec} onChange={(e) => setShowRec(e.target.checked)} />
                      Show recommended practices
                    </label>
                  </div>
                </div>

                <div className="plan-body">
                  <div className="area-nav" role="group" aria-label="Areas">
                    {areas.map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={currentArea === a ? 'area-btn on' : 'area-btn'}
                        onClick={() => setArea(a)}
                      >
                        <span>{a}</span>
                        <span className="area-count">{visible.filter((p) => p.area === a).length}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className={currentArea === 'all' ? 'area-btn on' : 'area-btn'}
                      onClick={() => setArea('all')}
                    >
                      <span>All areas</span>
                      <span className="area-count">{visible.length}</span>
                    </button>
                  </div>
                  <div className="area-content">
                    <h2 className="area-title">{currentArea === 'all' ? 'All areas' : currentArea}</h2>
                    <p className="intro">
                      Core practices are what this guide treats as expected at this level. Recommended practices
                      help but are not expected. Open a practice to see why it matters and where it comes from.
                    </p>
                    {shown.map((p) => <PracticeCard key={p.id} p={p} />)}
                  </div>
                </div>

                <footer className="foot">
                  <p>
                    Source references were checked against the original texts on 2026-10-26 (for the OWASP Agentic
                    Top 10, entry titles only). Sources: NIST AI RMF 1.0 and AI 600-1, OWASP Top 10 for LLM
                    Applications (2025) and for Agentic Applications (2026), FDA, Health Canada and MHRA Good
                    Machine Learning Practice, WHO guidance on AI for health, FTC Act Section 5 and Health Breach
                    Notification Rule. RAGAS is mentioned as an example tool.
                  </p>
                  <p>
                    The risk-level rule (highest answer wins) and the Core and Recommended labels are this
                    guide&rsquo;s own guidance. They are not taken from any of the sources.
                  </p>
                </footer>
                <Pager back={TABS[1]} next={TABS[3]} go={go} />
              </>
            )}
          </>
        )}

        {tab === 'size' && (
          <>
            <Sizing sizing={sizing} setSizing={setSizing} newRow={newRow} />
            <Pager back={TABS[2]} go={go} />
          </>
        )}
      </div>
      <LiveSummary
        download={download}
        copy={copy}
        copied={copied}
        result={result}
        unknown={unknown}
        practices={practices}
        newIds={newIds}
        capAnswered={capAnswered}
        capTotal={capQuestions.length}
        sizing={sizing}
        tab={tab}
        go={go}
      />
      </div>
    </div>
  )
}
