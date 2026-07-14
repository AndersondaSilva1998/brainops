export interface ExternalApiConfig {
  url: string;
  api: string;
  funcao: string;
  body: string;
}

// Chave usada no armazenamento local para guardar a configuração da API externa.
const STORAGE_KEY = "brainops.external-api-config";

export const defaultExternalApiConfig: ExternalApiConfig = {
  url: "https://branco.eship.com.br/v3/",
  api: "",
  funcao: "",
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

export async function testExternalApi(config: ExternalApiConfig) {
  if (!config.url || !config.api || !config.funcao) {
    return {
      ok: false,
      error: "Preencha a URL, a API e a função antes de testar.",
    };
  }

  try {
    const url = new URL(config.url);
    url.searchParams.set("api", config.api);
    url.searchParams.set("funcao", config.funcao);

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

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
      error: res.ok ? undefined : text || res.statusText,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Falha ao testar a API.",
    };
  }
}
