---
ingested: true
ingestedAt: 2026-05-13
---
# LLM Wiki

A pattern for building personal knowledge bases using LLMs.

This is an idea file, it is designed to be copy pasted to your own LLM Agent (e.g. OpenAI Codex, Claude Code, OpenCode / Pi, or etc.). Its goal is to communicate the high level idea, but your agent will build out the specifics in collaboration with you.

## The core idea

Most people's experience with LLMs and documents looks like RAG: you upload a collection of files, the LLM retrieves relevant chunks at query time, and generates an answer. This works, but the LLM is rediscovering knowledge from scratch on every question. There's no accumulation. Ask a subtle question that requires synthesizing five documents, and the LLM has to find and piece together the relevant fragments every time. Nothing is built up. NotebookLM, ChatGPT file uploads, and most RAG systems work this way.

The idea here is different. Instead of just retrieving from raw documents at query time, the LLM incrementally builds and maintains a persistent wiki — a structured, interlinked collection of markdown files that sits between you and the raw sources. When you add a new source, the LLM doesn't just index it for later retrieval. It reads it, extracts the key information, and integrates it into the existing wiki — updating entity pages, revising topic summaries, noting where new data contradicts old claims, strengthening or challenging the evolving synthesis. The knowledge is compiled once and then kept current, not re-derived on every query.

This is the key difference: the wiki is a persistent, compounding artifact.  The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read. The wiki keeps getting richer with every source you add and every question you ask.

You never (or rarely) write the wiki yourself — the LLM writes and maintains all of it. You're in charge of sourcing, exploration, and asking the right questions. The LLM does all the grunt work — the summarizing, cross-referencing, filing, and bookkeeping that makes a knowledge base actually useful over time. In practice, I have the LLM agent open on one side and Obsidian open on the other. The LLM makes edits based on our conversation, and I browse the results in real time — following links, checking the graph view, reading the updated pages. Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase.

This can apply to a lot of different contexts. A few examples:

- **Personal**: tracking your own goals, health, psychology, self-improvement — filing journal entries, articles, podcast notes, and building up a structured picture of yourself over time.
- **Research**: going deep on a topic over weeks or months — reading papers, articles, reports, and incrementally building a comprehensive wiki with an evolving thesis.
- **Reading a book**: filing each chapter as you go, building out pages for characters, themes, plot threads, and how they connect. By the end you have a rich companion wiki. Think of fan wikis like Tolkien Gateway — thousands of interlinked pages covering characters, places, events, languages, built by a community of volunteers over years. You could build something like that personally as you read, with the LLM doing all the cross-referencing and maintenance.
- **Business/team**: an internal wiki maintained by LLMs, fed by Slack threads, meeting transcripts, project documents, customer calls. Possibly with humans in the loop reviewing updates. The wiki stays current because the LLM does the maintenance that no one on the team wants to do.
- **Competitive analysis, due diligence, trip planning, course notes, hobby deep-dives** — anything where you're accumulating knowledge over time and want it organized rather than scattered.

## Architecture

There are three layers:

### 1. Raw sources
Your curated collection of source documents. Articles, papers, images, data files. These are immutable — the LLM reads from them but never modifies them. This is your source of truth.

### 2. The wiki
A directory of LLM-generated markdown files. Summaries, entity pages, concept pages, comparisons, an overview, a synthesis. The LLM owns this layer entirely. It creates pages, updates them when new sources arrive, maintains cross-references, and keeps everything consistent. You read it; the LLM writes it.

### 3. The schema
A document (e.g. CLAUDE.md for Claude Code or AGENTS.md for Codex) that tells the LLM how the wiki is structured, what the conventions are, and what workflows to follow when ingesting sources, answering questions, or maintaining the wiki. This is the key configuration file — it's what makes the LLM a disciplined wiki maintainer rather than a generic chatbot. You and the LLM co-evolve this over time as you figure out what works for your domain.

## Operations

### Ingest
You drop a new source into the raw collection and tell the LLM to process it. An example flow: the LLM reads the source, discusses key takeaways with you, writes a summary page in the wiki, updates the index, updates relevant entity and concept pages across the wiki, and appends an entry to the log. A single source might touch 10-15 wiki pages. Personally I prefer to ingest sources one at a time and stay involved — I read the summaries, check the updates, and guide the LLM on what to emphasize. But you could also batch-ingest many sources at once with less supervision. It's up to you to develop the workflow that fits your style and document it in the schema for future sessions.

