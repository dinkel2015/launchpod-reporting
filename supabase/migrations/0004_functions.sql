-- 32 random bytes, base64url-encoded (no padding) — used for private client
-- report links. Regeneration just calls this again from the app layer.
create or replace function generate_access_token()
returns text as $$
  select translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_');
$$ language sql volatile;

alter table clients
  alter column private_access_token set default generate_access_token();

-- Publish gate: the app runs the full validation-gate checklist client/server
-- side before calling this, but the DB enforces the one rule that must never
-- be bypassed regardless of caller: displayed total downloads must equal
-- apple_plays + spotify_plays for the report being published.
create or replace function assert_downloads_reconcile(p_report_id uuid)
returns boolean as $$
declare
  v_apple numeric;
  v_spotify numeric;
  v_total numeric;
begin
  select value::numeric into v_apple
    from report_metrics
    where report_id = p_report_id and metric_key = 'apple_plays' and included_in_report
    order by updated_at desc limit 1;

  select value::numeric into v_spotify
    from report_metrics
    where report_id = p_report_id and metric_key = 'spotify_plays' and included_in_report
    order by updated_at desc limit 1;

  select value::numeric into v_total
    from report_metrics
    where report_id = p_report_id and metric_key = 'total_downloads' and included_in_report
    order by updated_at desc limit 1;

  if v_apple is null or v_spotify is null or v_total is null then
    return false;
  end if;

  return v_total = (v_apple + v_spotify);
end;
$$ language plpgsql stable;
