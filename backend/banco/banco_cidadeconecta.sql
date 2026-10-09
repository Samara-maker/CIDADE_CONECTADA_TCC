-- login do administrador de teste
-- email: admin@jiparana.ro.gov.br
-- senha: admin123

create table secretarias (
  id uuid primary key default gen_random_uuid(),
  nome varchar(150) not null,
  sigla varchar(20) not null unique,
  ativa boolean not null default true
);

create table cidadaos (
  id uuid primary key default gen_random_uuid(),
  nome varchar(150) not null,
  email varchar(150) not null unique,
  senha varchar not null,
  telefone varchar(20),
  ativo boolean not null default true,
  criado_em timestamp not null default now()
);

create table administradores (
  id uuid primary key default gen_random_uuid(),
  nome varchar(150) not null,
  email varchar(150) not null unique,
  senha varchar not null,
  ativo boolean not null default true,
  secretaria_id uuid references secretarias(id),
  criado_em timestamp not null default now()
);

create table categorias (
  id uuid primary key default gen_random_uuid(),
  nome varchar(100) not null,
  icone varchar(50) not null,
  prazo_padrao_dias integer not null default 5,
  ativa boolean not null default true,
  secretaria_id uuid references secretarias(id)
);

create table equipes_campo (
  id uuid primary key default gen_random_uuid(),
  nome varchar(150) not null,
  telefone varchar(20),
  ativa boolean not null default true,
  secretaria_id uuid references secretarias(id)
);

create table enderecos (
  id uuid primary key default gen_random_uuid(),
  logradouro varchar(200) not null,
  numero varchar(20),
  bairro varchar(100),
  cidade varchar(100) not null default 'Ji-Paraná',
  latitude decimal(10,7) not null,
  longitude decimal(10,7) not null
);

create table ocorrencias (
  id uuid primary key default gen_random_uuid(),
  protocolo varchar(30) not null unique,
  descricao varchar(500) not null,
  nivel_urgencia varchar(20) not null default 'media',
  status varchar(20) not null default 'registrada',
  foto_url varchar(255),
  prazo_sla date not null,
  cidadao_id uuid references cidadaos(id),
  categoria_id uuid references categorias(id),
  endereco_id uuid unique references enderecos(id),
  equipe_campo_id uuid references equipes_campo(id),
  criado_em timestamp not null default now()
);

create table historicos_status (
  id uuid primary key default gen_random_uuid(),
  ocorrencia_id uuid references ocorrencias(id),
  administrador_id uuid references administradores(id),
  status_anterior varchar(20) not null,
  status_novo varchar(20) not null,
  criado_em timestamp not null default now()
);

create table observacoes_internas (
  id uuid primary key default gen_random_uuid(),
  ocorrencia_id uuid references ocorrencias(id),
  administrador_id uuid references administradores(id),
  texto varchar(500) not null,
  criado_em timestamp not null default now()
);

create table confirmacoes (
  id uuid primary key default gen_random_uuid(),
  ocorrencia_id uuid references ocorrencias(id),
  cidadao_id uuid references cidadaos(id),
  data timestamp not null default now(),
  unique (ocorrencia_id, cidadao_id)
);

insert into secretarias (nome, sigla) values
  ('Obras e Infraestrutura', 'SEMOB'),
  ('Serviços Urbanos', 'SEMSU'),
  ('SAAE Saneamento', 'SAAE');

insert into categorias (nome, icone, prazo_padrao_dias, secretaria_id) values
  ('Vias e Pavimentação', 'via', 3, (select id from secretarias where sigla = 'SEMOB')),
  ('Iluminação Pública', 'luz', 5, (select id from secretarias where sigla = 'SEMSU')),
  ('Limpeza Urbana', 'lixo', 2, (select id from secretarias where sigla = 'SEMSU')),
  ('Saneamento Básico', 'agua', 3, (select id from secretarias where sigla = 'SAAE')),
  ('Obras e Infraestrutura', 'obra', 10, (select id from secretarias where sigla = 'SEMOB')),
  ('Meio Ambiente', 'arvore', 7, (select id from secretarias where sigla = 'SEMSU'));

insert into equipes_campo (nome, telefone, secretaria_id) values
  ('Equipe de Pavimentação A', '(69) 3416-0001', (select id from secretarias where sigla = 'SEMOB')),
  ('Equipe de Pavimentação B', '(69) 3416-0002', (select id from secretarias where sigla = 'SEMOB')),
  ('Equipe Elétrica', '(69) 3416-0003', (select id from secretarias where sigla = 'SEMSU')),
  ('Coleta A', '(69) 3416-0004', (select id from secretarias where sigla = 'SEMSU')),
  ('SAAE 1', '(69) 3416-0005', (select id from secretarias where sigla = 'SAAE')),
  ('SAAE 2', '(69) 3416-0006', (select id from secretarias where sigla = 'SAAE'));

insert into administradores (nome, email, senha, secretaria_id) values (
  'Administrador Teste',
  'admin@jiparana.ro.gov.br',
  '$2b$10$fx5.Bu9Wol4L1rn3N17oZe36cBkuqdR5Ps7A6oX8y.3VSkUIJu96G',
  (select id from secretarias where sigla = 'SEMOB')
);