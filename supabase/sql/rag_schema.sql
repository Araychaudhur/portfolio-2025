-- Enable pgvector (run once per database)
create extension if not exists vector;

-- Documents table for RAG
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  heading text,
  content text not null,
  embedding vector(1536) not null
);

-- Similarity search function (rpc)
create or replace function public.match_documents (
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  url text,
  heading text,
  content text,
  similarity float
)
language sql stable
as $$
  select d.id, d.url, d.heading, d.content,
         1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where 1 - (d.embedding <=> query_embedding) >= match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;
