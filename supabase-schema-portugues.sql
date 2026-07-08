-- Script SQL para o Supabase (nomes em português)
-- Execute este script no SQL Editor do Supabase

create extension if not exists "uuid-ossp";

create table if not exists public.bases_conhecimento (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  categoria text not null check (categoria in ('procedimento','erro','documentacao','manual','outro')),
  equipamento text,
  sistema text,
  descricao_problema text not null,
  sintomas text,
  passos_solucao text not null,
  observacoes text,
  palavras_chave text[] not null default '{}',
  tags text[] not null default '{}',
  anexos jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  autor text not null default 'Equipe TI'
);

create table if not exists public.documentos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  tipo_conteudo text,
  tamanho_bytes bigint,
  caminho_storage text,
  url_download text,
  metadata jsonb default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.uploads (
  id uuid primary key default uuid_generate_v4(),
  nome_arquivo text not null,
  status text not null default 'pendente' check (status in ('pendente','processando','concluido','erro')),
  mensagem text,
  caminho_storage text,
  url_download text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.conversas (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null default 'Nova conversa',
  favorito boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.mensagens (
  id uuid primary key default uuid_generate_v4(),
  conversa_id uuid not null references public.conversas(id) on delete cascade,
  papel text not null check (papel in ('user','assistant','system')),
  conteudo text not null,
  fontes jsonb default '[]'::jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists idx_bases_conhecimento_status on public.bases_conhecimento(status);
create index if not exists idx_bases_conhecimento_categoria on public.bases_conhecimento(categoria);
create index if not exists idx_documentos_criado_em on public.documentos(criado_em desc);
create index if not exists idx_uploads_status on public.uploads(status);
create index if not exists idx_mensagens_conversa_id on public.mensagens(conversa_id, criado_em);

alter table public.bases_conhecimento enable row level security;
alter table public.documentos enable row level security;
alter table public.uploads enable row level security;
alter table public.conversas enable row level security;
alter table public.mensagens enable row level security;

drop policy if exists "Permitir leitura para todos" on public.bases_conhecimento;
drop policy if exists "Permitir insercao para todos" on public.bases_conhecimento;
drop policy if exists "Permitir atualizacao para todos" on public.bases_conhecimento;
drop policy if exists "Permitir delecao para todos" on public.bases_conhecimento;
create policy "Permitir leitura para todos" on public.bases_conhecimento
for select using (true);
create policy "Permitir insercao para todos" on public.bases_conhecimento
for insert with check (true);
create policy "Permitir atualizacao para todos" on public.bases_conhecimento
for update using (true) with check (true);
create policy "Permitir delecao para todos" on public.bases_conhecimento
for delete using (true);

drop policy if exists "Permitir leitura para todos" on public.documentos;
drop policy if exists "Permitir insercao para todos" on public.documentos;
drop policy if exists "Permitir atualizacao para todos" on public.documentos;
drop policy if exists "Permitir delecao para todos" on public.documentos;
create policy "Permitir leitura para todos" on public.documentos
for select using (true);
create policy "Permitir insercao para todos" on public.documentos
for insert with check (true);
create policy "Permitir atualizacao para todos" on public.documentos
for update using (true) with check (true);
create policy "Permitir delecao para todos" on public.documentos
for delete using (true);

drop policy if exists "Permitir leitura para todos" on public.uploads;
drop policy if exists "Permitir insercao para todos" on public.uploads;
drop policy if exists "Permitir atualizacao para todos" on public.uploads;
drop policy if exists "Permitir delecao para todos" on public.uploads;
create policy "Permitir leitura para todos" on public.uploads
for select using (true);
create policy "Permitir insercao para todos" on public.uploads
for insert with check (true);
create policy "Permitir atualizacao para todos" on public.uploads
for update using (true) with check (true);
create policy "Permitir delecao para todos" on public.uploads
for delete using (true);

drop policy if exists "Permitir leitura para todos" on public.conversas;
drop policy if exists "Permitir insercao para todos" on public.conversas;
drop policy if exists "Permitir atualizacao para todos" on public.conversas;
drop policy if exists "Permitir delecao para todos" on public.conversas;
create policy "Permitir leitura para todos" on public.conversas
for select using (true);
create policy "Permitir insercao para todos" on public.conversas
for insert with check (true);
create policy "Permitir atualizacao para todos" on public.conversas
for update using (true) with check (true);
create policy "Permitir delecao para todos" on public.conversas
for delete using (true);

drop policy if exists "Permitir leitura para todos" on public.mensagens;
drop policy if exists "Permitir insercao para todos" on public.mensagens;
drop policy if exists "Permitir atualizacao para todos" on public.mensagens;
drop policy if exists "Permitir delecao para todos" on public.mensagens;
create policy "Permitir leitura para todos" on public.mensagens
for select using (true);
create policy "Permitir insercao para todos" on public.mensagens
for insert with check (true);
create policy "Permitir atualizacao para todos" on public.mensagens
for update using (true) with check (true);
create policy "Permitir delecao para todos" on public.mensagens
for delete using (true);

insert into public.bases_conhecimento (
  titulo, categoria, equipamento, sistema, descricao_problema, sintomas,
  passos_solucao, observacoes, palavras_chave, tags, anexos, status, autor
)
values
(
  'Impressora HP LaserJet não imprime — erro 0x610000f6',
  'erro',
  'HP LaserJet Pro M404',
  'Windows 11',
  'Impressora acusa erro 0x610000f6 ao enviar trabalho de impressão.',
  'Fila de impressão trava. LED âmbar piscando.',
  '1. Parar serviço Spooler
2. Limpar a pasta C:\\Windows\\System32\\spool\\PRINTERS
3. Reiniciar o serviço Spooler
4. Reinstalar o driver universal HP',
  'Ocorre após atualização KB5039212.',
  ARRAY['impressora','spooler','0x610000f6'],
  ARRAY['hp','windows'],
  '[]'::jsonb,
  'published',
  'Equipe TI'
),
(
  'Procedimento — Reset de senha do Active Directory',
  'procedimento',
  '-',
  'Active Directory',
  'Usuário esqueceu a senha do domínio.',
  'Falha de login em estações Windows.',
  '1. Validar identidade do usuário
2. Abrir o ADUC
3. Resetar a senha e marcar a opção de troca obrigatória no próximo login',
  'Procedimento para suporte de acesso.',
  ARRAY['senha','ad','reset'],
  ARRAY['ad','acesso'],
  '[]'::jsonb,
  'published',
  'Equipe TI'
)
on conflict do nothing;
