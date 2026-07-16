import { supabase, isSupabaseConfigured } from "@/services/supabase";

export interface ExternalApiSnapshot {
  id?: string;
  endpoint: string;
  api: string;
  funcao: string;
  method: string;
  requestBody?: Record<string, unknown> | null;
  responseStatus: number;
  responseOk: boolean;
  responsePayload?: unknown;
  responseError?: string | null;
  createdAt?: string;
}

export async function persistExternalApiCall(snapshot: ExternalApiSnapshot): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const { error } = await supabase.from("api_chamadas").insert([
      {
        endpoint: snapshot.endpoint,
        api: snapshot.api,
        funcao: snapshot.funcao,
        method: snapshot.method,
        request_body: snapshot.requestBody ?? {},
        response_status: snapshot.responseStatus,
        response_ok: snapshot.responseOk,
        response_payload: snapshot.responsePayload ?? null,
        response_error: snapshot.responseError ?? null,
      },
    ]);

    if (error) {
      console.error("Supabase error persistExternalApiCall:", error);
    }
  } catch (error) {
    console.error("Failed to persist external API call:", error);
  }
}
