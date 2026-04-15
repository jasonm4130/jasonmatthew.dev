# Content Design: AI Workflow Blog Posts

**Date:** 2026-04-15
**Author:** Jason Matthew
**Status:** Draft for review

---

## Overview

Two new blog posts exploring how AI tools actually work in practice, pushing back on ecosystem hype while offering genuine technical depth. Both are Builder bucket posts aligned with the LinkedIn positioning strategy (lead with technical depth, practitioner voice).

These posts share a thesis: **the AI tooling ecosystem is solving the wrong problems, and the engineers getting the most value are the ones who understand why.**

---

## Post 1: "AI Is Better at Being Human Than Being AI"

**Publish date:** 2026-05-05 (Monday)
**Bucket:** Builder / Curator
**Scheduled slot:** Replaces S3 Vectors (moved to May 12 pre-Summit)

**Excerpt:** _"Every week someone ships a new protocol that claims to make AI smarter. But the best AI workflow I've found uses the same tools humans have used for years."_

**Tags:** `ai`, `developer-tools`, `architecture`, `opinion`

### Target audience

Staff/Principal Engineers, Tech Leads, AI/ML Engineers. People who've used AI coding tools enough to have opinions but may not have examined _why_ certain approaches work better than others.

### Core thesis

AI excels at human interfaces (CLIs, APIs, docs) because that's where the training data is. The industry is building machine-to-machine protocols (MCP) when the AI already speaks the human interface fluently. And the problems MCP claims to solve — memory, learning, context — are model architecture problems, not tooling problems.

### Structure

#### 1. Hook: The conversation (~200 words)

Open with the CTO/CEO conversation. Something someone said that reframed how Jason thinks about AI tooling. The observation: AI is remarkably good at `gh pr create`, `aws s3 ls`, `glab`, Playwright — human interfaces with years of training data. It's better at being a really fast, really well-read human than at being what we imagine "AI" should be.

**Voice note:** Open with a concrete moment, not an abstract thesis. Match the Durable Lambda opening style: "We adopted X. Then Y happened."

#### 2. The MCP gold rush (~400 words)

The ecosystem by the numbers:

- 21,000+ MCP servers indexed across Glama, PulseMCP
- Growth: 56 new servers/month (Sep 2025) → 301/month (Feb 2026)
- 38.7% have no authentication (Bloomberry analysis of 1,400 servers)
- A 5-server setup burns ~55,000+ tokens before you type anything (community-measured, cite as "in my testing" or "widely reported")
- Real CVEs: Anthropic's own Git MCP server (path traversal + argument injection → RCE), Claude Code config injection (CVE-2025-59536, CVSS 8.7), Microsoft MCP vulnerability (CVE-2026-26118, CVSS 8.8)
- Supply chain attack: fake Postmark MCP server silently BCC'd every email to attackers

But the deeper problem isn't quality — it's the premise. MCP creates a machine-to-machine protocol when the AI is already fluent in the human interface. `gh` has massive training data. The MCP wrapper for GitHub adds token overhead, auth risk, and a maintenance dependency to do the same thing worse.

**Acknowledge the exceptions:** Playwright MCP, AWS MCP — some are genuinely useful. The argument isn't "never use MCP." It's "most MCPs solve problems that don't need a new protocol."

**Voice note:** Use the "counterpoint with experience" style: "We hit the same issue but found that X." Don't be a pundit — be a practitioner who tested this.

#### 3. The knowledge spectrum (~400 words, accessible)

Not a binary (notebook vs identity). A spectrum with four zones:

| Zone                           | What it is                          | Examples                                 | Metaphor                                          |
| ------------------------------ | ----------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| 1. Ephemeral context           | Retrieved at query time, gone after | RAG, MCP, tool use                       | Notebook you open, use, close                     |
| 2. Persistent context          | Loaded every session                | CLAUDE.md, rules, skills, system prompts | Notebook you read every morning                   |
| 3. Offline weight modification | Trained into the model, but static  | LoRA, fine-tuning, RLHF                  | Studying for an exam — you retain it but it fades |
| 4. Online weight modification  | Learns during inference             | TTT, Titans, DeepSeek Engram             | Actually learning from experience in real-time    |

