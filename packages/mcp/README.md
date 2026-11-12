# @monoline/mcp

A Model Context Protocol server for [Monoline](../../README.md). It lets Claude Code, Cursor, Claude Desktop and any other MCP client list, search and read Monoline components, get install commands and read the theming rules.

Zero dependencies. Node 20 or newer. Plain ESM. JSON-RPC 2.0 over stdio (newline-delimited), written by hand.

## Setup

The command is `npx -y @monoline/mcp` (binary name `monoline-mcp`).

### Claude Code

```bash
claude mcp add monoline -- npx -y @monoline/mcp
```

Or in `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "monoline": {"command": "npx", "args": ["-y", "@monoline/mcp"]}
  }
}
```

### Cursor

`.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (all projects):

```json
{
  "mcpServers": {
    "monoline": {"command": "npx", "args": ["-y", "@monoline/mcp"]}
  }
}
```

### Claude Desktop

Settings, Developer, Edit config (`claude_desktop_config.json`), then restart:

```json
{
  "mcpServers": {
    "monoline": {"command": "npx", "args": ["-y", "@monoline/mcp"]}
  }
}
```

### Using a local checkout

```json
{
  "mcpServers": {
    "monoline": {
      "command": "node",
      "args": ["/path/to/design-system/packages/mcp/bin/monoline-mcp.mjs", "--registry", "/path/to/design-system/registry"]
    }
  }
}
```

## Registry

Resolved in this order: `--registry <folder|url>`, env `MONOLINE_REGISTRY`, `./registry` in the working folder, the `registry/` of the repo this package lives in, then `https://raw.githubusercontent.com/dasariprashant0/design-system/master/registry`. Remote files are fetched on first use and cached in memory for the life of the process. `llms.txt` is read from the folder or URL one level above the registry.

## Tools

| Tool | Arguments | Returns |
|---|---|---|
| `list_components` | `category?` | name, title, category, status, description for each entry, plus the categories |
| `search_components` | `query`, `limit?` (default 10) | ranked matches with a score: name, then keywords, title, prop names, category, description; `matchedProps` lists props that matched |
| `get_component` | `name`, `include_source?` | import line, props (name, type, default, description), usage example, a11y notes, CSS classes and data attributes, related components, CSS file paths; with `include_source`, source files and CSS content |
| `get_install_command` | `names[]` | `npx monoline add …`, extra components copied, CSS files, npm packages |
| `get_theming_guide` | none | data attributes, tokens and rules (text) |
| `compose_page` | `description` | suggested components and blocks with imports, from a keyword mapping |

A failing tool (unknown component, bad argument) returns `isError: true` with a message. Protocol problems use JSON-RPC errors: `-32700` parse error, `-32600` invalid request, `-32601` method not found, `-32602` invalid params, `-32002` unknown resource.

**Resources:** `monoline://llms.txt`, `monoline://component/<name>`. **Prompt:** `build_with_monoline` (optional `task`).

## Develop

```bash
node --test packages/mcp      # from the repo root, or: npm run test:mcp
node packages/mcp/bin/monoline-mcp.mjs --registry registry
```

Tests spawn the server and speak the protocol over a pipe against fake registry fixtures; none needs a network. The tests do not use a real MCP client.
