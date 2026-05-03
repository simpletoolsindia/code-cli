export default function SkillsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Skills</h1>
        <p className="text-lg text-slate-400">
          Skills are specialized instruction packs that give the AI domain-specific knowledge and workflows.
        </p>
      </div>

      {/* For Non-Technical Users */}
      <section className="mb-12 p-6 rounded-xl bg-slate-900/50 border border-slate-800/50">
        <h2 className="text-xl font-bold text-white mb-3">What Are Skills?</h2>
        <p className="text-slate-400 mb-4">
          Skills are like cheat sheets for the AI. They contain expert knowledge about specific topics — like React best practices, Rust ownership patterns, or data science workflows. When the AI sees a task that matches a skill, it can load that skill to get detailed, domain-specific instructions.
        </p>
        <p className="text-slate-400">
          This means the AI gives better, more accurate answers because it has access to specialized knowledge beyond its general training.
        </p>
      </section>

      {/* Skill Structure */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Skill Structure</h2>
        <p className="text-slate-400 mb-4">A skill is a single <code className="doc-code">SKILL.md</code> file with YAML frontmatter:</p>
        <CodeBlock>{`---
name: react-best-practices
description: React 19 best practices and modern patterns
---

# React Best Practices

## Component Design
- Use functional components with hooks
- Prefer composition over inheritance
- Use React.memo for expensive renders

## State Management
- Use useState for local state
- Use useReducer for complex state logic
- Use Context for theme/auth (not everything)

## Performance
- Use React.memo() sparingly
- Use useMemo for expensive computations
- Use useCallback for functions passed as props`}</CodeBlock>
      </section>

      {/* Discovery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Skill Discovery</h2>
        <p className="text-slate-400 mb-4">BeastCLI automatically discovers skills from these locations:</p>

        <table className="doc-table">
          <thead>
            <tr><th>Location</th><th>Pattern</th><th>Scope</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-white">Claude Global</td>
              <td><code className="doc-code">~/.claude/skills/**/SKILL.md</code></td>
              <td>All projects</td>
            </tr>
            <tr>
              <td className="text-white">Agents Global</td>
              <td><code className="doc-code">~/.agents/skills/**/SKILL.md</code></td>
              <td>All projects</td>
            </tr>
            <tr>
              <td className="text-white">Project Skills</td>
              <td><code className="doc-code">.beastcli/skills/**/SKILL.md</code></td>
              <td>Current project only</td>
            </tr>
            <tr>
              <td className="text-white">Config Paths</td>
              <td>Custom directories</td>
              <td>Configurable</td>
            </tr>
            <tr>
              <td className="text-white">Remote URLs</td>
              <td>Git repos</td>
              <td>Auto-pulled</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-lg font-semibold text-white mb-3 mt-6">Configuring Additional Sources</h3>
        <CodeBlock>{`{
  "skills": {
    "paths": [
      "./skills",
      "~/my-shared-skills"
    ],
    "urls": [
      "https://github.com/example/react-skills"
    ]
  }
}`}</CodeBlock>
      </section>

      {/* How Skills Work */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">How Skills Work</h2>
        <div className="space-y-4 text-slate-400">
          <p>
            When BeastCLI starts, it scans all discovery locations and builds a list of available skills. This list is shown to the AI in the system prompt:
          </p>
          <CodeBlock>{`## Available Skills
- **react-best-practices**: React 19 patterns and hooks
- **rust-ownership**: Rust ownership and borrowing
- **python-data-science**: Pandas, NumPy workflows`}</CodeBlock>
          <p>
            When the AI recognizes that a task matches a skill, it uses the <code className="doc-code">skill</code> tool to load the full instructions:
          </p>
          <CodeBlock>{`Tool call: skill({ name: "react-best-practices" })

Output:
<skill_content name="react-best-practices">
Full skill instructions with detailed workflows,
code examples, and best practices...
</skill_content>`}</CodeBlock>
          <p>
            The skill content is then injected into the conversation context, and the AI uses those instructions for its work.
          </p>
        </div>
      </section>

      {/* Permissions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Skill Permissions</h2>
        <p className="text-slate-400 mb-4">
          Skills can be restricted per-agent using the permission system:
        </p>
        <CodeBlock>{`{
  "agent": {
    "build": {
      "permission": [
        { "permission": "skill", "action": "allow" },
        { "permission": "skill", "scope": "rust-ownership", "action": "deny" }
      ]
    }
  }
}`}</CodeBlock>
        <p className="text-slate-500 text-sm mt-3">
          The build agent can load all skills except <code className="doc-code">rust-ownership</code>.
        </p>
      </section>

      {/* Creating Skills */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Creating Your Own Skills</h2>
        <p className="text-slate-400 mb-4">
          Create a <code className="doc-code">SKILL.md</code> file in any discovery location:
        </p>
        <CodeBlock>{`# Create a project-level skill
mkdir -p .beastcli/skills/my-skill
cat > .beastcli/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: My custom workflow for this project
---

# My Skill

## When to Use This Skill
- When working on feature X
- When debugging issue Y

## Steps
1. First, check the database schema
2. Then, run the migration generator
3. Finally, update the API endpoints
EOF`}</CodeBlock>
        <p className="text-slate-500 text-sm mt-3">
          The skill will be available the next time BeastCLI starts or when you begin a new session.
        </p>
      </section>
    </>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-slate-950/80 rounded-lg p-4 font-mono text-sm text-cyber-400 border border-slate-800/50 overflow-x-auto">
      <code>{children}</code>
    </pre>
  )
}
