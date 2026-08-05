begin;

alter table public.push_devices
  drop constraint push_devices_installation_valid;

alter table public.push_devices
  add constraint push_devices_installation_valid check (
    length(installation_id) <= 220
    and (
      installation_id ~ '^install_[a-z0-9]+_[a-z0-9]{8,160}$'
      or installation_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    )
  );

commit;
