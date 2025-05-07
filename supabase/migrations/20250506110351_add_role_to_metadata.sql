update auth.users
set raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data,'{}'::jsonb),
                                   '{role}',
                                   to_jsonb(p.role))
from public.profiles p
where users.id = p.id
  and (raw_user_meta_data->>'role') is null;
