import { RISK_QUESTIONS, ALL_QUESTIONS, UNKNOWN } from './data/questions.js'
import { PRACTICES, AREAS, KIND_LABEL } from './data/practices.js'
import { SOURCES } from './data/sources.js'

export const TIER_NAMES = ['Low', 'Medium', 'High']

export const TIER_TEXT = [
  'A wrong output has limited consequences and the system reaches a limited, known group. Evaluation can be lighter, but the basics still apply.',
  'A wrong output can have real consequences, or the system reaches customers. Evaluation should be systematic and repeatable.',
  'A wrong output can seriously harm people, or the system works with sensitive data or reaches people who rely on it directly. Evaluation needs depth, independent review and a recorded release decision.',
]

// The risk level is the highest level among the answered Part A questions.
// "I don't know" counts as High.
export function computeTier(answers) {
  const drivers = []
  let tier = null
  let answered = 0
  for (const q of RISK_QUESTIONS) {
    const value = answers[q.id]
    if (!value) continue
    const opt = q.options.find((o) => o.value === value)
    if (!opt) continue
    answered += 1
    const level = opt.level
    if (tier === null || level > tier) {
      tier = level
      drivers.length = 0
    }
    if (level === tier) drivers.push({ id: q.id, label: q.label, answer: opt.label, unknown: value === UNKNOWN })
  }
  return { tier, drivers, answered, total: RISK_QUESTIONS.length }
}

// One-sided z values for common confidence levels.
export const Z = { 90: 1.2816, 95: 1.6449, 99: 2.3263 }

// Lower bound of the Wilson score interval. p is the observed pass rate (0..1), n the number of cases.
export function wilsonLower(p, n, z) {
  if (!(n > 0)) return 0
  const z2 = z * z
  const centre = p + z2 / (2 * n)
  const spread = z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))
  return (centre - spread) / (1 + z2 / n)
}

export const SIZE_CAP = 100000

// Smallest n per slice for which the Wilson lower bound of the expected pass rate
// reaches the target. Returns null when the inputs cannot work.
export function casesPerSlice({ target, expected, confidence }) {
  const z = Z[confidence]
  if (!z || !(target > 0 && target < 1) || !(expected > 0 && expected <= 1)) return null
  if (expected <= target) return null
  if (wilsonLower(expected, SIZE_CAP, z) < target) return Infinity
  let lo = 1
  let hi = SIZE_CAP
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (wilsonLower(expected, mid, z) >= target) hi = mid
    else lo = mid + 1
  }
  return lo
}

export function planSize(input) {
  const slices = Math.max(1, Math.floor(Number(input.slices) || 0))
  const target = Number(input.target) / 100
  const expected = Number(input.expected) / 100
  const confidence = Number(input.confidence)
  const out = { slices, valid: false }
  if (!(target > 0 && target < 1) || !(expected > 0 && expected <= 1) || !Z[confidence]) {
    out.problem = 'Enter a target between 0 and 100, an expected pass rate up to 100, and a confidence level.'
    return out
  }
  if (expected <= target) {
    out.problem = 'The expected pass rate must be higher than the target. If the system is expected to pass less often than the target, no number of cases will show that it meets it.'
    return out
  }
  const perSlice = casesPerSlice({ target, expected, confidence })
  out.valid = true
  out.perSlice = perSlice
  out.total = perSlice === Infinity ? Infinity : perSlice * slices
  const available = Math.floor(Number(input.available) || 0)
  if (available > 0) {
    const each = Math.floor(available / slices)
    out.available = available
    out.eachAvailable = each
    out.boundWithAvailable = each > 0 ? wilsonLower(expected, each, Z[confidence]) : null
  }
  return out
}

// Zero-tolerance slices: 100% cannot be proven. With no failures in n cases, the failure rate is
// below maxFail (%) at the given one-sided confidence once (1 - maxFail)^n <= 1 - confidence.
export function casesZeroFailures({ maxFail, confidence }) {
  const p = Number(maxFail) / 100
  const c = Number(confidence) / 100
  if (!(p > 0 && p < 1) || !(c > 0 && c < 1)) return null
  return Math.ceil(Math.log(1 - c) / Math.log(1 - p) - 1e-9)
}

// Highest failure rate still possible after n cases with no failures.
export function failBoundZero(n, confidence) {
  if (!(n > 0)) return null
  return 1 - Math.pow(1 - Number(confidence) / 100, 1 / n)
}

