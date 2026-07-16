import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function handleExternalProxy(request: Request): Promise<Response> {
  const allowHeaders = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: allowHeaders });
  }

  try {
    const bodyText = await request.text();
    let payload: {
      url?: string;
      api?: string;
      funcao?: string;
      method?: string;
      body?: unknown;
    } = {};

    if (bodyText) {
      try {
        payload = JSON.parse(bodyText) as typeof payload;
      } catch {
        payload = { body: bodyText };
      }
    }

    if (!payload.url) {
      return Response.json(
        { ok: false, error: "A URL da API externa é obrigatória." },
        { status: 400, headers: allowHeaders },
      );
    }

    const targetUrl = new URL(payload.url);
    if (payload.api) targetUrl.searchParams.set("api", payload.api);
    if (payload.funcao) targetUrl.searchParams.set("funcao", payload.funcao);

    const method = (payload.method ?? request.method ?? "POST").toUpperCase();
    const forwardedHeaders = new Headers();
    if (method !== "GET") {
      forwardedHeaders.set("Content-Type", "application/json");
    }

    let forwardedBody: BodyInit | undefined;
    if (method !== "GET" && payload.body !== undefined) {
      forwardedBody = typeof payload.body === "string" ? payload.body : JSON.stringify(payload.body);
    }

    const response = await fetch(targetUrl.toString(), {
      method,
      headers: forwardedHeaders,
      body: forwardedBody,
    });

    const responseText = await response.text();
    let parsed: unknown = responseText;
    try {
      parsed = responseText ? JSON.parse(responseText) : null;
    } catch {
      parsed = responseText;
    }

    return Response.json(
      {
        ok: response.ok,
        status: response.status,
        data: parsed,
        error: response.ok ? undefined : responseText || response.statusText,
      },
      {
        status: 200,
        headers: allowHeaders,
      },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Falha ao encaminhar a chamada externa.",
      },
      {
        status: 500,
        headers: allowHeaders,
      },
    );
  }
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    if (url.pathname === "/api/external") {
      return handleExternalProxy(request);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
