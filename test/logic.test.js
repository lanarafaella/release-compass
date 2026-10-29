import test from 'node:test'
import assert from 'node:assert/strict'
import { computeTier, practicesFor, buildReport, showRag, wilsonLower, casesPerSlice, planSize, planRows, planBudget, casesZeroFailures, failBoundZero, Z } from '../src/logic.js'
import { SOURCES } from '../src/data/sources.js'
import { PRACTICES } from '../src/data/practices.js'

const low = { A1: 'staff', A2: 'minor', A3: 'easy', A4: 'none', A5: 'no' }

test('all low answers give Low', () => {
  assert.equal(computeTier(low).tier, 0)
})

test('highest answer wins: one High answer makes the product High', () => {
  const a = { ...low, A4: 'sensitive' }
  const r = computeTier(a)
  assert.equal(r.tier, 2)
  assert.deepEqual(r.drivers.map((d) => d.id), ['A4'])
})

test('unknown counts as High', () => {
  assert.equal(computeTier({ ...low, A2: 'unknown' }).tier, 2)
})

test('no answers gives no tier', () => {
  assert.equal(computeTier({}).tier, null)
  assert.deepEqual(practicesFor({}), [])
})

test('medium from financial effect', () => {
  assert.equal(computeTier({ ...low, A2: 'money' }).tier, 1)
})

test('human review answer does not change the tier', () => {
  const a = computeTier({ ...low, A4: 'sensitive', C1: 'yes' }).tier
  const b = computeTier({ ...low, A4: 'sensitive', C1: 'no' }).tier
  assert.equal(a, b)
})

test('capability answers do not change the tier', () => {
  const t = computeTier({ ...low, B1: 'yes', B2: 'yes', B3: 'yes', B4: 'yes' }).tier
  assert.equal(t, 0)
})

test('RAG practices appear only with external content', () => {
  const without = practicesFor({ ...low, B2: 'no' }).map((p) => p.id)
  assert.ok(!without.includes('P14') && !without.includes('P15'))
  const withRag = practicesFor({ ...low, B2: 'yes' }).map((p) => p.id)
  assert.ok(withRag.includes('P14') && withRag.includes('P15') && withRag.includes('P09'))
  assert.equal(showRag({ B2: 'yes' }), true)
  assert.equal(showRag({ B2: 'no' }), false)
  assert.equal(showRag({ B2: 'unknown' }), true)
})

test('tool practice appears with tools and is required above Low', () => {
  const p = practicesFor({ ...low, A2: 'money', B1: 'yes' }).find((x) => x.id === 'P10')
  assert.equal(p.applied, 'required')
})

test('feedback practice only when feedback flows into test data', () => {
  assert.ok(!practicesFor({ ...low, C2: 'no' }).some((p) => p.id === 'P22'))
  assert.ok(practicesFor({ ...low, C2: 'yes' }).some((p) => p.id === 'P22'))
})

test('every practice cites at least one registered source', () => {
  for (const p of PRACTICES) {
    assert.ok(p.sources.length > 0, `${p.id} has no sources`)
    for (const id of p.sources) assert.ok(SOURCES[id], `${p.id} cites unknown source ${id}`)
  }
})

test('report contains the tier and source links', () => {
  const text = buildReport({ name: 'Test bot', description: 'x', answers: { ...low, A4: 'sensitive', B2: 'yes' } })
  assert.match(text, /\*\*High\*\*/)
  assert.match(text, /https:\/\/genai\.owasp\.org/)
  assert.match(text, /RAG evaluation|retrieval/i)
})

test('Wilson lower bound matches the worked examples', () => {
  assert.ok(Math.abs(wilsonLower(19 / 20, 20, Z[95]) - 0.804) < 0.002)
  assert.ok(Math.abs(wilsonLower(190 / 200, 200, Z[95]) - 0.918) < 0.002)
})

test('zero failures: n / (n + z^2)', () => {
  const n = casesPerSlice({ target: 0.95, expected: 1, confidence: 95 })
  assert.equal(n, 52)
  assert.ok(wilsonLower(1, 52, Z[95]) >= 0.95)
  assert.ok(wilsonLower(1, 51, Z[95]) < 0.95)
})

test('size plan multiplies by the number of slices', () => {
  const one = planSize({ slices: 1, target: 90, expected: 98, confidence: 95 })
  const four = planSize({ slices: 4, target: 90, expected: 98, confidence: 95 })
  assert.equal(four.perSlice, one.perSlice)
  assert.equal(four.total, one.perSlice * 4)
})

test('size plan rejects an expected rate at or below the target', () => {
  const p = planSize({ slices: 2, target: 95, expected: 90, confidence: 95 })
  assert.equal(p.valid, false)
})

