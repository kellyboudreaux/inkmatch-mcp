import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const PORT = process.env.PORT || 8787;
const MCP_PATH = "/mcp";
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const INKMATCH_URL = "https://inkmatch.io";

// Load widget HTML at startup
const widgetHtml = readFileSync("public/inkmatch-widget.html", "utf8");

// ---------------------------------------------------------------------------
// Tattoo Style Definitions
// ---------------------------------------------------------------------------
const TATTOO_STYLES = {
  traditional: {
    name: "Traditional / Old School",
    description: "Bold black outlines, limited color palette, iconic imagery like anchors, roses, eagles",
    keywords: "bold lines, saturated colors, classic americana, sailor jerry",
  },
  neo_traditional: {
    name: "Neo-Traditional",
    description: "Evolution of traditional with more colors, detail, and artistic freedom",
    keywords: "ornate, decorative, rich colors, art nouveau influence",
  },
  realism: {
    name: "Realism",
    description: "Photorealistic portraits, nature, or objects with incredible detail",
    keywords: "photorealistic, portraits, detailed shading, lifelike",
  },
  watercolor: {
    name: "Watercolor",
    description: "Fluid, painterly style with color splashes and soft edges",
    keywords: "splashes, drips, soft edges, artistic, flowing",
  },
  geometric: {
    name: "Geometric",
    description: "Precise shapes, patterns, and mathematical designs",
    keywords: "sacred geometry, mandalas, patterns, symmetry, dotwork",
  },
  minimalist: {
    name: "Minimalist",
    description: "Simple, clean lines with minimal detail - less is more",
    keywords: "fine line, simple, delicate, small, subtle",
  },
  japanese: {
    name: "Japanese / Irezumi",
    description: "Traditional Japanese imagery: koi, dragons, waves, cherry blossoms",
    keywords: "irezumi, waves, koi fish, dragons, cherry blossoms, full sleeves",
  },
  blackwork: {
    name: "Blackwork",
    description: "Bold black ink only - tribal, ornamental, or illustrative",
    keywords: "solid black, tribal, ornamental, bold, graphic",
  },
  dotwork: {
    name: "Dotwork",
    description: "Images created entirely from dots, often geometric or mandala designs",
    keywords: "stippling, pointillism, mandalas, gradients from dots",
  },
  illustrative: {
    name: "Illustrative",
    description: "Like illustrations from books - can range from whimsical to dark",
    keywords: "storybook, artistic, sketch-like, creative",
  },
  sketch: {
    name: "Sketch / Brushstroke",
    description: "Looks like pencil sketches or brush paintings, intentionally unfinished",
    keywords: "raw, artistic, brushstrokes, sketch marks visible",
  },
  biomechanical: {
    name: "Biomechanical",
    description: "Fusion of organic and mechanical - skin peeled back to reveal machinery",
    keywords: "mechanical, organic, giger, futuristic, 3D effect",
  },
};

const EMOTIONAL_TONES = ["dark", "soft", "bold", "peaceful", "playful", "raw", "elegant", "fierce"];
const PLACEMENTS = ["arm", "forearm", "upper arm", "shoulder", "back", "chest", "ribs", "leg", "thigh", "calf", "ankle", "wrist", "hand", "neck", "behind ear"];
const SIZES = ["tiny", "small", "medium", "large", "extra large"];

// ---------------------------------------------------------------------------
// Replicate API Integration
// ---------------------------------------------------------------------------
async function generateTattooImage(prompt) {
  if (!REPLICATE_API_TOKEN) {
    console.error("REPLICATE_API_TOKEN not set");
    return null;
  }

  try {
    // Create prediction
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637", // FLUX schnell
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
        },
      }),
    });

    if (!createResponse.ok) {
      console.error("Replicate create failed:", await createResponse.text());
      return null;
    }

    const prediction = await createResponse.json();

    // Poll for completion (max 60 seconds)
    const startTime = Date.now();
    while (Date.now() - startTime < 60000) {
      const statusResponse = await fetch(prediction.urls.get, {
        headers: { "Authorization": `Bearer ${REPLICATE_API_TOKEN}` },
      });

      const status = await statusResponse.json();

      if (status.status === "succeeded") {
        return status.output?.[0] || null;
      }

      if (status.status === "failed") {
        console.error("Replicate generation failed:", status.error);
        return null;
      }

      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.error("Replicate generation timed out");
    return null;
  } catch (error) {
    console.error("Replicate API error:", error);
    return null;
  }
}

