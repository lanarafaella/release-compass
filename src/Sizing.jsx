import { planSize, SIZE_CAP } from './logic.js'

const fmt = (n) => (n === Infinity ? `more than ${SIZE_CAP.toLocaleString('en-US')}` : n.toLocaleString('en-US'))

function Num({ id, label, help, value, onChange, min, max, step }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {help && <small className="q-help">{help}</small>}
    </label>
  )
}

export default function Sizing({ sizing, setSizing }) {
  const set = (key) => (value) => setSizing({ ...sizing, [key]: value })
  const plan = planSize(sizing)

  return (
    <section className="card sizing">
      <h2>Estimate the test set size</h2>
      <p className="intro">
        How many cases do you need? The estimate uses the lower bound of the Wilson interval. It asks: if the
        system passes at the rate you expect, how many cases are needed before the lower bound reaches your
        target? The numbers below are examples. Replace them with your own.
      </p>

      <div className="sizing-grid">
        <Num
          id="sz-slices"
          label="Number of slices"
          help="A slice is a group of cases reported on its own, such as a category, user group or safety boundary."
          value={sizing.slices}
          onChange={set('slices')}
          min={1}
          max={200}
          step={1}
        />
        <Num
          id="sz-target"
          label="Target lower bound (%)"
          help="The pass rate you want to be able to claim with confidence."
          value={sizing.target}
          onChange={set('target')}
          min={1}
          max={99.9}
          step={0.1}
        />
        <Num
          id="sz-expected"
          label="Pass rate you expect (%)"
          help="Must be higher than the target."
          value={sizing.expected}
          onChange={set('expected')}
          min={1}
          max={100}
          step={0.1}
        />
        <label className="field" htmlFor="sz-conf">
          <span>Confidence (one-sided)</span>
          <select id="sz-conf" value={sizing.confidence} onChange={(e) => set('confidence')(e.target.value)}>
            <option value="90">90%</option>
            <option value="95">95%</option>
            <option value="99">99%</option>
          </select>
          <small className="q-help">Higher confidence needs more cases.</small>
        </label>
        <Num
          id="sz-available"
          label="Cases you have now (optional)"
          help="Shows what lower bound you could claim with the cases you already have."
          value={sizing.available}
          onChange={set('available')}
          min={0}
          step={1}
        />
      </div>

      {!plan.valid && <p className="size-problem">{plan.problem}</p>}

      {plan.valid && (
        <div className="size-result" aria-live="polite">
          <div className="counts">
            <div>
              <strong>{fmt(plan.perSlice)}</strong>
              <span>cases per slice</span>
            </div>
            <div>
              <strong>{fmt(plan.total)}</strong>
              <span>cases in total ({plan.slices} slice{plan.slices === 1 ? '' : 's'})</span>
            </div>
          </div>
          {plan.available > 0 && (
            <p className="size-note">
              With {plan.available.toLocaleString('en-US')} cases, each slice gets {plan.eachAvailable.toLocaleString('en-US')}.{' '}
              {plan.boundWithAvailable === null
                ? 'That is not enough to compute a bound.'
                : `At a ${sizing.expected}% pass rate the lower bound would be about ${(plan.boundWithAvailable * 100).toFixed(1)}%.`}
              {plan.boundWithAvailable !== null && plan.boundWithAvailable * 100 < Number(sizing.target) && ' This is below your target.'}
            </p>
          )}
          <p className="size-note">
            How to read it: sizes are for each slice on its own, so total = slices x cases per slice. The estimate
            assumes the observed pass rate equals the expected rate. If the real pass rate is lower, the lower bound
            will be lower too. No correction is applied for looking at many slices at once, so with many slices
            expect an occasional slice to fall short by chance.
          </p>
        </div>
      )}
    </section>
  )
}
