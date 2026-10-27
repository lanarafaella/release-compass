# Product questions (draft 1)

Every question has an answer option "I don't know". It is scored as the riskier option.
Sources refer to entries in sources/verified-sources.md.

## Part A. What can go wrong (sets the risk level)

| ID | Question | Basis |
|---|---|---|
| A1 | Who relies on the output? Employees only / customers or partners / the public / professionals making decisions | NIST MEASURE 4.1, 2.3 |
| A2 | Worst realistic effect of a wrong output? None / inconvenience / money or legal / health or safety | WHO 2021 5.2; NIST MEASURE 2.6 |
| A3 | Can the effect be undone? Easily / partly / no, or hard to notice | NIST MANAGE 1.2, 1.4 |
| A4 | What data does it handle? None / internal / personal / health, financial or credentials | NIST GenAI Profile (Data Privacy); NIST MEASURE 2.10; OWASP LLM02 |
| A5 | Does it make statements about health, money, prices or product properties? | FTC Act Section 5; WHO 2021 5.2 |

## Part B. What the system can do (switches extra practices on)

| ID | Question | Basis |
|---|---|---|
| B1 | Can it call tools, change data or send messages? | OWASP LLM06; ASI02; ASI03 |
| B2 | Does it read external content: knowledge base, uploaded files, web pages, tool output? If yes, show the RAG questions below | OWASP LLM01 (indirect), LLM08, LLM09; NIST MS-2.5-003 |
| B3 | Does it keep memory between sessions? | OWASP ASI06; LLM02 |
| B4 | Does it act without a person present (scheduled or triggered)? | OWASP ASI08; ASI10; NIST MANAGE 2.4 |
| B5 | Does it work together with other agents? | OWASP ASI07 |
| B6 | Does it use a third-party model or component? | NIST GenAI Profile (Value Chain and Component Integration); NIST MANAGE 3.1; OWASP LLM03 |

### RAG questions (shown when B2 = yes). Label in the app: "RAG evaluation"

| ID | Question | Basis |
|---|---|---|
| R1 | Where does the content come from? Own approved knowledge base / user uploads / the web | OWASP LLM01 (indirect); LLM09 |
| R2 | Who can add or change documents in it? | OWASP LLM08; LLM01 |
| R3 | Can users get documents they should not have access to? | OWASP LLM08; LLM02 |
| R4 | Must the answer cite its sources? | NIST MS-2.5-003 |

RAG practices: evaluate retrieval separately from generation; check that the answer is supported by
what was retrieved; test for harmful instructions inside documents; test document access rights.
Tools such as RAGAS can compute metrics for this. RAGAS is mentioned as an example tool, not a requirement.

## Part C. People and feedback

| ID | Question | Basis |
|---|---|---|
| C1 | Does a person check every output before it reaches the user? | GMLP 7; NIST GenAI Profile (Human-AI Configuration); WHO LMM (automation bias) |
| C2 | Do human approve or reject decisions flow back into test data? | NIST MEASURE 3.3; MS-4.2-005; GMLP 4 |