function buildTattooPrompt(params) {
  const { style, meaning, tone, elements, placement, color_preference } = params;

  const styleInfo = TATTOO_STYLES[style] || TATTOO_STYLES.minimalist;

  const colorInstruction = color_preference === "black_and_gray"
    ? "black and gray ink"
    : color_preference === "full_color"
    ? "vibrant full color ink"
    : "limited color palette";

  // Map placement to body description
  const placementMap = {
    "forearm": "on inner forearm",
    "upper arm": "on upper arm",
    "shoulder": "on shoulder",
    "back": "on back",
    "chest": "on chest",
    "ribs": "on ribcage",
    "leg": "on leg",
    "thigh": "on thigh",
    "calf": "on calf",
    "ankle": "on ankle",
    "wrist": "on wrist",
    "hand": "on hand",
    "neck": "on neck",
    "behind ear": "behind ear",
  };
  const bodyLocation = placementMap[placement] || "on skin";

  return [
    `Beautiful ${styleInfo.name} tattoo ${bodyLocation},`,
    `${tone || "balanced"} mood,`,
    meaning ? `representing ${meaning},` : "",
    elements ? `featuring ${elements},` : "",
    `${colorInstruction},`,
    styleInfo.keywords + ",",
    "professional tattoo photography,",
    "high quality editorial photo,",
    "natural lighting,",
    "sharp detail,",
    "beautiful composition"
  ].filter(Boolean).join(" ");
}