Most AI tooling lives in zones 1-2. MCPs, memory systems, RAG — all zone 1-2 solutions marketed as if they solve zone 4 problems.

**The middle ground:** LoRA with hot-swapping is the current best "in-between." Adapters are 10-50MB, swap in <100ms on GPU, and represent actual weight modification that can be reconfigured per-user or per-task at serving time. That's modular, swappable identity — not quite zone 4, but more than a notebook.

**The honest nuance:** These zones aren't failures. Zone 1-2 solutions are production-ready and genuinely useful. The problem is when they're sold as something they're not. RAG doesn't teach the model anything. MCP doesn't give AI "memory." Calling them that creates false expectations and misdirected engineering effort.

#### 4. Deep-dive: What zone 4 actually looks like (~600 words, clearly signposted)

Signal to the reader: _"For those who want the technical depth — here's what the actual frontier looks like. Skip to 'So what do you do today?' if you want the practical takeaway."_

**Google Titans (Dec 2024, NeurIPS 2025)**

- Neural long-term memory module that updates its own weights at test time
- Uses "surprise" (prediction error) as the learning signal — unexpected information gets memorized more strongly
- Benchmarks: near-perfect accuracy at 2M+ token context where standard Transformers degrade to near-random. +20-40 points on multi-needle retrieval at 512K+ contexts
- Followed by MIRAS framework unifying approaches that combine RNN speed with transformer accuracy
- Source: arxiv.org/abs/2501.00663

**Test-Time Training / TTT-E2E (Stanford/Meta, Dec 2025)**

- Reframes language modeling as continual learning
- Meta-learns an initialization optimized for rapid adaptation, then compresses passing context into dynamic MLP layers via next-token prediction
- Benchmarks: matches full-attention accuracy at 128K context, 2.7x faster than Mamba-2 with constant per-token inference cost
- qTTT variant (2026): +12.3 points on Llama-3.1-8B, +14.0 on Qwen2.5-7B on RULER long-context benchmark at 128K
- Sources: arxiv.org/abs/2512.23675, OpenReview qTTT

**DeepSeek Engram**

- Adds a memory axis alongside MoE's computation axis
- Simple factual lookups hit a memory module (cheap), complex reasoning activates expert parameters (expensive)
- Knowledge retrieval and reasoning as separately routable concerns _within the model's own weights_
- Most production-adjacent of the three

**Why it's hard (the honest part):**

- Catastrophic forgetting: new learning destroys old knowledge. Three identified mechanisms: gradient interference in attention weights, representational drift in intermediate layers, loss landscape flattening
- Compute cost: gradient computation during inference is expensive. Current approaches work at 2B-8B parameter scale, not 400B+
- Verification: no reliable way to confirm learned information is correct vs reinforcing errors
- Timeline: 3-5 year horizon for production-grade zone 4 systems

**The honest gap:** No direct TTT vs RAG head-to-head exists in published literature. They're complementary approaches, not competing. Worth stating this — it shows you're not cherry-picking to support a thesis.

#### 5. So what do you do today? (~200 words)

You can't wait for Titans. What works now:

- Use tools AI already knows — CLIs over MCPs for most things
- Invest in context engineering, not more integrations — rules, skills, LSP (semantic code understanding > brute-force grep)
- Treat AI output like junior dev code — CI/CD as the verification backstop
- Accept zone 1-2 solutions for what they are and use them well, instead of expecting them to be zone 4

Tee up Post 2: _"In the next post, I'll walk through the actual setup I use — the specific tools, configuration, and workflow that makes AI coding productive instead of just fast."_

---

## Post 2: "The AI Coding Setup That Actually Works"

**Publish date:** 2026-05-19 (Monday)
**Bucket:** Builder
**Scheduled slot:** Replaces/evolves "Three-Tier Agentic Workflow" outline

**Excerpt:** _"Every team hits the moment where they realise they're patching the wrong architecture. AI didn't change what the right answer was — it changed whether we could afford to do it."_

**Tags:** `ai`, `developer-tools`, `productivity`, `architecture`

### Target audience

Same as Post 1, but this post is purely actionable. The reader who skipped the Titans deep-dive in Post 1 but wants the practical payoff.

### Core thesis

