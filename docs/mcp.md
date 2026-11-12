# Monoline MCP server

`@monoline/mcp` is a [Model Context Protocol](https://modelcontextprotocol.io) server over the Monoline registry. An AI tool that speaks MCP can list and search components, read props and accessibility notes, get the install command and read the theming rules, without you pasting docs into the chat.

It has no dependencies, runs on Node 20 or newer, and talks over stdio.

## Set up

Add it to your tool's MCP config. The command is the same everywhere: `npx -y @monoline/mcp`.

**Claude Code**

```bash
claude mcp add monoline -- npx -y @monoline/mcp
```

**Cursor**: `.cursor/mcp.json` in the project, or `~/.cursor/mcp.json` for every project

```json
{
  "mcpServers": {
    "monoline": {"command": "npx", "args": ["-y", "@monoline/mcp"]}
  }
}
```

**Claude Desktop**: `claude_desktop_config.json` (Settings, Developer, Edit config), then restart the app

```json
{
  "mcpServers": {
    "monoline": {"command": "npx", "args": ["-y", "@monoline/mcp"]}
  }
}
```

## Tools

| Tool | What it does |
|---|---|
| `list_components` | Every component, hook and block. Optional `category`. |
| `search_components` | Ranked search over name, title, description and keywords. |
| `get_component` | Meta, import line, props summary, accessibility notes and CSS files. `include_source: true` adds the full source and CSS. |
| `get_install_command` | The `npx monoline add …` line, the extra components it copies and the npm packages it needs. |
| `get_theming_guide` | `data-theme`, `data-accent`, `data-font`, `data-radius`, `data-density` and the design tokens. |
| `compose_page` | Suggests components and blocks, with imports, for a short description of a page. |

Resources: `monoline://llms.txt` and `monoline://component/<name>`. Prompt: `build_with_monoline`, which tells the model to use only Monoline components and tokens.

## Where the data comes from

1. `--registry <folder or URL>`
2. the `MONOLINE_REGISTRY` environment variable
3. `./registry` in the current folder, or the `registry/` of the repo the package sits in
4. the registry on GitHub (`master`), fetched once and kept in memory

To point at a local checkout: `"args": ["-y", "@monoline/mcp", "--registry", "/path/to/design-system/registry"]`.

## Try it by hand

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_components","arguments":{"query":"date picker"}}}' \
  | npx -y @monoline/mcp
```

Full reference: `packages/mcp/README.md`.