test('higher confidence needs more cases', () => {
  const a = planSize({ slices: 1, target: 90, expected: 98, confidence: 90 }).perSlice
  const b = planSize({ slices: 1, target: 90, expected: 98, confidence: 99 }).perSlice
  assert.ok(b > a)
})

test('available cases give a bound per slice', () => {
  const p = planSize({ slices: 5, target: 90, expected: 98, confidence: 95, available: 100 })
  assert.equal(p.eachAvailable, 20)
  assert.ok(p.boundWithAvailable > 0 && p.boundWithAvailable < 0.98)
})

test('zero tolerance: no failures in n cases bounds the failure rate', () => {
  assert.equal(casesZeroFailures({ maxFail: 1, confidence: 95 }), 299)
  assert.equal(casesZeroFailures({ maxFail: 0.5, confidence: 95 }), 598)
  assert.equal(casesZeroFailures({ maxFail: 0, confidence: 95 }), null)
  assert.ok(failBoundZero(299, 95) <= 0.01)
  assert.ok(failBoundZero(298, 95) > 0.01)
})

test('each slice keeps its own threshold and the total is the sum', () => {
  const sizing = {
    confidence: '95',
    rows: [
      { id: 'a', kind: 'rate', target: 90, expected: 98, maxFail: 1, have: '' },
      { id: 'b', kind: 'rate', target: 95, expected: 99, maxFail: 1, have: '' },
      { id: 'c', kind: 'zero', target: '', expected: '', maxFail: 1, have: 100 },
    ],
  }
  const plan = planRows(sizing)
  assert.equal(plan.allValid, true)
  assert.ok(plan.rows[1].cases > plan.rows[0].cases)
  assert.equal(plan.rows[2].cases, 299)
  assert.equal(plan.rows[2].haveOk, false)
  assert.equal(plan.total, plan.rows[0].cases + plan.rows[1].cases + 299)
})

test('one invalid slice blocks the total', () => {
  const plan = planRows({ confidence: '95', rows: [{ id: 'a', kind: 'rate', target: 95, expected: 90, have: '' }] })
  assert.equal(plan.allValid, false)
  assert.equal(plan.total, null)
})

test('budget mode splits cases evenly and reports the claim per slice', () => {
  const sizing = {
    confidence: '95',
    budget: 100,
    rows: [
      { id: 'a', kind: 'rate', target: 90, expected: 98 },
      { id: 'b', kind: 'zero', maxFail: 5 },
    ],
  }
  const b = planBudget(sizing)
  assert.equal(b.valid, true)
  assert.equal(b.rows[0].cases + b.rows[1].cases, 100)
  assert.equal(b.rows[0].meets, true)
  assert.equal(b.rows[1].cases, 50)
  assert.equal(b.rows[1].needed, 59)
  assert.equal(b.rows[1].meets, false)
  assert.ok(Math.abs(b.rows[1].failBound - 0.058) < 0.001)
})

test('budget below one case per slice is rejected', () => {
  const b = planBudget({ confidence: '95', budget: 1, rows: [{ id: 'a', kind: 'zero', maxFail: 5 }, { id: 'b', kind: 'zero', maxFail: 5 }] })
  assert.equal(b.valid, false)
})

test('cases you have are subtracted from what is still to write', () => {
  const plan = planRows({
    confidence: '95',
    rows: [
      { id: 'a', kind: 'rate', target: 90, expected: 98, have: 10 },
      { id: 'b', kind: 'rate', target: 90, expected: 98, have: 2 },
      { id: 'c', kind: 'zero', maxFail: 5, have: 100 },
    ],
  })
  const need = plan.rows[0].cases
  assert.equal(plan.rows[0].remaining, need - 10)
  assert.equal(plan.rows[1].remaining, need - 2)
  assert.equal(plan.rows[2].remaining, 0)
  assert.equal(plan.remaining, need - 10 + need - 2)
  assert.equal(plan.haveAny, true)
})

test('report shows the size plan as a table with what is still to write', () => {
  const md = buildReport({
    name: 'x', description: '', answers: {},
    sizing: { confidence: '95', mode: 'need', rows: [
      { id: 'a', name: 'Accuracy', kind: 'rate', target: 90, expected: 98, have: 10 },
      { id: 'b', name: 'Safety', kind: 'zero', maxFail: 5, have: 0 },
    ] },
  })
  assert.ok(md.includes('| Slice | Type | Threshold | Cases needed | Cases you have | Still to write | Status |'))
  assert.ok(md.includes('| Accuracy | Pass rate | Lower bound 90%, expected 98% | 39 | 10 | 29 | Need more |'))
  assert.ok(md.includes('| Safety | Zero tolerance | Failure rate below 5% | 59 | 0 | 59 | Need more |'))
  assert.ok(md.includes('| **Total** |  |  | **98** | **10** | **88** |  |'))
})