function buildInkMatchUrl(params) {
  const url = new URL(INKMATCH_URL);
  url.searchParams.set("ref", "chatgpt");

  if (params.style) url.searchParams.set("style", params.style);
  if (params.meaning) url.searchParams.set("meaning", params.meaning);
  if (params.tone) url.searchParams.set("tone", params.tone);
  if (params.placement) url.searchParams.set("placement", params.placement);
  if (params.size) url.searchParams.set("size", params.size);
  if (params.color_preference) url.searchParams.set("color", params.color_preference);

  return url.toString();
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
function createMcpServer() {
  const server = new McpServer({
    name: "inkmatch",
    version: "1.0.0",
  });

  // Register widget as a resource
  server.registerResource(
    "inkmatch-widget",
    "ui://widget/inkmatch.html",
    { description: "AI tattoo design preview with personalized recommendations" },
    async () => ({
      contents: [
        {
          uri: "ui://widget/inkmatch.html",
          mimeType: "text/html+skybridge",
          text: widgetHtml,
          _meta: {
            "openai/widgetPrefersBorder": true,
            "openai/widgetCSP": {
              connect_domains: ["https://inkmatch.io"],
              image_domains: ["https://replicate.delivery", "https://*.replicate.delivery"],
            },
          },
        },
      ],
    })
  );

  // Primary tool: generate a tattoo design preview
  server.registerTool(
    "generate_tattoo_preview",
    {
      title: "Generate Tattoo Design Preview",
      description:
        "Creates a personalized AI-generated tattoo design preview based on user preferences. " +
        "Use this when users want to SEE tattoo design ideas - not just discuss styles. " +
        "This generates an actual image, which ChatGPT cannot do natively. " +
        "Ideal triggers: 'design a tattoo for me', 'show me tattoo ideas', " +
        "'generate a tattoo design', 'I want to see what my tattoo could look like', " +
        "'create a tattoo concept', 'help me visualize a tattoo'. " +
        "After showing the preview, users can get 5 full designs for $0.99 at InkMatch.",
      inputSchema: {
        style: z
          .enum([
            "traditional", "neo_traditional", "realism", "watercolor",
            "geometric", "minimalist", "japanese", "blackwork",
            "dotwork", "illustrative", "sketch", "biomechanical"
          ])
          .describe("The tattoo style - ask user if not specified"),
        meaning: z
          .string()
          .optional()
          .describe("What the tattoo represents or symbolizes to the user"),
        tone: z
          .enum(["dark", "soft", "bold", "peaceful", "playful", "raw", "elegant", "fierce"])
          .optional()
          .describe("The emotional feel of the design"),
        elements: z
          .string()
          .optional()
          .describe("Specific imagery or elements to include (flowers, animals, symbols, etc.)"),
        placement: z
          .string()
          .optional()
          .describe("Where on the body (arm, back, chest, etc.)"),
        size: z
          .enum(["tiny", "small", "medium", "large", "extra large"])
          .optional()
          .describe("Approximate size of the tattoo"),
        color_preference: z
          .enum(["black_and_gray", "full_color", "limited_palette"])
          .optional()
          .describe("Color preference for the design"),
      },
      annotations: {
        readOnlyHint: false, // This tool has side effects (API call, cost)
        openWorldHint: true, // Connects to external API
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/inkmatch.html",
        "openai/toolInvocation/invoking": "Creating your tattoo design preview…",
        "openai/toolInvocation/invoked": "Your preview is ready! See below for your personalized design.",
      },
    },
    async (params) => {
      const { style, meaning, tone, elements, placement, size, color_preference } = params;

      // Build the prompt and generate image
      const prompt = buildTattooPrompt(params);
      const imageUrl = await generateTattooImage(prompt);

      // Build handoff URL with preserved preferences
      const inkMatchUrl = buildInkMatchUrl(params);

      const styleInfo = TATTOO_STYLES[style] || TATTOO_STYLES.minimalist;

      const structuredContent = {
        style: styleInfo.name,
        style_key: style,
        meaning: meaning || null,
        tone: tone || null,
        elements: elements || null,
        placement: placement || null,
        size: size || null,
        color_preference: color_preference || "black_and_gray",
        image_url: imageUrl,
        inkmatch_url: inkMatchUrl,
        generated: !!imageUrl,
      };

      // Build summary for model narration
      const summaryParts = [
        `Here's your ${styleInfo.name} tattoo preview`,
        meaning ? `representing "${meaning}"` : null,
        tone ? `with a ${tone} feel` : null,
        placement ? `designed for your ${placement}` : null,
      ].filter(Boolean);

      const summary = imageUrl
        ? `${summaryParts.join(" ")}. Like this direction? Get 5 full personalized designs for just $0.99 at InkMatch.`
        : `I've captured your preferences for a ${styleInfo.name} design. Visit InkMatch to generate your personalized designs.`;

      return {
        structuredContent,
        content: [{ type: "text", text: summary }],
        _meta: {},
      };
    }
  );

  // Secondary tool: explore tattoo styles
  server.registerTool(
    "explore_tattoo_styles",
    {
      title: "Explore Tattoo Styles",
      description:
        "Returns an overview of popular tattoo styles with descriptions. " +
        "Use this when users are unsure what style they want or ask " +
        "'what tattoo styles are there', 'help me pick a style', " +
        "'what are the different types of tattoos'. " +
        "After exploring, suggest using generate_tattoo_preview to see actual designs.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async () => {
      const styleList = Object.entries(TATTOO_STYLES)
        .map(([key, info]) => `**${info.name}**: ${info.description}`)
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: [
              "Here are the main tattoo styles to consider:\n",
              styleList,
              "\nWhich style resonates with you? Once you pick one (or a couple), I can generate a preview design using InkMatch.",
            ].join("\n"),
          },
        ],
      };
    }
  );

  // Helper tool: get style recommendations based on preferences
  server.registerTool(
    "recommend_tattoo_style",
    {
      title: "Recommend Tattoo Style",
      description:
        "Suggests tattoo styles based on user's described preferences, personality, or existing tattoos. " +
        "Use when user says 'what style would suit me', 'I like clean/bold/artistic things', " +
        "'recommend a style based on...'. Returns style suggestions with reasoning.",
      inputSchema: {
        preferences: z.string().describe("User's described preferences, aesthetic taste, or personality"),
        existing_tattoos: z.string().optional().describe("Description of tattoos they already have, if any"),
        avoid: z.string().optional().describe("Styles or elements they want to avoid"),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ preferences, existing_tattoos, avoid }) => {
      // This tool returns guidance for the model to make recommendations
      // The actual recommendation logic happens in the model's response
      return {
        content: [
          {
            type: "text",
            text: [
              `Based on the user's preferences: "${preferences}"`,
              existing_tattoos ? `\nExisting tattoos: "${existing_tattoos}"` : "",
              avoid ? `\nWants to avoid: "${avoid}"` : "",
              "\n\nConsider these style mappings:",
              "- Clean/minimal aesthetic → Minimalist, Fine Line, Geometric",
              "- Bold/strong presence → Traditional, Blackwork, Japanese",
              "- Artistic/creative → Watercolor, Illustrative, Sketch",
              "- Nature/organic → Realism, Neo-Traditional, Japanese",
              "- Spiritual/symbolic → Geometric, Dotwork, Blackwork",
              "- Dark/edgy → Blackwork, Biomechanical, Dark Illustrative",
              "- Soft/feminine → Watercolor, Fine Line, Minimalist",
              "\nRecommend 2-3 styles that fit, explain why, then offer to generate a preview.",
            ].join("\n"),
          },
        ],
      };
    }
  );

  return server;
}

