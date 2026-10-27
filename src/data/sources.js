// Source registry. Every entry was checked against the original on 2026-10-26.
// See sources/verified-sources.md for what exactly was checked.

const ASI_URL =
  'https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/'
const RMF = 'https://doi.org/10.6028/NIST.AI.100-1'
const GAI = 'https://doi.org/10.6028/NIST.AI.600-1'
const GMLP =
  'https://www.gov.uk/government/publications/good-machine-learning-practice-for-medical-device-development-guiding-principles/good-machine-learning-practice-for-medical-device-development-guiding-principles'
const WHO21 = 'https://www.who.int/publications/i/item/9789240029200'

const owasp = (label, url) => ({ label, url, kind: 'standard' })
const asi = (label) => ({ label, url: ASI_URL, kind: 'standard', note: 'title checked' })
const rmf = (label) => ({ label: `NIST AI RMF 1.0, ${label}`, url: RMF, kind: 'standard' })
const gai = (label) => ({ label: `NIST AI 600-1, ${label}`, url: GAI, kind: 'standard' })
const gmlp = (label) => ({ label: `GMLP principle ${label}`, url: GMLP, kind: 'standard' })
const who = (label) => ({
  label: `WHO (2021) Ethics and governance of AI for health, ${label}`,
  url: WHO21,
  kind: 'standard',
})

export const SOURCES = {
  'owasp-llm01': owasp('OWASP LLM01:2025 Prompt Injection', 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/'),
  'owasp-llm02': owasp('OWASP LLM02:2025 Sensitive Information Disclosure', 'https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/'),
  'owasp-llm03': owasp('OWASP LLM03:2025 Supply Chain', 'https://genai.owasp.org/llmrisk/llm032025-supply-chain/'),
  'owasp-llm06': owasp('OWASP LLM06:2025 Excessive Agency', 'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/'),
  'owasp-llm08': owasp('OWASP LLM08:2025 Vector and Embedding Weaknesses', 'https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/'),
  'owasp-llm09': owasp('OWASP LLM09:2025 Misinformation', 'https://genai.owasp.org/llmrisk/llm092025-misinformation/'),

  asi01: asi('OWASP Agentic Top 10 (2026) ASI01 Agent Goal Hijack'),
  asi02: asi('OWASP Agentic Top 10 (2026) ASI02 Tool Misuse'),
  asi03: asi('OWASP Agentic Top 10 (2026) ASI03 Identity & Privilege Abuse'),
  asi06: asi('OWASP Agentic Top 10 (2026) ASI06 Memory & Context Poisoning'),
  asi07: asi('OWASP Agentic Top 10 (2026) ASI07 Insecure Inter-Agent Communication'),
  asi08: asi('OWASP Agentic Top 10 (2026) ASI08 Cascading Failures'),
  asi10: asi('OWASP Agentic Top 10 (2026) ASI10 Rogue Agents'),

  'nist-m11': rmf('MEASURE 1.1'),
  'nist-m12': rmf('MEASURE 1.2'),
  'nist-m13': rmf('MEASURE 1.3'),
  'nist-m21': rmf('MEASURE 2.1'),
  'nist-m23': rmf('MEASURE 2.3'),
  'nist-m24': rmf('MEASURE 2.4'),
  'nist-m25': rmf('MEASURE 2.5'),
  'nist-m26': rmf('MEASURE 2.6'),
  'nist-m27': rmf('MEASURE 2.7'),
  'nist-m210': rmf('MEASURE 2.10'),
  'nist-m211': rmf('MEASURE 2.11'),
  'nist-m213': rmf('MEASURE 2.13'),
  'nist-m33': rmf('MEASURE 3.3'),
  'nist-m41': rmf('MEASURE 4.1'),
  'nist-m42': rmf('MEASURE 4.2'),
  'nist-g11': rmf('MANAGE 1.1'),
  'nist-g12': rmf('MANAGE 1.2'),
  'nist-g13': rmf('MANAGE 1.3'),
  'nist-g14': rmf('MANAGE 1.4'),
  'nist-g23': rmf('MANAGE 2.3'),
  'nist-g24': rmf('MANAGE 2.4'),
  'nist-g31': rmf('MANAGE 3.1'),
  'nist-g41': rmf('MANAGE 4.1'),
  'nist-g42': rmf('MANAGE 4.2'),
  'nist-g43': rmf('MANAGE 4.3'),

  'gai-ms23-003': gai('action MS-2.3-003'),
  'gai-ms25-001': gai('action MS-2.5-001'),
  'gai-ms25-003': gai('action MS-2.5-003'),
  'gai-ms27-007': gai('action MS-2.7-007'),
  'gai-ms211-001': gai('action MS-2.11-001'),
  'gai-ms213-001': gai('action MS-2.13-001'),
  'gai-ms42-005': gai('action MS-4.2-005'),
  'gai-mp51-005': gai('action MP-5.1-005'),
  'gai-confab': gai('risk Confabulation'),
  'gai-privacy': gai('risk Data Privacy'),
  'gai-human': gai('risk Human-AI Configuration'),
  'gai-value': gai('risk Value Chain and Component Integration'),

  gmlp1: gmlp('1: Multidisciplinary expertise is leveraged throughout the total product life cycle'),
  gmlp3: gmlp('3: Clinical study participants and data sets are representative of the intended patient population'),
  gmlp4: gmlp('4: Training data sets are independent of test sets'),
  gmlp5: gmlp('5: Selected reference datasets are based upon best available methods'),
  gmlp6: gmlp('6: Model design is tailored to the available data and reflects the intended use of the device'),
  gmlp7: gmlp('7: Focus is placed on the performance of the human-AI team'),
  gmlp8: gmlp('8: Testing demonstrates device performance during clinically relevant conditions'),
  gmlp9: gmlp('9: Users are provided clear, essential information'),
  gmlp10: gmlp('10: Deployed models are monitored for performance and retraining risks are managed'),

  who52: who('5.2 Promote human well-being, human safety and the public interest'),
  who53: who('5.3 Ensure transparency, explainability and intelligibility'),
  who54: who('5.4 Foster responsibility and accountability'),
  who55: who('5.5 Ensure inclusiveness and equity'),
  'who-lmm': {
    label: 'WHO (2024) Guidance on large multi-modal models, section 6.3 and automation bias',
    url: 'https://www.who.int/publications/i/item/9789240084759',
    kind: 'standard',
  },

  ftc5: {
    label: 'FTC Act Section 5 (15 U.S.C. 45)',
    url: 'https://www.law.cornell.edu/uscode/text/15/45',
    kind: 'standard',
    note: 'whether it applies is a legal question',
  },
  hbnr: {
    label: 'FTC Health Breach Notification Rule (16 CFR Part 318)',
    url: 'https://www.law.cornell.edu/cfr/text/16/part-318',
    kind: 'standard',
    note: 'whether it applies is a legal question',
  },

  ragas: {
    label: 'RAGAS metrics documentation (a tool, not a standard)',
    url: 'https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/',
    kind: 'tool',
  },
}
