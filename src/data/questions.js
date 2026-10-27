// Questions about the product. Levels: 0 = Low, 1 = Medium, 2 = High.
// "I don't know" is always scored as the riskiest option.

export const UNKNOWN = 'unknown'
export const UNKNOWN_OPTION = { value: UNKNOWN, label: "I don't know", level: 2 }

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: UNKNOWN, label: "I don't know" },
]

// Part A. Sets the risk level. The highest level among the answers wins.
export const RISK_QUESTIONS = [
  {
    id: 'A1',
    type: 'select',
    label: 'Who relies on the output?',
    help: 'Think about who reads or acts on what the system produces.',
    options: [
      { value: 'staff', label: 'Employees only', level: 0 },
      { value: 'customers', label: 'Customers or partners', level: 1 },
      { value: 'public', label: 'The general public', level: 2 },
      { value: 'professionals', label: 'Professionals who make decisions with it', level: 2 },
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'A2',
    type: 'select',
    label: 'What is the worst realistic effect of a wrong output?',
    help: 'Pick the most serious realistic case, not the average one.',
    options: [
      { value: 'none', label: 'No real effect', level: 0 },
      { value: 'minor', label: 'Inconvenience', level: 0 },
      { value: 'money', label: 'Financial or legal consequences', level: 1 },
      { value: 'health', label: 'Harm to health or safety', level: 2 },
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'A3',
    type: 'select',
    label: 'Can the effect of a wrong output be undone?',
    help: 'For example, a wrong draft can be corrected; a sent message or a deleted record may not be.',
    options: [
      { value: 'easy', label: 'Yes, easily', level: 0 },
      { value: 'partly', label: 'Partly', level: 1 },
      { value: 'no', label: 'No, or it is hard to notice', level: 2 },
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'A4',
    type: 'select',
    label: 'What data does the system handle?',
    help: 'Include data in prompts, retrieved documents, logs and memory.',
    options: [
      { value: 'none', label: 'No sensitive data', level: 0 },
      { value: 'internal', label: 'Internal business data', level: 0 },
      { value: 'personal', label: 'Personal data', level: 1 },
      { value: 'sensitive', label: 'Health, financial data or credentials', level: 2 },
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'A5',
    type: 'radio',
    label: 'Does it make statements about health, money, prices or product properties?',
    help: 'Statements that a person could rely on when deciding or buying.',
    options: [
      { value: 'no', label: 'No', level: 0 },
      { value: 'yes', label: 'Yes', level: 1 },
      UNKNOWN_OPTION,
    ],
  },
]

// Part B. What the system can do. These switch practices on. They do not change the risk level.
export const CAPABILITY_QUESTIONS = [
  {
    id: 'B1',
    type: 'radio',
    label: 'Can it call tools, change data or send messages?',
    help: 'For example: send an email, update a record, run code, call an external API.',
    options: yesNo,
  },
  {
    id: 'B2',
    type: 'radio',
    label: 'Does it read external content?',
    help: 'A knowledge base, uploaded files, web pages or the output of other tools. This is the case for retrieval-augmented generation (RAG).',
    options: yesNo,
  },
  {
    id: 'B3',
    type: 'radio',
    label: 'Does it keep memory between sessions?',
    help: 'For example: remembered user details, saved conversation summaries, stored preferences.',
    options: yesNo,
  },
  {
    id: 'B4',
    type: 'radio',
    label: 'Does it act without a person present?',
    help: 'Scheduled jobs, triggers, or long-running tasks that nobody watches live.',
    options: yesNo,
  },
  {
    id: 'B5',
    type: 'radio',
    label: 'Does it work together with other agents?',
    help: 'Agents that pass tasks or messages to each other.',
    options: yesNo,
  },
  {
    id: 'B6',
    type: 'radio',
    label: 'Does it use a third-party model or component?',
    help: 'A hosted model, an external library, a vendor service inside the pipeline.',
    options: yesNo,
  },
]

// RAG follow-up. Shown when B2 is yes or unknown.
export const RAG_QUESTIONS = [
  {
    id: 'R1',
    type: 'checks',
    label: 'Where does the content come from?',
    help: 'Select all that apply.',
    options: [
      { value: 'kb', label: 'Own approved knowledge base' },
      { value: 'uploads', label: 'Documents uploaded by users' },
      { value: 'web', label: 'Web pages or search results' },
      { value: 'tools', label: 'Output of other tools or systems' },
    ],
  },
  {
    id: 'R2',
    type: 'select',
    label: 'Who can add or change documents in the sources?',
    help: 'Anyone who can write to the sources can influence the answers.',
    options: [
      { value: 'few', label: 'A small, controlled team', level: 0 },
      { value: 'many', label: 'Many internal people', level: 1 },
      { value: 'open', label: 'Any user or any outside source', level: 2 },
      UNKNOWN_OPTION,
    ],
  },
  {
    id: 'R3',
    type: 'radio',
    label: 'Do different users have different access rights to the documents?',
    help: 'If yes, the system must not show a user documents that user is not allowed to see.',
    options: yesNo,
  },
  {
    id: 'R4',
    type: 'radio',
    label: 'Must answers cite their sources?',
    help: 'For example: a link or a document title next to each claim.',
    options: yesNo,
  },
]

// Part C. People and feedback.
export const PEOPLE_QUESTIONS = [
  {
    id: 'C1',
    type: 'radio',
    label: 'Does a person check every output before it reaches the user?',
    help: 'This does not lower the risk level. The check itself is tested with the product.',
    options: yesNo,
  },
  {
    id: 'C2',
    type: 'radio',
    label: 'Do human approve or reject decisions flow back into test data?',
    help: 'For example: approved drafts are saved as good examples for later evaluation.',
    options: yesNo,
  },
]

export const ALL_QUESTIONS = [
  ...RISK_QUESTIONS,
  ...CAPABILITY_QUESTIONS,
  ...RAG_QUESTIONS,
  ...PEOPLE_QUESTIONS,
]
