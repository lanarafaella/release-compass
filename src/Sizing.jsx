import { planRows, planBudget, SIZE_CAP } from './logic.js'

const fmt = (n) => (n === Infinity ? `more than ${SIZE_CAP.toLocaleString('en-US')}` : n.toLocaleString('en-US'))

function Cell({ label, children }) {
  return (
    <label className="row-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function NumIn({ value, onChange, min, max, step }) {
  return (
    <input type="number" inputMode="decimal" min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.value)} />
  )
}

function BudgetOut({ b }) {
  if (b.problem) return <span className="size-problem">{b.problem}</span>
  const claim =
    b.kind === 'zero'
      ? `If none fail: failure rate below ${(b.failBound * 100).toFixed(1)}%`
      : `Lower bound ${(b.lowerBound * 100).toFixed(1)}% (target ${b.target}%)`
  return (
    <>
      <strong>{fmt(b.cases)}</strong>
      <span>cases from the budget</span>
      <span className={b.meets ? 'claim ok' : 'claim short'}>{claim}</span>
      {!b.meets && b.needed !== null && <span className="claim-need">Target needs {fmt(b.needed)}</span>}
    </>
  )
}

export default function Sizing({ sizing, setSizing, newRow }) {
  const plan = planRows(sizing)
  const mode = sizing.mode === 'budget' ? 'budget' : 'need'
  const budget = planBudget(sizing)
  const byId = Object.fromEntries((budget.rows || []).map((r) => [r.id, r]))
  const setRow = (id, patch) =>
    setSizing({ ...sizing, rows: sizing.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) })
  const addRow = (kind) =>
    setSizing({ ...sizing, rows: [...sizing.rows, newRow({ kind, name: kind === 'zero' ? 'Zero tolerance slice' : '' })] })
  const removeRow = (id) => setSizing({ ...sizing, rows: sizing.rows.filter((r) => r.id !== id) })

  return (
    <section className="card sizing">
      <h2>Estimate the test set size</h2>
      <p className="intro">
        Each slice has its own threshold. A normal slice asks: if the system passes at the rate you expect, how many
        cases are needed before the lower bound reaches your target? A zero-tolerance slice cannot be proven at
        100%. It asks instead: how many cases with no failure show the failure rate is below the limit you can
        accept? The numbers below are examples. Replace them with your own.
      </p>

      <label className="field conf-field" htmlFor="sz-conf">
        <span>Confidence (one-sided, same for all slices)</span>
        <select id="sz-conf" value={sizing.confidence} onChange={(e) => setSizing({ ...sizing, confidence: e.target.value })}>
          <option value="90">90%</option>
          <option value="95">95%</option>
          <option value="99">99%</option>
        </select>
      </label>

      <div className="field">
        <span className="mode-label">What do you want to know?</span>
        <div className="segmented" role="radiogroup" aria-label="Sizing mode">
          <label className={mode === 'need' ? 'seg on' : 'seg'}>
            <input type="radio" name="sz-mode" checked={mode === 'need'} onChange={() => setSizing({ ...sizing, mode: 'need' })} />
            How many cases do I need?
          </label>
          <label className={mode === 'budget' ? 'seg on' : 'seg'}>
            <input type="radio" name="sz-mode" checked={mode === 'budget'} onChange={() => setSizing({ ...sizing, mode: 'budget' })} />
            What can I claim with my budget?
          </label>
        </div>
      </div>

      {mode === 'budget' && (
        <label className="field conf-field" htmlFor="sz-budget">
          <span>Total cases you can afford</span>
          <input
            id="sz-budget"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={sizing.budget ?? ''}
            onChange={(e) => setSizing({ ...sizing, budget: e.target.value })}
          />
          <small className="q-help">Split evenly across the slices below.</small>
        </label>
      )}
      {mode === 'budget' && !budget.valid && <p className="size-problem">{budget.problem}</p>}

      <div className="slice-rows">
        {plan.rows.map((r) => (
          <div className={`slice-row ${r.kind}`} key={r.id}>
            <div className="slice-main">
              <Cell label="Slice name">
                <input type="text" value={r.name} placeholder="For example: Accuracy" onChange={(e) => setRow(r.id, { name: e.target.value })} />
              </Cell>
              <Cell label="Type">
                <select value={r.kind} onChange={(e) => setRow(r.id, { kind: e.target.value })}>
                  <option value="rate">Pass rate</option>
                  <option value="zero">Zero tolerance</option>
                </select>
              </Cell>
              {r.kind === 'rate' ? (
                <>
                  <Cell label="Target lower bound (%)">
                    <NumIn value={r.target} onChange={(v) => setRow(r.id, { target: v })} min={1} max={99.9} step={0.1} />
                  </Cell>
                  <Cell label="Pass rate you expect (%)">
                    <NumIn value={r.expected} onChange={(v) => setRow(r.id, { expected: v })} min={1} max={100} step={0.1} />
                  </Cell>
                </>
              ) : (
                <Cell label="Failure rate you can accept (%)">
                  <NumIn value={r.maxFail} onChange={(v) => setRow(r.id, { maxFail: v })} min={0.01} max={50} step={0.1} />
                </Cell>
              )}
              {mode === 'need' && (
                <Cell label="Cases you have (optional)">
                  <NumIn value={r.have} onChange={(v) => setRow(r.id, { have: v })} min={0} step={1} />
                </Cell>
              )}
            </div>
            <div className="slice-out" aria-live="polite">
              {mode === 'budget' && byId[r.id] ? (
                <BudgetOut b={byId[r.id]} />
              ) : r.valid ? (
                <>
                  <strong>{fmt(r.cases)}</strong>
                  <span>{r.kind === 'zero' ? 'cases, all must pass' : 'cases needed'}</span>
                </>
              ) : (
                <span className="size-problem">{r.problem}</span>
              )}
              <button type="button" className="ghost small" onClick={() => removeRow(r.id)} disabled={sizing.rows.length < 2}>Remove</button>
            </div>
            {mode === 'need' && r.valid && r.have > 0 && (
              <p className="size-note slice-note">
                {r.kind === 'zero'
                  ? `With ${r.have.toLocaleString('en-US')} cases and no failures, the failure rate is below about ${(r.haveBound * 100).toFixed(2)}%.`
                  : `With ${r.have.toLocaleString('en-US')} cases the lower bound at your expected rate would be about ${(r.haveBound * 100).toFixed(1)}%.`}
                {!r.haveOk && ' You need more cases.'}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="actions">
        <button type="button" className="secondary" onClick={() => addRow('rate')}>Add slice</button>
        <button type="button" className="secondary" onClick={() => addRow('zero')}>Add zero-tolerance slice</button>
      </div>

      {mode === 'need' && plan.allValid && (
        <div className="size-result" aria-live="polite">
          <div className="counts">
            <div>
              <strong>{fmt(plan.total)}</strong>
              <span>cases in total ({plan.rows.length} slice{plan.rows.length === 1 ? '' : 's'})</span>
            </div>
          </div>
          <p className="size-note">
            How to read it: each slice is sized on its own, so the total is the sum. Normal slices assume the observed
            pass rate equals the expected rate; if the real rate is lower, the lower bound will be lower too. A
            zero-tolerance slice passes only if no case fails. One failure means you cannot claim the limit. No
            correction is applied for looking at many slices at once.
          </p>
        </div>
      )}
      {mode === 'budget' && budget.valid && (
        <div className="size-result" aria-live="polite">
          <div className="counts">
            <div>
              <strong>{budget.meeting} of {budget.rows.length}</strong>
              <span>slices reach their target with {fmt(budget.budget)} cases</span>
            </div>
          </div>
          <p className="size-note">
            How to read it: each slice gets an equal share of the budget. For a normal slice you see the lower bound you
            could claim if the system passes at the rate you expect. For a zero-tolerance slice you see the failure rate
            you could rule out if no case fails. A slice that misses its target is not a failed test: it means the claim
            you can make is weaker than the target, so report the weaker claim or move cases to that slice.
          </p>
        </div>
      )}
    </section>
  )
}
