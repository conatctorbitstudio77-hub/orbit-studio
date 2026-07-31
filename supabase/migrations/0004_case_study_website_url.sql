-- Orbit Studio — add website_url to case_studies so "Our Work" cards can
-- link out to the live client site.

alter table case_studies
  add column if not exists website_url text;
