-- WS-A: courses 테이블 확장 (수동 등록 + 어댑터 메타 + 인원/정렬/활성)
-- 적용: Supabase. 모두 additive(기존 동작 비파괴).

alter table public.courses add column if not exists adapter text;
alter table public.courses add column if not exists source_ref jsonb not null default '{}'::jsonb;
alter table public.courses add column if not exists default_players int not null default 4;
alter table public.courses add column if not exists is_active boolean not null default true;
alter table public.courses add column if not exists sort_order int not null default 0;
alter table public.courses add column if not exists manual_slots jsonb not null default '[]'::jsonb;

comment on column public.courses.adapter is
  'how to get tee times: manual | teeon | teeitup | prophetservices | chronogolf | cps_golf | clubhouse_online | teeon_portal | golfnow';
comment on column public.courses.source_ref is
  'adapter-specific ref: {"course_code":"TRAN"} | {"facility_id":"15887","slug":"..."} | {}';
comment on column public.courses.manual_slots is
  'manual 코스 전용 슬롯: [{"time":"07:00","price":57,"is_hot_deal":false,"spots_available":4}]';

-- 기존 코스 adapter 백필 (booking_url 패턴 기반)
update public.courses set adapter = case
  when source_type = 'golfnow'                              then 'golfnow'
  when booking_url ilike '%prophetservices.com%'           then 'prophetservices'
  when booking_url ilike '%clubhouseonline-e3.net%'        then 'clubhouse_online'
  when booking_url ilike '%cps.golf%'                      then 'cps_golf'
  when booking_url ilike '%book.teeitup.com%'              then 'teeitup'
  when booking_url ilike '%admin.teeon.com/portal%'        then 'teeon_portal'
  when booking_url ilike '%larters.com%'                   then 'chronogolf'
  when booking_url ilike '%tee-on.com%'                    then 'teeon'
  else adapter
end
where adapter is null;

-- 공개 읽기 정책 (활성 코스만) — WS-B 홈 표시용. 쓰기는 service role만(정책 없음 → anon 차단 유지).
drop policy if exists "courses public read active" on public.courses;
create policy "courses public read active" on public.courses
  for select to anon, authenticated using (is_active = true);