// Each row is one slice with its own threshold. kind 'rate': target lower bound and expected pass
// rate (Wilson). kind 'zero': no failures allowed, sized by the failure rate you can live with.
export function planRows(sizing) {
  const confidence = Number(sizing.confidence)
  const rows = (sizing.rows || []).map((r) => {
    const out = { ...r, valid: false }
    if (r.kind === 'zero') {
      const n = casesZeroFailures({ maxFail: r.maxFail, confidence })
      if (n === null) {
        out.problem = 'Enter an allowed failure rate between 0 and 100 (for example 1).'
        return out
      }
      out.valid = true
      out.cases = n
      const have = Math.floor(Number(r.have) || 0)
      if (have > 0) {
        out.have = have
        out.haveBound = failBoundZero(have, confidence)
        out.haveOk = have >= n
      }
      return out
    }
    const one = planSize({ slices: 1, target: r.target, expected: r.expected, confidence })
    if (!one.valid) {
      out.problem = one.problem
      return out
    }
    out.valid = true
    out.cases = one.perSlice
    const have = Math.floor(Number(r.have) || 0)
    if (have > 0) {
      out.have = have
      out.haveBound = wilsonLower(Number(r.expected) / 100, have, Z[confidence])
      out.haveOk = have >= one.perSlice
    }
    return out
  })
  const allValid = rows.length > 0 && rows.every((r) => r.valid)
  // Cases already written count toward the slice; only the rest still has to be written.
  for (const r of rows) {
    if (r.valid) r.remaining = r.cases === Infinity ? Infinity : Math.max(0, r.cases - Math.floor(Number(r.have) || 0))
  }
  const total = allValid ? rows.reduce((a, r) => a + r.cases, 0) : null
  const remaining = allValid ? rows.reduce((a, r) => a + r.remaining, 0) : null
  const haveAny = rows.some((r) => Math.floor(Number(r.have) || 0) > 0)
  return { rows, allValid, total, remaining, haveAny }
}

// Budget mode: the user says how many cases they can afford in total. The budget is split
// evenly across slices and each slice shows what can honestly be claimed with its share.
export function planBudget(sizing) {
  const confidence = Number(sizing.confidence)
  const rows = sizing.rows || []
  const budget = Math.floor(Number(sizing.budget) || 0)
  if (!rows.length) return { valid: false, problem: 'Add at least one slice.', rows: [] }
  if (budget < rows.length) return { valid: false, problem: `Enter a budget of at least ${rows.length} cases, one per slice.`, rows: [] }
  const z = Z[confidence]
  const base = Math.floor(budget / rows.length)
  const extra = budget - base * rows.length
  const need = planRows(sizing).rows
  const out = rows.map((r, i) => {
    const n = base + (i < extra ? 1 : 0)
    const row = { ...r, cases: n, needed: need[i].valid ? need[i].cases : null }
    if (r.kind === 'zero') {
      row.failBound = failBoundZero(n, confidence)
      row.meets = row.needed !== null && n >= row.needed
    } else {
      const expected = Number(r.expected) / 100
      if (!(expected > 0 && expected <= 1)) {
        row.problem = 'Enter the pass rate you expect.'
        return row
      }
      row.lowerBound = wilsonLower(expected, n, z)
      row.meets = row.needed !== null && n >= row.needed
    }
    return row
  })
  return { valid: true, budget, rows: out, meeting: out.filter((r) => r.meets).length }
}

export function makeContext(answers, tier) {
  return {
    tier,
    a: answers,
    yes: (id) => answers[id] === 'yes' || answers[id] === UNKNOWN,
  }
}

export function showRag(answers) {
  return answers.B2 === 'yes' || answers.B2 === UNKNOWN
}

export function practicesFor(answers) {
  const { tier } = computeTier(answers)
  if (tier === null) return []
  const ctx = makeContext(answers, tier)
  const out = []
  for (const p of PRACTICES) {
    const level = p.level(ctx)
    if (!level) continue
    const ids = [...p.sources, ...(p.extraSources ? p.extraSources(ctx) : [])]
    out.push({ ...p, applied: level, sourceList: ids.map((id) => ({ id, ...SOURCES[id] })) })
  }
  out.sort((x, y) => AREAS.indexOf(x.area) - AREAS.indexOf(y.area))
  return out
}

export function unknownAnswers(answers) {
  return ALL_QUESTIONS.filter((q) => answers[q.id] === UNKNOWN).map((q) => q.id)
}

function answerLabel(q, value) {
  if (q.type === 'checks') {
    const list = Array.isArray(value) ? value : []
    if (!list.length) return 'not answered'
    return list.map((v) => q.options.find((o) => o.value === v)?.label ?? v).join('; ')
  }
  if (!value) return 'not answered'
  return q.options.find((o) => o.value === value)?.label ?? value
}

const fmt = (n) => (n === Infinity ? `more than ${SIZE_CAP.toLocaleString('en-US')}` : n.toLocaleString('en-US'))

