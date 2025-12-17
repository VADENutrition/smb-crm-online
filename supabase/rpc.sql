create or replace function find_open_deal_for_contact(p_user_id uuid, p_contact_id uuid)
returns table (deal_id uuid) language sql as $$
  select d.id as deal_id
  from deals d
  join deal_contacts dc on dc.deal_id = d.id
  join stages s on s.id = d.stage_id
  where d.user_id = p_user_id
    and dc.contact_id = p_contact_id
    and s.name not in ('Closed Won','Closed Lost')
  order by d.updated_at desc
  limit 1;
$$;
