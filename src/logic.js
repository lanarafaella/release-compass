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

export function buildReport({ name, description, answers }) {
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
      lines.push('', p.what, '', `Why: ${p.why}`)
      if (p.note) lines.push('', `Note: ${p.note}`)
      lines.push('', 'Sources:')
      for (const s of p.sourceList) lines.push(`- ${s.label}${s.note ? ` (${s.note})` : ''}: ${s.url}`)
      lines.push('')
    }
  }
  return lines.join('\n')
}