### Query
You ask questions against the wiki. The LLM searches for relevant pages, reads them, and synthesizes an answer with citations. Answers can take different forms depending on the question — a markdown page, a comparison table, a slide deck (Marp), a chart (matplotlib), a canvas. The important insight: good answers can be filed back into the wiki as new pages. A comparison you asked for, an analysis, a connection you discovered — these are valuable and shouldn't disappear into chat history. This way your explorations compound in the knowledge base just like ingested sources do.

### Lint
Periodically, ask the LLM to health-check the wiki. Look for: contradictions between pages, stale claims that newer sources have superseded, orphan pages with no inbound links, important concepts mentioned but lacking their own page, missing cross-references, data gaps that could be filled with a web search. The LLM is good at suggesting new questions to investigate and new sources to look for. This keeps the wiki healthy as it grows.

## Indexing and logging

Two special files help the LLM (and you) navigate the wiki as it grows. They serve different purposes:

### index.md
Content-oriented. It's a catalog of everything in the wiki — each page listed with a link, a one-line summary, and optionally metadata like date or source count. Organized by category (entities, concepts, sources, etc.). The LLM updates it on every ingest. When answering a query, the LLM reads the index first to find relevant pages, then drills into them. This works surprisingly well at moderate scale (~100 sources, ~hundreds of pages) and avoids the need for embedding-based RAG infrastructure.

### log.md
Chronological. It's an append-only record of what happened and when — ingests, queries, lint passes. A useful tip: if each entry starts with a consistent prefix (e.g. `## [2026-04-02] ingest | Article Title`), the log becomes parseable with simple unix tools — `grep "^## \[" log.md | tail -5` gives you the last 5 entries. The log gives you a timeline of the wiki's evolution and helps the LLM understand what's been done recently.

## Optional: CLI tools

At some point you may want to build small tools that help the LLM operate on the wiki more efficiently. A search engine over the wiki pages is the most obvious one — at small scale the index file is enough, but as the wiki grows you want proper search. **qmd** is a good option: it's a local search engine for markdown files with hybrid BM25/vector search and LLM re-ranking, all on-device. It has both a CLI (so the LLM can shell out to it) and an MCP server (so the LLM can use it as a native tool). You could also build something simpler yourself — the LLM can help you vibe-code a naive search script as the need arises.

## Tips and tricks

- **Obsidian Web Clipper** is a browser extension that converts web articles to markdown. Very useful for quickly getting sources into your raw collection.
- **Download images locally**. In Obsidian Settings → Files and links, set "Attachment folder path" to a fixed directory (e.g. raw/assets/). Then in Settings → Hotkeys, search for "Download" to find "Download attachments for current file" and bind it to a hotkey (e.g. Ctrl+Shift+D). After clipping an article, hit the hotkey and all images get downloaded to local disk. This is optional but useful — it lets the LLM view and reference images directly instead of relying on URLs that may break. Note: LLMs can't natively read markdown with inline images in one pass — the workaround is to have the LLM read the text first, then view some or all of the referenced images separately to gain additional context. It's a bit clunky but works well enough.
- **Obsidian's graph view** is the best way to see the shape of your wiki — what's connected to what, which pages are hubs, which are orphans.
- **Marp** is a markdown-based slide deck format. Obsidian has a plugin for it. Useful for generating presentations directly from wiki content.
- **Dataview** is an Obsidian plugin that runs queries over page frontmatter. If your LLM adds YAML frontmatter to wiki pages (tags, dates, source counts), Dataview can generate dynamic tables and lists.
- The wiki is **just a git repo** of markdown files. You get version history, branching, and collaboration for free.

## Why this works

The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping. Updating cross-references, keeping summaries current, noting when new data contradicts old claims, maintaining consistency across dozens of pages. Humans abandon wikis because the maintenance burden grows faster than the value. LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass. The wiki stays maintained because the cost of maintenance is near zero.

The human's job is to curate sources, direct the analysis, ask good questions, and think about what it all means. The LLM's job is everything else.

The idea is related in spirit to Vannevar Bush's Memex (1945) — a personal, curated knowledge store with associative trails between documents. Bush's vision was closer to this than to what the web became: private, actively curated, with the connections between documents as valuable as the documents themselves. The part he couldn't solve was who does the maintenance. The LLM handles that.

## Note

