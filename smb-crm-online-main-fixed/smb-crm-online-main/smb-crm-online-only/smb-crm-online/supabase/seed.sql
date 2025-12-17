-- Replace placeholders:
-- :uid = your Supabase auth user id (uuid)
-- :pipeline_id = pipeline id returned from first insert

insert into pipelines(user_id, name) values (:uid, 'Default Pipeline') returning id;

insert into stages(pipeline_id, name, stage_order, probability) values
(:pipeline_id, 'New', 1, 10),
(:pipeline_id, 'Contacted', 2, 25),
(:pipeline_id, 'Qualified', 3, 50),
(:pipeline_id, 'Proposal', 4, 70),
(:pipeline_id, 'Negotiation', 5, 85),
(:pipeline_id, 'Closed Won', 6, 100),
(:pipeline_id, 'Closed Lost', 7, 0);