AI is a force multiplier for engineers who already know what to build, and a crutch for engineers who don't. The real value isn't speed — it's making the right architectural decision economically viable when it previously wasn't. The engineers getting the most from AI aren't using more tools or moving faster. They're using fewer tools, better configured, and making decisions they couldn't previously afford to execute.

### Structure

#### 1. Hook: AI makes rearchitecting affordable (~300 words)

Open with the "wrong architecture" moment every team hits. Historically you live with it — the cost of tearing it down and rebuilding is too high relative to the deadline. So you patch. And patch. And patch.

**The story:** Lambda pipeline batching slow calls, waiting on S3 writes. The team knew SQS fanout was the right answer — it wasn't new or exotic. It wasn't chosen originally due to time pressures. When the moment came to rearchitect, AI compressed the effort enough that doing it right was cheaper than continuing to patch. AI didn't change what the right answer was. It changed whether we could afford to do it.

**The flip side:** A less experienced engineer hits the same moment and doesn't recognise it as an architecture problem. They use AI to generate more patches faster. The wrong architecture gets more entrenched, wrapped in layers of AI-generated code nobody understands. AI all the way down, with no human who actually knows how any of it works.

**The data that supports this:**

- METR study (July 2025): 16 experienced open-source devs were 19% _slower_ with AI on familiar maintenance tasks — but perceived themselves 20% faster. AI doesn't make you faster at things you already know. It extends your reach into things you couldn't previously afford.
- Apple "Illusion of Thinking" paper (June 2025): LLM reasoning collapses at high complexity. The model stops trying precisely when the problem is hard enough to need real thinking. The human recognises "this is the wrong architecture." The AI can't.
- Anthropic's own RCT: AI users scored 17 points lower on comprehension, worst on debugging. Speed gain was not statistically significant. The tradeoff is real: marginal speed for measurable understanding loss — unless the human stays in the loop as the thinker, not the typist.

**The thesis:** The value isn't speed. It's reach. And the engineers who get the most value are the ones who know the difference.

**The training data gap as a secondary hook:** AI models are trained on stale data. 45% of devs cite "almost right but not quite" as their top frustration. The workflow below is built around both problems: making the right decisions affordable, and compensating for the model's knowledge gaps.

#### 2. The principle: Context is your most important resource (~300 words)

Everything that follows is a manifestation of one idea: **your context window is the most important resource in AI-assisted development. Everything you put in it has a cost. Noise is worse than silence.**

**The research:**

- "Lost in the Middle" (Liu et al., 2024): 30%+ accuracy drop when key information sits mid-context, even at just 4K tokens. Models attend to the beginning and end; everything in the middle degrades.
- Context rot (Veseli et al., 2025): once context exceeds ~50% capacity, retrieval degrades by distance from the end. A poorly-managed 800K-token context produces worse results than a surgical 2-file approach.
- MCP tool metadata: one developer measured 82K of 143K used tokens (57%) consumed by tool definitions alone. Perplexity's CTO publicly moved away from MCP for this reason.
- Anthropic's own guidance: "the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome."

**Stale context is worse than no context.** OpenAI's hallucination paper (September 2025) showed models are trained to reward confident guessing over calibrated uncertainty — they "learn to bluff." A skill that says "use S3 Vectors v1.2 API pattern" when v2.0 shipped last month doesn't just fail to help — it makes the AI confidently wrong. You're worse off than having no rule at all.

**The clean-and-lean principle:**

- **Skills and rules should encode behaviors, not information.** "Always verify before committing." "Prefer LSP over grep." "Research unfamiliar APIs before implementing." These are durable. They don't go stale.
- **Information should be researched fresh in the moment.** Specific API patterns, architecture recipes, framework conventions — research these when you need them, don't pre-load them. They have an expiry date.
- **Everything that touches your context window should earn its place.** If a tool, rule, or file read doesn't directly serve the current task, it's noise.

Every section that follows is about protecting this resource.

#### 3. The three-tier workflow: Keep research out of your coding context (~500 words)

**Why this matters for context:** Most engineers do research, planning, and implementation in the same tool, in the same session. Every exploratory prompt, every doc paste, every "what does this API do?" question fills the context window with noise that degrades the implementation quality that follows.

Genericised — not Cursor-specific. "Your AI coding tool of choice."

**Tier 1: Structural mapping (Repomix)**

