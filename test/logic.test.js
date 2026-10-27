import test from 'node:test'
import assert from 'node:assert/strict'
import { computeTier, practicesFor, buildReport, showRag } from '../src/logic.js'
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
