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
  if (sizing) {
    const plan = planSize(sizing)
    lines.push('## Test set size estimate', '')
    if (!plan.valid) {
      lines.push(plan.problem, '')
    } else {
      lines.push(
        `Inputs: ${plan.slices} slice(s), target lower bound ${sizing.target}%, expected pass rate ${sizing.expected}%, ${sizing.confidence}% one-sided confidence.`,
        '',
        `- Cases needed per slice: ${fmt(plan.perSlice)}`,
        `- Cases needed in total: ${fmt(plan.total)}`,
      )
      if (plan.available) {
        lines.push(
          `- With ${plan.available} cases available, each slice gets ${plan.eachAvailable}; the lower bound at the expected pass rate would be ${plan.boundWithAvailable === null ? 'not defined' : (plan.boundWithAvailable * 100).toFixed(1) + '%'}.`,
        )
      }
      lines.push('', 'Method: Wilson score lower bound, one-sided. Assumes the observed pass rate equals the expected rate. Each slice is sized on its own. No correction is applied for testing many slices at once.', '')
    }
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