- `npx repomix --style xml --output-show-stats`
- Package your codebase into a digestible format
- This is the "local state" capture — what does the code actually look like right now?

**Tier 2: Research and planning (Gemini Deep Research)**

- Upload the Repomix XML to standard Gemini chat
- Have it analyse architecture, identify gaps, spot unknown unknowns — technologies released after the model's training cutoff
- Draft a targeted Deep Research prompt
- Run Deep Research for live-web patterns (S3 Vectors, Durable Lambda, new framework APIs)
- Output: a spec combining local context with current patterns
- This is the training gap fix — Deep Research browses hundreds of live sources to find what the base model doesn't know
- **All of this exploration happens outside your coding tool.** Gemini's research tokens never touch your implementation context.

**Tier 3: Surgical implementation (your AI tool)**

- Open the spec in Claude Code, Cursor, or your tool of choice
- The spec enters your context as a clean, distilled document — not thousands of tokens of exploratory noise
- Use specific file/symbol mentions
- New session per task — session hygiene
- Zero tokens spent on planning or research in your coding tool

**Why this works:** Each tier protects the next tier's context. Research noise stays in Gemini. Only the distilled spec enters your implementation tool. Your coding context starts clean and stays focused.

**Real example:** Walk through the Durable Lambda deployment versioning discovery — this is already documented in `Reference/AI Workflow/Gemini Research/Durable Lambda Deployment Versioning.md` and maps directly to the published blog post. Show the actual flow: Repomix capture of the Lambda codebase → Gemini identifying the alias mismatch risk → Deep Research finding the version-pinned triggers pattern → implementation in CDK. This grounds the workflow in a story readers may have already seen in the Durable Lambda post.

#### 4. LSP: Precision over noise (~400 words)

**Why this matters for context:** Grep dumps 500+ matches (9,000+ tokens of noise) into your context when you search for `getUserById`. LSP returns the 23 actual call sites in ~230 tokens. Same answer, 75% less context pollution.

Most AI coding tools search your codebase via text matching (grep). LSP gives them semantic understanding — the same intelligence your IDE uses.

**What LSP gives AI tools:**

- `goToDefinition` — resolve the actual definition, not every file containing the function name
- `findReferences` — real call sites, not pattern matches
- `hover` — type information without reading entire files
- `getDiagnostics` — see errors after edits, fix in the same turn

**The numbers:**

- Speed: ~50ms via LSP vs ~45s via grep (900x faster)
- Tokens: ~75% reduction for code navigation tasks
- Accuracy: grep returns comments, strings, variable names that happen to match. LSP returns semantic references only.