// ---------------------------------------------------------------------------
// HTTP Server
// ---------------------------------------------------------------------------
const sessions = new Map();

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS preflight
  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, mcp-session-id",
      "Access-Control-Expose-Headers": "mcp-session-id",
    });
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", app: "inkmatch", version: "1.0.0" }));
    return;
  }

  // Serve static files from public directory
  if (req.method === "GET" && url.pathname.startsWith("/public/")) {
    const filePath = join(process.cwd(), url.pathname);
    if (existsSync(filePath)) {
      const ext = filePath.split(".").pop();
      const mimeTypes = { html: "text/html", css: "text/css", js: "application/javascript" };
      const contentType = mimeTypes[ext] || "text/plain";
      try {
        const content = readFileSync(filePath, "utf8");
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
        return;
      } catch (e) {
        // Fall through to 404
      }
    }
  }

  // MCP endpoint
  if (url.pathname === MCP_PATH) {
    const sessionId = req.headers["mcp-session-id"];

    if (req.method === "GET") {
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing or invalid session ID");
        return;
      }
      const transport = sessions.get(sessionId);
      await transport.handleRequest(req, res);
      return;
    }

    if (req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const rawBody = Buffer.concat(chunks).toString();
      let parsedBody;
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }));
        return;
      }

      if (sessionId && sessions.has(sessionId)) {
        const transport = sessions.get(sessionId);
        await transport.handleRequest(req, res, parsedBody);
      } else {
        const server = createMcpServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () =>
            `inkmatch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          onsessioninitialized: (sid) => {
            sessions.set(sid, transport);
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) sessions.delete(sid);
        };

        await server.connect(transport);
        await transport.handleRequest(req, res, parsedBody);
      }
      return;
    }

    if (req.method === "DELETE") {
      if (sessionId && sessions.has(sessionId)) {
        const transport = sessions.get(sessionId);
        await transport.handleRequest(req, res);
        sessions.delete(sessionId);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Session not found");
      }
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

httpServer.listen(PORT, () => {
  console.log(`InkMatch MCP server running at http://localhost:${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}${MCP_PATH}`);
  if (!REPLICATE_API_TOKEN) {
    console.warn("Warning: REPLICATE_API_TOKEN not set - image generation will be disabled");
  }
});