This document is intentionally abstract. It describes the idea, not a specific implementation. The exact directory structure, the schema conventions, the page formats, the tooling — all of that will depend on your domain, your preferences, and your LLM of choice. Everything mentioned above is optional and modular — pick what's useful, ignore what isn't.

For example:
- Your sources might be text-only, so you don't need image handling at all.
- Your wiki might be small enough that the index file is all you need, no search engine required.
- You might not care about slide decks and just want markdown pages.
- You might want a completely different set of output formats.

The right way to use this is to share it with your LLM agent and work together to instantiate a version that fits your needs. The document's only job is to communicate the pattern. Your LLM can figure out the rest.

---

### Community Contributions

#### ColonelPanicX (May 5, 2026)
The schema observation is underrated. The difference between an LLM that maintains a wiki and one that just answers questions in a wiki-shaped directory is almost entirely that file.

I ran into the same consistency problem across projects (not just wikis) and ended up building **scaffy** (https://github.com/ColonelPanicX/scaffy), which is a dead simple python script that bootstraps the schema layer for any project: collaboration contract, session protocols, kanban, agent profiles, etc.

The idea is that every project gets the same guardrails so the LLM isn't relearning the rules each session. Works well as a starting point for the setup that Karpathy described here.

#### lrdeoliveira (May 5, 2026)
Hi Andrej,

Your LLM Wiki gist became the foundation of our project — **NEXUS**, a multi-agent memory system running on a VPS with 6 AI agents.

**What we built:**
NEXUS implements your 3-layer pattern:
- Raw sources — immutable source documents (32 files)
- Wiki — LLM-generated markdown pages (entities, concepts, sources)
- Schema — CLAUDE.md / SOUL.md files that define agent identity and workflows

**Stack:**
- 6 AI agents on VPS
- Weaviate (vector DB) + Ollama (local LLM) + Wiki.js
- GraphRAG with typed schema (Source, Concept, Agent, Project)
- Skills system, session logging, compression with OpenRouter
- MCP servers: Brave Search, Tavily, YouTube, Apify, MiniMax, Slack, qmd

**The key insight that changed everything for us:**
> "The wiki is a persistent, compounding artifact. The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read."

This transformed how we think about agent memory. Instead of RAG re-deriving context every time, we compound knowledge session over session.

**Gratitude:**
Thank you for sharing this pattern. The idea of "wiki as a persistent, compounding artifact" instead of another RAG layer that re-derives context every time — this was the insight that changed everything for us.

We saw your gist on May 1, 2026. By May 5, we had NEXUS running in production with 6 agents, GraphRAG, and full memory persistence.

The ecosystem you inspired is impressive: Kompl, SwarmVault, Aura, llmwiki-cli, ΩmegaWiki, Link. Every one of them took the same pattern and made it their own.

Thank you for planting the seed.

Luciano - https://github.com/lrdeoliveira/nexus-ai-memory

#### simonsysun (May 5, 2026)
For larger Markdown wikis, line-anchored local retrieval before edits becomes a real bottleneck: agents need to read the exact lines they're about to touch, not whole files.

I built **SeekLink** for that loop: index a local .md vault, search semantically, then fetch a specific PATH:LINE window.

```
seeklink index --vault ./wiki
seeklink search "why SQLite for search?" --vault ./wiki --json
seeklink get decisions/search.md:42 -C 20 --vault ./wiki   # 20 lines of context
```

Plain subprocess interface, JSON stdout, local-only.

https://github.com/simonsysun/seeklink

As my contribution to the discussion - I built **Keel**, a Mac app where your knowledge stays as plain markdown on disk and the model is swappable. http://github.com/Keel-Labs/keel (free, open source) - it's biased toward local-first and own-your-context.

▶ Keel Walkthrough 🚀 — Watch Video

#### ethanj (May 5, 2026)
Huge milestone from this thread: **llmwiki** just crossed 1K GitHub stars (and 100 forks)!

I built it because Andrej's LLM Wiki gist felt immediately useful, but I wanted the idea to be boringly concrete... a local CLI, plain files, immutable sources, generated markdown, provenance, linting, exports, and agent access.

The project now has:
- `compile --review` so generated pages can be approved or rejected before landing
- claim-level provenance like `^[paper.md:42-58]`
- typed schema/page kinds and seed pages
- confidence and contradiction metadata
- image/PDF/transcript ingest
- chunked retrieval with BM25 reranking
- llms.txt, JSON-LD, GraphML, and Marp exports
- MCP tools
- Claude/Codex/Cursor session ingest

---

**Source URL:** https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