export function buildReport({ name, description, answers, sizing }) {
  const { tier, drivers, answered, total } = computeTier(answers)
  const list = practicesFor(answers)
  const lines = []
  lines.push(`# AI release guide: ${name || 'Untitled product'}`)
  lines.push('')
  lines.push('Guidance based on public sources. It is not a standard, not legal advice and not a release approval. Check each source before relying on it.')
  lines.push('')
  if (description) {
    lines.push('## Product description', '', description, '')
  }
  lines.push('## Risk level', '')
  if (tier === null) {
    lines.push('Not enough answers yet.', '')
  } else {
    lines.push(`**${TIER_NAMES[tier]}** (${answered} of ${total} risk questions answered)`, '')
    lines.push(TIER_TEXT[tier], '')
    lines.push('Driven by:')
    for (const d of drivers) lines.push(`- ${d.id} ${d.label} ${d.answer}${d.unknown ? " (unknown answers count as High)" : ''}`)
    lines.push('')
  }
  if (sizing && sizing.rows) {
    const plan = planRows(sizing)
    const cell = (v) => String(v).replace(/\|/g, '/')
    const row = (cells) => `| ${cells.map(cell).join(' | ')} |`
    const kindLabel = (r) => (r.kind === 'zero' ? 'Zero tolerance' : 'Pass rate')
    const thresholdLabel = (r) =>
      r.kind === 'zero' ? `Failure rate below ${r.maxFail}%` : `Lower bound ${r.target}%, expected ${r.expected}%`
    lines.push('## Test set size estimate', '')
    lines.push(`${sizing.confidence}% one-sided confidence. Each slice has its own threshold.`, '')
    lines.push(row(['Slice', 'Type', 'Threshold', 'Cases needed', 'Cases you have', 'Still to write', 'Status']))
    lines.push(row(['---', '---', '---', '---:', '---:', '---:', '---']))
    for (const r of plan.rows) {
      const label = r.name || 'Unnamed slice'
      if (!r.valid) {
        lines.push(row([label, kindLabel(r), '', '', '', '', r.problem]))
        continue
      }
      const have = Math.floor(Number(r.have) || 0)
      lines.push(row([label, kindLabel(r), thresholdLabel(r), fmt(r.cases), have, fmt(r.remaining), r.remaining === 0 ? 'Enough' : 'Need more']))
    }
    if (plan.allValid) {
      const haveTotal = plan.rows.reduce((t, r) => t + Math.floor(Number(r.have) || 0), 0)
      lines.push(row(['**Total**', '', '', `**${fmt(plan.total)}**`, `**${haveTotal}**`, `**${fmt(plan.remaining)}**`, '']))
    }
    lines.push('')
    if (sizing.mode === 'budget') {
      const bp = planBudget(sizing)
      if (bp.valid) {
        lines.push('### What the budget supports', '')
        lines.push(`Budget: ${bp.budget} cases, split evenly. ${bp.meeting} of ${bp.rows.length} slices reach their target.`, '')
        lines.push(row(['Slice', 'Type', 'Cases from budget', 'What you can claim', 'Reaches target']))
        lines.push(row(['---', '---', '---:', '---', '---']))
        for (const r of bp.rows) {
          const claim = r.problem
            ? r.problem
            : r.kind === 'zero'
              ? `If none fail: failure rate below ${(r.failBound * 100).toFixed(1)}%`
              : `Lower bound ${(r.lowerBound * 100).toFixed(1)}% (target ${r.target}%)`
          lines.push(row([r.name || 'Unnamed slice', kindLabel(r), r.cases, claim, r.meets ? 'Yes' : 'No']))
        }
        lines.push('')
      }
    }
    lines.push('Method: pass-rate slices use the Wilson score lower bound, one-sided, and assume the observed pass rate equals the expected rate. Zero-tolerance slices cannot prove 100%; they show the failure rate is below the stated limit when no case fails. Each slice is sized on its own. No correction is applied for testing many slices at once.', '')
  }
  lines.push('## Answers', '')
  for (const q of ALL_QUESTIONS) {
    if (q.id.startsWith('R') && !showRag(answers)) continue
    lines.push(`- ${q.id} ${q.label} ${answerLabel(q, answers[q.id])}`)
  }
  lines.push('')
  for (const level of ['required', 'recommended']) {
    const items = list.filter((p) => p.applied === level)
    if (!items.length) continue
    lines.push(`## ${level === 'required' ? 'Core practices for this level' : 'Recommended practices'}`, '')
    for (const p of items) {
      lines.push(`### ${p.title}`)
      lines.push(`Area: ${p.area}. ${KIND_LABEL[p.kind]}.`)
      if (p.condition) lines.push(p.condition)
      lines.push('', p.what)
      if (p.steps) {
        lines.push('')
        for (const s of p.steps) lines.push(`- ${s}`)
      }
      lines.push('', `Why: ${p.why}`)
      if (p.note) lines.push('', `Note: ${p.note}`)
      lines.push('', 'Sources:')
      for (const s of p.sourceList) lines.push(`- ${s.label}${s.note ? ` (${s.note})` : ''}: ${s.url}`)
      lines.push('')
    }
  }
  return lines.join('\n')
}
