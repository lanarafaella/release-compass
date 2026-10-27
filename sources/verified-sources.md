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

Published 2025-12-09. Entry titles taken from the OWASP announcement page:
https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/

| ID | Title | Status |
|---|---|---|
| ASI01 | Agent Goal Hijack | title verified |
| ASI02 | Tool Misuse | title verified |
| ASI03 | Identity & Privilege Abuse | title verified |
| ASI04 | Agentic Supply Chain Vulnerabilities | title verified |
| ASI05 | Unexpected Code Execution | title verified |
| ASI06 | Memory & Context Poisoning | title verified |
| ASI07 | Insecure Inter-Agent Communication | title verified |
| ASI08 | Cascading Failures | title verified |
| ASI09 | Human-Agent Trust Exploitation | title verified |
| ASI10 | Rogue Agents | title verified |

Only the titles were checked. The full document (a download that returned an HTML page when
fetched by script) has not been read, so descriptions are not recorded.

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

## NIST AI 600-1, Generative AI Profile

NIST AI 600-1, July 2024. https://doi.org/10.6028/NIST.AI.600-1
Read from the PDF text. The profile lists 12 risks and gives suggested actions with ids that
point to AI RMF subcategories (GV, MP, MS, MG prefixes = GOVERN, MAP, MEASURE, MANAGE).

Twelve risks (titles exact): 1 CBRN Information or Capabilities; 2 Confabulation; 3 Dangerous,
Violent, or Hateful Content; 4 Data Privacy; 5 Environmental Impacts; 6 Harmful Bias or
Homogenization; 7 Human-AI Configuration; 8 Information Integrity; 9 Information Security;
10 Intellectual Property; 11 Obscene, Degrading, and/or Abusive Content; 12 Value Chain and
Component Integration. Status: verified.

Note: the risk list uses "Harmful Bias or Homogenization" in the list and "Harmful Bias and
Homogenization" in the action tables. Cite the list form.

Data Privacy risk text names "biometric, health, location, or other personally identifiable
information or sensitive data". Dangerous, Violent, or Hateful Content includes
"recommendations to carry out self-harm".

Suggested actions checked (short wording):

| Action ID | What it says (short) | Status |
|---|---|---|
| MS-1.3-002 | Engage in internal and external evaluations, red-teaming, impact assessments or other structured human feedback with people who know the context of use | verified |
| MS-2.3-003 | Share pre-deployment test results with relevant actors, such as those with system release approval authority | verified |
| MS-2.5-001 | Avoid extrapolating system performance from narrow, non-systematic, anecdotal assessments | verified |
| MS-2.5-003 | Review and verify sources and citations in outputs during pre-deployment measurement and ongoing monitoring | verified |
| MS-2.7-007 | Perform AI red-teaming to assess resilience against abuse, GAI attacks (for example prompt injection) and ML attacks | verified |
| MS-2.11-001 | Apply use-case appropriate benchmarks to quantify systemic bias, stereotyping and hateful content; document benchmark limits | verified |
| MS-2.13-001 | Check construct validity of each metric; measure and document variance in metrics or structured human feedback | verified |
| MS-4.2-005 | Verify and document how structured feedback results enter go/no-go, monitoring and decommission decisions | verified |
| MP-5.1-005 | Conduct adversarial role-playing, red-teaming or chaos testing to find unforeseen failure modes | verified |
| MG-4.1-002 | Post-deployment monitoring procedures, particularly for confabulation, CBRN or cyber risks | wording incomplete in extraction; not used |

## WHO, Ethics and governance of artificial intelligence for health (2021)

Published 28 June 2021 (WHO page). Read from the PDF. Six consensus principles, titles exact:
(1) Protect autonomy; (2) Promote human well-being, human safety and the public interest;
(3) Ensure transparency, explainability and intelligibility; (4) Foster responsibility and
accountability; (5) Ensure inclusiveness and equity; (6) Promote artificial intelligence that is
responsive and sustainable. Status: verified. Section numbers in the report: 5.1 to 5.6.

Relevant passages (paraphrased):
- 5.2: AI should meet regulatory requirements for safety, accuracy and efficacy before deployment;
  developers and users have a continuous duty to measure and monitor performance and to assess
  harm to individuals or groups. Verified.
- 5.3: information should be documented before design and deployment and kept up to date after
  approval. Verified.
- 5.4: "human warranty": points of human supervision are set upstream and downstream of the
  algorithm; there should be accountability and redress when something goes wrong. Verified.

## WHO, Guidance on large multi-modal models (LMMs)

Title: Ethics and governance of artificial intelligence for health. Guidance on large
multi-modal models. The document gives 2024 as its year (suggested citation: Geneva: World
Health Organization; 2024). The WHO web page lists 25 March 2025. Cite as 2024 and note the page date.
Read from the PDF. Structure: Part I applications, challenges and risks (sections 2 and 3);
Part II ethics and governance (sections 4 to 8: development, provision, deployment, liability,
international governance).

- Section 6.3 (responsibilities of deployers): a deployer should not use an LMM in an inappropriate
  setting; should communicate risks and errors that harmed users, not in fine print; in some
  circumstances may be responsible for suspending use or removing the application. Verified.
- Automation bias (a clinician may overlook errors) is named as a risk in the document. Verified.

## FTC Act, Section 5 (15 U.S.C. 45)

Source: https://www.law.cornell.edu/uscode/text/15/45
- 45(a)(1): "unfair or deceptive acts or practices in or affecting commerce, are hereby declared
  unlawful." Verified.
- 45(n): an act is "unfair" when it "causes or is likely to cause substantial injury to consumers
  which is not reasonably avoidable by consumers themselves" and is not outweighed by countervailing
  benefits. Verified.

## FTC Health Breach Notification Rule (16 CFR Part 318)

Source: https://www.law.cornell.edu/cfr/text/16/part-318 (source line: 74 FR 42980, Aug. 25, 2009,
as amended at 89 FR 47054, May 30, 2024). Sections: 318.1 purpose and scope, 318.2 definitions,
318.4 timeliness of notification, 318.5 methods of notice, 318.7 enforcement.
- 318.4(a): notice to individuals promptly and "in no case later than 60 calendar days after the
  discovery of a breach of security." Verified.
- 318.4(b): notice to the FTC at the same time for 500 or more individuals; fewer than 500 may be
  reported annually, within 60 days after the end of the calendar year. Verified.
- Definitions of "PHR identifiable health information", "personal health record" and "breach of
  security" are in 318.2. Opening words verified; full definitions not recorded here.
- Whether a given product is covered by this rule is a legal question. Not assessed.

## Still to check

Full text of the OWASP Agentic Top 10 document (titles only so far).
IMDRF final GMLP document (January 2025): not read.

## Books and courses (ideas, not standards)

Arbon, J. Testing AI: Engineering Confidence in Non-Deterministic Systems (2026).
Author's own course material.
