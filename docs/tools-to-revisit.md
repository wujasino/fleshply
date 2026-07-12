# Tools to revisit

Things that don't fit right now but could be worth a second look later.

## RAG-Anything (HKUDS)

- **What**: Python framework for multimodal RAG (text, images, tables, equations), built on LightRAG. PyPI package `raganything`. https://github.com/HKUDS/RAG-Anything
- **Why it might matter**: BitBrew's RAG pipeline (Supabase pgvector + embeddings + Claude API) is text-only. If brand knowledge sources expand to PDFs/decks with images or tables, this covers multimodal ingestion that the current pipeline doesn't.
- **Why not now**: It's Python; BitBrew is Node/TypeScript on Netlify functions. Adopting it means standing up a separate Python service, not just adding a dependency — an architecture decision, not a drop-in.
- **Revisit when**: brand knowledge ingestion needs to handle image- or table-heavy documents and the added service complexity is worth it.
