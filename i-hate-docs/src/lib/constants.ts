export const APP_NAME = 'I Hate Docs';

export const VIEW_LABELS: Record<string, string> = {
  workspace: 'Workspace',
  documents: 'All Documents',
  agents: 'AI Agents',
  presentation: 'Presentations',
  redesign: 'AI Redesign',
  research: 'Research Mode',
  'multi-doc': 'Multi-Document',
  recent: 'Recent',
  shared: 'Shared with me',
  starred: 'Starred',
  templates: 'Templates',
  trash: 'Trash',
  settings: 'Settings',
};

export const FILE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDF', mime: 'application/pdf' },
  { id: 'docx', label: 'DOCX', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { id: 'pptx', label: 'PPTX', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  { id: 'image', label: 'Images', mimePrefix: 'image/' },
  { id: 'xlsx', label: 'Spreadsheets', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
] as const;

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const PRESENTATION_THEMES = [
  { id: 'midnight', label: 'Midnight Indigo', gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
  { id: 'slate', label: 'Deep Slate', gradient: 'linear-gradient(135deg, #0f172a, #1e293b)' },
  { id: 'navy', label: 'Dark Navy', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 'obsidian', label: 'Obsidian', gradient: 'linear-gradient(135deg, #0d1117, #161b22)' },
  { id: 'warm', label: 'Warm Stone', gradient: 'linear-gradient(135deg, #1c1917, #292524)' },
] as const;

export const REDESIGN_TEMPLATES = [
  { id: 'modern-dark', label: 'Modern Dark', gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
  { id: 'minimal-light', label: 'Minimal Light', gradient: 'linear-gradient(135deg, #fff, #f1f5f9)' },
  { id: 'executive', label: 'Executive', gradient: 'linear-gradient(135deg, #0f172a, #1e3a5f)' },
  { id: 'warm', label: 'Warm', gradient: 'linear-gradient(135deg, #1c1917, #44403c)' },
] as const;

export const AGENTS: import('@/types').Agent[] = [
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Analyze papers, extract key findings, generate literature reviews, and cross-reference citations automatically.',
    icon: 'book-open',
    color: '#6366f1',
    capabilities: [
      { name: 'Paper Analysis', description: 'Deep analysis of academic papers', icon: 'book-open' },
      { name: 'Citation Check', description: 'Validate and cross-reference citations', icon: 'link' },
      { name: 'Lit Review', description: 'Auto-generate literature reviews', icon: 'list' },
      { name: 'Summary', description: 'Concise paper summaries', icon: 'file-text' },
    ],
    is_active: true,
  },
  {
    id: 'contract',
    name: 'Contract Analyzer',
    description: 'Review legal documents, flag risky clauses, suggest revisions, and generate contract summaries.',
    icon: 'scale',
    color: '#ef4444',
    capabilities: [
      { name: 'Risk Detection', description: 'Identify risky clauses', icon: 'alert-triangle' },
      { name: 'Clause Review', description: 'Detailed clause analysis', icon: 'search' },
      { name: 'Compliance', description: 'Regulatory compliance check', icon: 'shield' },
    ],
    is_active: true,
  },
  {
    id: 'presentation',
    name: 'Presentation Builder',
    description: 'Convert any document into beautiful slide decks with AI-designed layouts.',
    icon: 'presentation',
    color: '#f59e0b',
    capabilities: [
      { name: 'Slide Gen', description: 'Auto-generate slides', icon: 'layout' },
      { name: 'Design', description: 'AI theme selection', icon: 'palette' },
      { name: 'Export', description: 'Export to PPTX/PDF', icon: 'download' },
      { name: 'Notes', description: 'Speaker notes generation', icon: 'mic' },
    ],
    is_active: true,
  },
  {
    id: 'academic',
    name: 'Academic Assistant',
    description: 'Analyze equations, convert to LaTeX, format IEEE/ACM papers, generate BibTeX.',
    icon: 'graduation-cap',
    color: '#10b981',
    capabilities: [
      { name: 'LaTeX', description: 'LaTeX conversion', icon: 'code' },
      { name: 'Equations', description: 'Equation explanation', icon: 'sigma' },
      { name: 'IEEE', description: 'IEEE formatting', icon: 'file' },
      { name: 'BibTeX', description: 'Reference generation', icon: 'bookmark' },
    ],
    is_active: true,
  },
  {
    id: 'report',
    name: 'Report Generator',
    description: 'Transform raw data into polished, formatted reports with charts and executive summaries.',
    icon: 'bar-chart',
    color: '#3b82f6',
    capabilities: [
      { name: 'Charts', description: 'Auto-generate charts', icon: 'bar-chart' },
      { name: 'Formatting', description: 'Professional formatting', icon: 'paintbrush' },
      { name: 'Templates', description: 'Report templates', icon: 'layout-template' },
      { name: 'Export', description: 'Multi-format export', icon: 'download' },
    ],
    is_active: true,
  },
  {
    id: 'resume',
    name: 'Resume Optimizer',
    description: 'Optimize CVs for specific roles, improve formatting, match ATS requirements.',
    icon: 'user',
    color: '#8b5cf6',
    capabilities: [
      { name: 'ATS', description: 'ATS compatibility', icon: 'check-circle' },
      { name: 'Keywords', description: 'Keyword optimization', icon: 'key' },
      { name: 'Format', description: 'Professional formatting', icon: 'layout' },
    ],
    is_active: true,
  },
];
