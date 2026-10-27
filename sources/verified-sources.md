# Verified sources

Each entry was checked against the original page. Status "verified" means the identifier
and title below match the source on the date checked. Short excerpts only.

Checked: 2026-10-26.

## OWASP Top 10 for LLM Applications, 2025 edition

Source: https://genai.owasp.org/llm-top-10/

| ID | Title | Status |
|---|---|---|
| LLM01:2025 | Prompt Injection | verified |
| LLM02:2025 | Sensitive Information Disclosure | verified |
| LLM03:2025 | Supply Chain | verified |
| LLM04:2025 | Data and Model Poisoning | verified |
| LLM05:2025 | Improper Output Handling | verified |
| LLM06:2025 | Excessive Agency | verified |
| LLM07:2025 | System Prompt Leakage | verified |
| LLM08:2025 | Vector and Embedding Weaknesses | verified |
| LLM09:2025 | Misinformation | verified |
| LLM10:2025 | Unbounded Consumption | verified |

LLM01 page: describes direct and indirect prompt injection (indirect = external content such
as websites or files alters model behavior). Mitigation list includes "Conduct adversarial
testing and attack simulations" and "Require human approval for high-risk actions". The page
does not use the term "red teaming".

## OWASP Top 10 for Agentic Applications for 2026

Source: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
Published 2025-12-09. Entry list is in the linked download. Status: title and date verified,
individual entries NOT yet checked.

## Good Machine Learning Practice for Medical Device Development: Guiding Principles

Issued by FDA, Health Canada and MHRA (2021). IMDRF published a final document in January 2025
(per the FDA page; the IMDRF text itself not yet read).
Source for the ten titles: UK MHRA publication page on gov.uk.

| # | Title | Status |
|---|---|---|
| 1 | Multidisciplinary expertise is leveraged throughout the total product life cycle | verified |
| 2 | Good software engineering and security practices are implemented | verified |
| 3 | Clinical study participants and data sets are representative of the intended patient population | verified |
| 4 | Training data sets are independent of test sets | verified |
| 5 | Selected reference datasets are based upon best available methods | verified |
| 6 | Model design is tailored to the available data and reflects the intended use of the device | verified |
| 7 | Focus is placed on the performance of the human-AI team | verified |
| 8 | Testing demonstrates device performance during clinically relevant conditions | verified |
| 9 | Users are provided clear, essential information | verified |
| 10 | Deployed models are monitored for performance and retraining risks are managed | verified |

## NIST AI Risk Management Framework (AI RMF 1.0)

NIST AI 100-1, January 2023. https://doi.org/10.6028/NIST.AI.100-1
Read from the PDF text. Four functions: GOVERN, MAP, MEASURE, MANAGE. Subcategory wording below
is shortened; ids are exact.

| ID | What it says (short) | Status |
|---|---|---|
| MEASURE 1.1 | Metrics are selected starting with the most significant risks; risks that will not or cannot be measured are documented | verified |
| MEASURE 1.2 | Appropriateness of metrics and effectiveness of controls are regularly assessed and updated | verified |
| MEASURE 1.3 | Internal experts who were not front-line developers, or independent assessors, take part in assessments; domain experts and users are consulted as needed | verified |
| MEASURE 2.1 | Test sets, metrics and details about tools used during TEVV are documented | verified |
| MEASURE 2.2 | Evaluations involving human subjects meet applicable requirements and are representative of the relevant population | verified |
| MEASURE 2.3 | Performance or assurance criteria are measured and demonstrated for conditions similar to the deployment setting | verified |
| MEASURE 2.4 | Functionality and behavior are monitored when in production | verified |
| MEASURE 2.5 | The system is demonstrated to be valid and reliable; limits of generalizability are documented | verified |
| MEASURE 2.6 | Regular safety evaluation; demonstrated to be safe, residual risk within tolerance, can fail safely | verified |
| MEASURE 2.7 | Security and resilience are evaluated and documented | verified |
| MEASURE 2.8 | Transparency and accountability risks are examined and documented | verified |
| MEASURE 2.9 | Model is explained, validated and documented; output is interpreted in context | verified |
| MEASURE 2.10 | Privacy risk is examined and documented | verified |
| MEASURE 2.11 | Fairness and bias are evaluated and documented | verified |
| MEASURE 2.13 | Effectiveness of the TEVV metrics and processes is evaluated and documented | verified |
| MEASURE 3.1 | Approaches are in place to identify and track existing, unanticipated and emergent risks | verified |
| MEASURE 3.3 | Feedback processes for end users and impacted communities | verified |
| MEASURE 4.1 | Measurement approaches are connected to deployment context and informed by domain experts and users | verified |
| MEASURE 4.2 | Trustworthiness results are informed by domain experts to validate consistent performance | verified |
| MANAGE 1.1 | A determination is made whether the system achieves its purpose and whether deployment should proceed | verified |
| MANAGE 1.3 | Responses to high-priority risks are planned; options include mitigating, transferring, avoiding or accepting | verified |
| MANAGE 1.4 | Negative residual risks are documented | verified |
| MANAGE 2.3 | Procedures to respond to and recover from a previously unknown risk | verified |
| MANAGE 2.4 | Mechanisms to supersede, disengage or deactivate systems that perform inconsistently with intended use | verified |
| MANAGE 4.1 | Post-deployment monitoring plans, including user input, appeal and override, decommissioning, incident response, recovery and change management | verified |
| MANAGE 4.2 | Continual improvement is integrated into system updates | verified |
| MANAGE 4.3 | Incidents and errors are communicated and tracked | verified |

Note: the document's tables place category headings (for example "MEASURE 3: Mechanisms for tracking
identified AI risks over time") beside subcategories that belong to the previous category when the
table breaks across pages. The subcategory ids are the reliable key.

## Still to check

NIST AI 600-1 Generative AI Profile,
WHO guidance on ethics and governance of AI for health (2021) and large multi-modal models (2024),
FTC Act Section 5, FTC Health Breach Notification Rule.

## Books and courses (ideas, not standards)

Arbon, J. Testing AI: Engineering Confidence in Non-Deterministic Systems (2026).
Author's own course material.
