import { persistExternalApiCall } from "@/services/externalApiPersistence";
import { notifyDashboardRefresh } from "@/services/dashboardRefresh";

export interface ExternalApiConfig {
  url: string;
  api: string;
  funcao: string;
  body: string;
  method?: "GET" | "POST";
}

// Chave usada no armazenamento local para guardar a configuração da API externa.
const STORAGE_KEY = "brainops.external-api-config";
const RESULT_STORAGE_KEY = "brainops.external-api-last-result";

export interface ExternalApiTestResult {
  ok: boolean;
  status: number;
  data: unknown;
  error?: string;
  timestamp?: string;
}

export const defaultExternalApiConfig: ExternalApiConfig = {
  url: "https://branco.eship.com.br/v3/",
  api: "",
  funcao: "",
  method: "POST",
  body: JSON.stringify(
    {
      ordem: "00716320",
      statusOrdem: "[6,5,4,7,3,2,1]",
      tipoOrdem: "[12,10,20,14,4,13,6,2]",
      pagina: "1",
      quantidadeRegistros: "100",
    },
    null,
    2,
  ),
};

function readStoredConfig(): ExternalApiConfig | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ExternalApiConfig;
  } catch {
    return null;
  }
}

export function getExternalApiConfig(): ExternalApiConfig {
  return readStoredConfig() ?? defaultExternalApiConfig;
}

export function saveExternalApiConfig(config: ExternalApiConfig): ExternalApiConfig {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
  return config;
}

export function getLastExternalApiResult(): ExternalApiTestResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(RESULT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ExternalApiTestResult;
  } catch {
    return null;
  }
}

export function saveExternalApiResult(result: ExternalApiTestResult): ExternalApiTestResult {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
  }
  return result;
}

function hasMeaningfulPayload(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  return true;
}

export async function testExternalApi(config: ExternalApiConfig) {
  if (!config.url || !config.api || !config.funcao) {
    return {
      ok: false,
      error: "Preencha a URL, a API e a função antes de testar.",
    };
  }

  try {
    let payload: unknown = {};
    if (config.body.trim()) {
      try {
        payload = JSON.parse(config.body);
      } catch {
        return {
          ok: false,
          error: "O body precisa ser um JSON válido.",
        };
      }
    }

    const res = await fetch("/api/external", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: config.url,
        api: config.api,
        funcao: config.funcao,
        method: config.method ?? "POST",
        body: payload,
      }),
    });

    const data = await res.json().catch(() => null);
    const status = typeof data?.status === "number" ? data.status : res.status;
    const ok =
      res.ok &&
      Boolean(data?.ok) &&
      status >= 200 &&
      status < 400 &&
      !data?.error &&
      hasMeaningfulPayload(data?.data);

    const result = {
      ok,
      status,
      data: data?.data,
      error: data?.error ?? (res.ok ? undefined : "A API externa respondeu com erro."),
      timestamp: new Date().toISOString(),
    };

    saveExternalApiResult(result);
    await persistExternalApiCall({
      endpoint: config.url,
      api: config.api,
      funcao: config.funcao,
      method: config.method ?? "POST",
      requestBody: payload as Record<string, unknown> | null,
      responseStatus: status,
      responseOk: ok,
      responsePayload: data?.data,
      responseError: result.error ?? null,
    });
    notifyDashboardRefresh();
    return result;
  } catch (error) {
    const result = {
      ok: false,
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : "Falha ao testar a API.",
      timestamp: new Date().toISOString(),
    };
    saveExternalApiResult(result);
    await persistExternalApiCall({
      endpoint: config.url,
      api: config.api,
      funcao: config.funcao,
      method: config.method ?? "POST",
      requestBody: null,
      responseStatus: 0,
      responseOk: false,
      responsePayload: null,
      responseError: result.error ?? null,
    });
    notifyDashboardRefresh();
    return result;
  }
}
