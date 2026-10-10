# Rule: watsonx Orchestrate conventions

When generating watsonx Orchestrate tool definitions:

- Tool `description` fields must be specific enough for the model to choose the right tool — avoid generic descriptions like "calls an API".
- All parameter types must use JSON Schema (`string`, `number`, `boolean`, `array`, `object`).
- Include `required` arrays in parameter schemas — Orchestrate validates these strictly.
- MCP server entries must use pinned versions, not `:latest`.
- Never put API keys or credentials in tool definitions — reference environment variable names only.
