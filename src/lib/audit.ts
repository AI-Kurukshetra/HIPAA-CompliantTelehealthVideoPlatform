import type { SupabaseClient } from "@supabase/supabase-js";

type AuditInput = {
  actorUserId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAuditEvent(supabase: SupabaseClient, input: AuditInput) {
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });

  return { error };
}
