import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export const Route = createFileRoute("/usuarios")({
  component: UsuariosPage,
});

function UsuariosPage() {
  return (
    <AppShell title="Usuários" subtitle="Gestão de acessos e permissões">
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3 text-base font-medium text-foreground mb-3">
            <Info className="h-5 w-5 text-primary" />
            Registro de usuários não está disponível na configuração atual.
          </div>
          <p>
            O esquema Supabase atual não expõe uma tabela de usuários gerenciável. Sua implementação deve ser adicionada ao banco de dados ou ao backend para habilitar esta página.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