**The limitation (Jose Valim's point):** LSP needs file:line:column — you can't just ask "where is Foo defined?" Claude still uses grep for initial discovery, then LSP for precise navigation. They complement each other — but LSP should be the default, grep the fallback.

**Setup:** Claude Code has native LSP since v2.0.74. Install language server binaries + plugins. Enforcement hooks to make the AI actually prefer LSP over grep (it won't by default — known model behavior issue).

**The deeper point:** This is the thesis from Post 1 in practice — LSP is a human tool (built for IDEs) that AI happens to be great at using. No new protocol needed. And it protects your context by returning precise answers instead of noisy search results.

#### 5. Rules and skills: Behaviors not information (~300 words)

**Why this matters for context:** Every rule, skill, and system prompt instruction consumes context budget. Compliance degrades as instruction count grows (IFEval benchmark: ~75-85% on complex multi-constraint prompts, degrades linearly past ~20 constraints). More rules doesn't mean better output — past a threshold, it means worse output.

**The critical distinction:**

| Durable (encode as rules/skills)               | Volatile (research fresh each time)          |
| ---------------------------------------------- | -------------------------------------------- |
| "Always verify before committing"              | "S3 Vectors uses this API pattern"           |
| "Prefer LSP over grep for code navigation"     | "This framework's auth works like X"         |
| "Research unfamiliar APIs before implementing" | "Use DynamoDB single-table design"           |
| "Run tests after every edit"                   | "Lambda Durable Functions checkpoint like Y" |

Behaviors are durable. They don't go stale. Information has an expiry date — and stale information injected as confident context is worse than no information at all.

**The layering:**

- **CLAUDE.md / system prompts** — project-level behaviors loaded every session. Keep them lean: stack, conventions, ways of working. Not architecture recipes.
- **Skills / .mdc rules** — on-demand, loaded only when relevant. ~80 tokens for name+description at startup, full body (275-8,000 tokens) only when activated. Encode behavioral patterns, not specific implementations.
- **Anti-hallucination rules** — five behavioral rules that measurably reduce confident fabrication: admit uncertainty, verify via tools before answering, don't chain-guess, self-correct immediately, cite sources.
- **Fresh research** — specific API patterns, framework conventions, architecture approaches. Use the three-tier workflow. Research when you need it, don't pre-load it.

CI/CD as the final backstop. Always. Treat AI output like junior dev code.

#### 6. Session hygiene: Protect context across time (~300 words)

**Why this matters for context:** Output quality degrades at ~60% context utilisation, well before hard limits. 10 file reads + tool outputs can consume 40-60% of a 200K context window. A 2-hour sprawling session doesn't just feel worse — it measurably produces worse output than three focused 20-minute sessions.

**Practical patterns:**

- Compact every 25-30 minutes or after completing a distinct subtask
- Start fresh sessions for new tasks — context reset is a feature, not a limitation
- One logical change per session. Auth, API, and UI? Three sessions.
- Commit after each completed sub-task as a checkpoint for rollback

**Sub-agents as context isolation:** Each sub-agent runs in its own context window. Offload exploration, research, and broad searches to sub-agents — they explore extensively (tens of thousands of tokens of file reads, search results, exploratory tool calls) but return condensed summaries (1-2K tokens). The noise never touches your main context. This is the same principle as the three-tier workflow, applied within a single tool.

**Dream mode (Claude Code):** Background sub-agent that consolidates memory files between sessions — extracts decisions from transcripts, prunes stale entries, merges duplicates. Context cleanup. Your sessions start cleaner. Invoke manually with `/dream` or let Auto Dream run between sessions.

**Handoff docs:** Write a structured handoff (Status/Files/Decision/Blocked/Next) so successor sessions bootstrap cheaply instead of re-discovering context. This is the filesystem as persistent memory — Markdown files that survive context resets and session boundaries.

**Hooks:** Deterministic automation that fires on lifecycle events — unlike CLAUDE.md instructions, hooks can't be ignored. PostToolUse on Edit to auto-lint. PreToolUse to block dangerous commands or enforce LSP-first navigation. PreCompact to inject critical context before compression. These are behavioral guardrails that protect context quality without consuming context budget.

#### 6. Takeaway (~150 words)

The workflow above is what it looks like when an experienced engineer uses AI. The AI isn't doing the thinking — you are. The AI is compressing the execution.

You recognised the Lambda pipeline was the wrong architecture. AI didn't tell you that. You decided SQS fanout was the right answer. AI didn't decide that either. What AI did was make the rearchitecting affordable — compressing weeks of effort into days, making "do it right" cheaper than "keep patching."

That's the force multiplier. Not speed. Reach.

Invest 30 minutes in planning to save 3 hours of iterative prompting. Give your AI semantic understanding of your code. Manage context like a budget. Stay in the loop as the thinker, not the typist.

The engineers shipping the best work with AI aren't using more tools. They're using fewer tools, better — and they know when the real problem isn't the code.

---

## Calendar Update

| #   | Date       | Title                                         | Bucket              | Status                                       |
| --- | ---------- | --------------------------------------------- | ------------------- | -------------------------------------------- |
| 1   | Apr 14     | The 1:1 That Actually Changed Something       | Leader              | Published                                    |
| 2   | Apr 21     | Durable Lambda: The Deployment Gotcha         | Builder             | Copy ready                                   |
| 3   | Apr 28     | AI Won't Replace Your Seniors                 | Leader/Curator      | Copy ready                                   |
| 4   | **May 5**  | **AI Is Better at Being Human Than Being AI** | **Builder/Curator** | **This spec**                                |
| 5   | **May 12** | **S3 Vectors in Production**                  | **Builder**         | Draft in progress (pre-AWS Summit May 15-16) |
| 6   | **May 19** | **The AI Coding Setup That Actually Works**   | **Builder**         | **This spec**                                |
| 7   | May 26     | Building in Public                            | Builder/Leader      | Written                                      |
| 8   | Jun 2      | The Weekend Deploy                            | Builder             | Written                                      |
| 9   | Jun 9      | 45% of the Code, 30 Engineers                 | Builder/Leader      | Draft in progress                            |
| 10  | Jun 16     | The First Dollar                              | Builder             | Draft in progress                            |
| 11  | Jun 23     | Writing the Performance Review                | Leader              | Written                                      |

## Voice Guidelines (from published posts)

- Open with a concrete moment, not an abstract thesis
- Use "we" and "I" — practitioner, not pundit
- Short paragraphs, conversational
- Acknowledge nuance ("here's the flip side")
- Technical details precise but accessible
- No LinkedIn fluff, no buzzwords
- Tables and structured content where they help clarity
- Honest about what you don't know or got wrong
- "We built," "I decided," "The trade-off was"

## Sources (for citation in posts)

### Post 1

- Bloomberry MCP analysis: bloomberry.com/blog/we-analyzed-1400-mcp-servers-heres-what-we-learned/
- MCP token cost: mariogiancini.com/the-hidden-cost-of-mcp-servers-and-when-theyre-worth-it
- CVE-2025-59536 (Claude Code): CVSS 8.7
- CVE-2026-26118 (Microsoft MCP): CVSS 8.8, pointguardai.com
- Postmark MCP supply chain attack: blog.cyberdesserts.com/ai-agent-security-risks/
- David Cramer "MCP is not good yet": cra.mr/mcp-is-not-good-yet/
- Titans paper: arxiv.org/abs/2501.00663
- TTT-E2E paper: arxiv.org/abs/2512.23675
- qTTT paper: openreview.net/forum?id=qae8I9PSoo
- Google MIRAS: research.google/blog/titans-miras-helping-ai-have-long-term-memory/
- DeepSeek Engram: sdxcentral.com
- LoRA paper: Hu et al., 2021
- vLLM LoRA hot-swap: docs.vllm.ai
- Lewis et al. RAG paper: NeurIPS 2020

### Post 2

- METR AI developer study (19% slower): metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
- Anthropic coding skills RCT (17-point comprehension gap): anthropic.com/research/AI-assistance-coding-skills
- Apple "Illusion of Thinking" paper: arxiv.org/abs/2506.06941
- Lightrun 2026 report (43% debugging rate): globenewswire.com (April 2026)
- Dunning-Kruger + AI: arxiv.org/abs/2510.05457
- r/ExperiencedDevs "AI slop cleanup" (4,255 upvotes): reddit.com/r/ExperiencedDevs/comments/1mg2r6y/
- Sanity staff engineer "95% garbage": sanity.io/blog/first-attempt-will-be-95-garbage
- "Lost in the Middle" (Liu et al., 2024): arxiv.org/abs/2307.03172
- Context rot (Veseli et al., 2025): producttalk.org/context-rot/
- MCP tool description overhead (arXiv:2602.14878): arxiv.org/html/2602.14878v1
- Context engineering (Morph): morphllm.com/context-engineering
- OpenAI "Why Language Models Hallucinate" (Sept 2025): openai.com/index/why-language-models-hallucinate/
- Anthropic context engineering guide: anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Fowler/Bockeler context engineering: martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html
- Fowler harness engineering: martinfowler.com/articles/exploring-gen-ai/harness-engineering.html
- Claude Code subagents and context isolation: richsnapp.com/article/2025/10-05-context-management-with-subagents-in-claude-code
- Addy Osmani workflow: addyosmani.com/blog/ai-coding-workflow/
- Anti-hallucination rules gist: gist.github.com/mingrath/7e292d9ca976f63e499db971f21b6bbe
- IFEval benchmark: Zhou et al., 2023
- Jose Valim LSP critique: x.com/josevalim/status/2002312493713015160
- Armin Ronacher "A Language for Agents": lucumr.pocoo.org/2026/2/9/a-language-for-agents/
- Bruno Bozic LSP semantic density: medium.com/@bruno.bozic
- Martin Fowler context engineering: martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html
- Blake Crosley 50 sessions: blakecrosley.com/blog/context-window-management
- Claude Code hooks guide: code.claude.com/docs/en/hooks-guide
