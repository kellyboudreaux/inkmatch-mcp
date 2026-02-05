# InkMatch MCP - ChatGPT App Directory Integration

## What It Is

InkMatch MCP is a ChatGPT App Directory app that generates AI-powered tattoo design previews. When users ask ChatGPT to help them design a tattoo, InkMatch generates a personalized preview image based on their style, meaning, and placement preferences. Users can then get 5 full designs for $0.99 at inkmatch.io.

**Status:** Built, ready for deployment and App Directory submission.

---

## Why This Approach (Revenue Optimization)

**Key insight:** ChatGPT will suggest apps that provide capabilities it doesn't have natively.

| What ChatGPT CAN Do | What ChatGPT CANNOT Do |
|---------------------|------------------------|
| Describe tattoo styles (text) | Generate actual tattoo images |
| Ask preference questions | Render interactive visual experiences |
| Recommend styles based on answers | |

**Result:** When a user says "help me design a tattoo," ChatGPT's internal logic is:
- "I can discuss styles and meanings..."
- "But if they want to SEE designs, I need InkMatch"

This makes InkMatch the natural suggestion for visual tattoo queries.

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| MCP Server | Node.js + @modelcontextprotocol/sdk |
| Image Generation | Replicate API (FLUX schnell) |
| Widget | Vanilla HTML/CSS/JS via `text/html+skybridge` |
| Hosting | Render (free tier) |
| Revenue | Direct sales via inkmatch.io ($0.99) |
| Repo | `kellyboudreaux/inkmatch-mcp` |

---

## Key Files

```
server.js                    - MCP server with tools
public/inkmatch-widget.html  - Preview widget with CTA
public/test-widget.html      - Local testing page
app-listing.md               - App Directory submission copy
privacy-policy.md            - Required for submission
render.yaml                  - Deployment config
package.json                 - Dependencies
```

---

## Tools Registered

### `generate_tattoo_preview` (Primary)
Generates an AI tattoo design preview based on user preferences.

**Inputs:**
- `style` (required) - One of 12 styles (minimalist, traditional, japanese, etc.)
- `meaning` - What the tattoo represents
- `tone` - Emotional feel (dark, soft, bold, peaceful, playful, raw, elegant, fierce)
- `elements` - Specific imagery to include
- `placement` - Body location
- `size` - tiny/small/medium/large/extra large
- `color_preference` - black_and_gray/full_color/limited_palette

**Trigger phrases:**
- "Design a tattoo for me"
- "Generate a tattoo idea"
- "Show me what a [style] tattoo would look like"
- "Help me visualize a tattoo"
- "Create a tattoo design for my [placement]"

### `explore_tattoo_styles`
Returns descriptions of all 12 supported styles. Use when user is unsure what style they want.

### `recommend_tattoo_style`
Suggests styles based on user's described preferences and aesthetic taste.

---

## User Flow

1. User asks ChatGPT about designing a tattoo
2. ChatGPT gathers preferences (style, meaning, placement, etc.)
3. ChatGPT invokes `generate_tattoo_preview`
4. InkMatch calls Replicate API → generates 1 preview image (~$0.003)
5. Widget displays preview + preference tags + CTA
6. User clicks "Get 5 Full Designs" → redirects to inkmatch.io with params
7. User pays $0.99 → receives 5 full designs + AR try-on

---

## Revenue Model

| Stage | Cost | Revenue |
|-------|------|---------|
| Preview generation | $0.003 (Replicate) | $0 |
| Full purchase | $0.015 (5 images) | $0.99 |
| **Net per conversion** | | **~$0.64** |

Preview cost is marketing spend to drive conversions.

---

## Environment Variables

| Key | Description |
|-----|-------------|
| `PORT` | Server port (default: 8787) |
| `REPLICATE_API_TOKEN` | Required for image generation |

---

## Local Development

```bash
cd /Users/KellyBoudreaux/Projects/inkmatch-mcp

# Install dependencies
npm install

# Set Replicate token
export REPLICATE_API_TOKEN=r8_xxxxx

# Run server
node server.js

# Server runs at http://localhost:8787
# MCP endpoint: http://localhost:8787/mcp
# Test widget: http://localhost:8787/public/test-widget.html
```

### Test MCP Handshake

```bash
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'
```

---

## Deployment

### Render Setup

1. Create new Web Service in Render
2. Connect GitHub repo: `kellyboudreaux/inkmatch-mcp`
3. Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables:
     - `PORT`: 10000
     - `NODE_ENV`: production
     - `REPLICATE_API_TOKEN`: (add from Replicate dashboard)

### ChatGPT App Directory Submission

Prerequisites:
- [ ] Deploy to Render (get HTTPS URL)
- [ ] Host privacy policy at public URL (use inkmatch.io/privacy or separate)
- [ ] Register as ChatGPT developer (platform.openai.com)
- [ ] Submit app with metadata from app-listing.md

---

## Supported Tattoo Styles

1. Traditional / Old School
2. Neo-Traditional
3. Realism
4. Watercolor
5. Geometric
6. Minimalist
7. Japanese / Irezumi
8. Blackwork
9. Dotwork
10. Illustrative
11. Sketch / Brushstroke
12. Biomechanical

---

## Related Projects

- **InkMatch** (`~/Projects/InkMatch`) - Main web app at inkmatch.io
- **StartKit** (`~/Projects/StartKit`) - Similar MCP architecture for hobby checklists

---

## Session Progress

**Last Updated:** February 5, 2026

**Current Status:** MCP server built, widget complete, ready for deployment.

**Completed:**
- Cloned StartKit MCP structure from `kellyboudreaux/chatgpt-marketplace` branch
- Adapted server.js for tattoo generation (Replicate integration)
- Created inkmatch-widget.html with preview display and CTA
- Created test-widget.html for local development
- Updated app-listing.md with trigger phrases and testing guidelines
- Updated privacy-policy.md for InkMatch
- Updated render.yaml with REPLICATE_API_TOKEN env var

**Next Steps:**
- [ ] Create new GitHub repo `kellyboudreaux/inkmatch-mcp`
- [ ] Push code to GitHub
- [ ] Deploy to Render
- [ ] Test with real Replicate API
- [ ] Register as ChatGPT developer
- [ ] Submit to App Directory

**Blockers/Waiting On:**
- None (ready for deployment)
