
\restrict 07XKbvF4h8nFeD8xeQo69tOr4TE1uTeGsV2cXyOnFKbSv17mdFnGuGbkE2Ukcgh


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."log_activity"("p_organization_id" "uuid", "p_activity_type" "text", "p_project_id" "uuid" DEFAULT NULL::"uuid", "p_person_id" "uuid" DEFAULT NULL::"uuid", "p_description" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO activity_log (organization_id, project_id, person_id, activity_type, description, metadata)
    VALUES (p_organization_id, p_project_id, p_person_id, p_activity_type, p_description, p_metadata)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$;


ALTER FUNCTION "public"."log_activity"("p_organization_id" "uuid", "p_activity_type" "text", "p_project_id" "uuid", "p_person_id" "uuid", "p_description" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_project_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO project_status_history (project_id, old_status, new_status, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_project_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_localstorage_data"("p_organization_name" "text", "p_projects_data" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    org_id UUID;
    project_data JSONB;
    new_project_id UUID;
BEGIN
    -- Create organization
    INSERT INTO organizations (name) VALUES (p_organization_name)
    RETURNING id INTO org_id;
    
    -- Process each project
    FOR project_data IN SELECT jsonb_array_elements(p_projects_data)
    LOOP
        -- Insert project
        INSERT INTO projects (
            organization_id, name, version, status, project_type, 
            notes, tags, favorite, created_at, updated_at
        ) VALUES (
            org_id,
            project_data->>'name',
            project_data->>'version',
            project_data->>'status',
            project_data->>'project_type',
            project_data->>'notes',
            ARRAY(SELECT jsonb_array_elements_text(project_data->'tags')),
            COALESCE((project_data->>'favorite')::boolean, false),
            COALESCE((project_data->>'created_at')::timestamptz, NOW()),
            COALESCE((project_data->>'updated_at')::timestamptz, NOW())
        ) RETURNING id INTO new_project_id;
        
        -- Log the migration
        PERFORM log_activity(
            org_id, 
            new_project_id, 
            NULL, 
            'project_migrated', 
            'Migrated from localStorage'
        );
    END LOOP;
    
    RETURN org_id;
END;
$$;


ALTER FUNCTION "public"."migrate_localstorage_data"("p_organization_name" "text", "p_projects_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "project_id" "uuid",
    "person_id" "uuid",
    "activity_type" "text" NOT NULL,
    "description" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_prefs" (
    "id" boolean DEFAULT true NOT NULL,
    "last_project_id" "uuid",
    "ui" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_prefs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."banner_dimensions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "banner_id" "text" NOT NULL,
    "dimension_id" "text" NOT NULL,
    "dimension_label" "text" NOT NULL,
    "source_config" "jsonb" NOT NULL,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."banner_dimensions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."banner_groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "dimension_id" "uuid",
    "group_id" "text" NOT NULL,
    "group_label" "text",
    "reference_config" "jsonb" NOT NULL,
    "include_in_banner" boolean DEFAULT true,
    "conditions" "jsonb" DEFAULT '{}'::"jsonb",
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."banner_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "domain" "text",
    "contact_info" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_scales" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "scale_name" "text" NOT NULL,
    "point_count" integer NOT NULL,
    "scale_labels" "text"[] NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_scales" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."people" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "email" "text",
    "role" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."people" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_analytics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "metric_name" "text" NOT NULL,
    "metric_value" numeric,
    "metric_data" "jsonb" DEFAULT '{}'::"jsonb",
    "calculated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_dates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "person_id" "uuid",
    "event_name" "text" NOT NULL,
    "due_date" "date",
    "status" "text" DEFAULT 'Not Started'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_date_status" CHECK (("status" = ANY (ARRAY['Not Started'::"text", 'In Progress'::"text", 'Draft'::"text", 'Approved'::"text", 'Done'::"text"])))
);


ALTER TABLE "public"."project_dates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_globals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "default_base_verbiage" "text" DEFAULT 'Total (qualified respondents)'::"text",
    "default_base_definition" "text",
    "default_banners" "jsonb" DEFAULT '[]'::"jsonb",
    "scale_buckets" "jsonb" DEFAULT '{}'::"jsonb",
    "rules" "jsonb" DEFAULT '{}'::"jsonb",
    "banners" "jsonb" DEFAULT '[]'::"jsonb",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_globals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "person_id" "uuid",
    "role_name" "text" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_snapshots" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "snapshot_name" "text",
    "description" "text",
    "snapshot_data" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_status_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "person_id" "uuid",
    "old_status" "text",
    "new_status" "text" NOT NULL,
    "notes" "text",
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_status_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "client_id" "uuid",
    "name" "text" NOT NULL,
    "version" "text" DEFAULT '0.1.0'::"text",
    "status" "text" DEFAULT 'Draft'::"text",
    "project_type" "text",
    "notes" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "favorite" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['Draft'::"text", 'Pre-Field'::"text", 'Fielding'::"text", 'Reporting'::"text", 'Waiting for Approval'::"text", 'Active'::"text", 'Closed'::"text", 'Archived'::"text"])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "question_id" "text" NOT NULL,
    "question_text" "text",
    "question_type" "text" DEFAULT 'single'::"text",
    "question_mode" "text" DEFAULT 'list'::"text",
    "order_index" integer DEFAULT 0 NOT NULL,
    "notes" "text",
    "is_required" boolean DEFAULT true,
    "base" "jsonb" DEFAULT '{}'::"jsonb",
    "randomization" "jsonb" DEFAULT '{}'::"jsonb",
    "conditions" "jsonb" DEFAULT '{}'::"jsonb",
    "validation" "jsonb" DEFAULT '{}'::"jsonb",
    "repeated_measures" "jsonb" DEFAULT '{}'::"jsonb",
    "numeric_config" "jsonb" DEFAULT '{}'::"jsonb",
    "open_config" "jsonb" DEFAULT '{}'::"jsonb",
    "scale_config" "jsonb" DEFAULT '{}'::"jsonb",
    "grid_config" "jsonb" DEFAULT '{}'::"jsonb",
    "exports" "jsonb" DEFAULT '{}'::"jsonb",
    "tab_plan" "jsonb" DEFAULT '{}'::"jsonb",
    "advanced_table_config" "jsonb" DEFAULT '{}'::"jsonb",
    "list_config" "jsonb" DEFAULT '{}'::"jsonb",
    "numeric_enhanced_config" "jsonb" DEFAULT '{}'::"jsonb",
    "text_config" "jsonb" DEFAULT '{}'::"jsonb",
    "repeated_config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_question_mode" CHECK (("question_mode" = ANY (ARRAY['list'::"text", 'numeric'::"text", 'table'::"text", 'open'::"text", 'open_end'::"text", 'repeated'::"text", 'advanced_table'::"text", 'text'::"text", 'likert_agreement'::"text", 'likert_sentiment'::"text", 'likert_custom'::"text", 'dynamic_simple_rows'::"text", 'dynamic_simple_columns'::"text", 'dynamic_selected_rows'::"text", 'dynamic_selected_columns'::"text", 'multi_matrix'::"text"])))
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."project_summary" AS
 SELECT "p"."id",
    "p"."organization_id",
    "p"."client_id",
    "p"."name",
    "p"."version",
    "p"."status",
    "p"."project_type",
    "p"."notes",
    "p"."tags",
    "p"."favorite",
    "p"."metadata",
    "p"."created_at",
    "p"."updated_at",
    "c"."name" AS "client_name",
    ( SELECT "count"(*) AS "count"
           FROM "public"."questions" "q"
          WHERE ("q"."project_id" = "p"."id")) AS "question_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."project_roles" "pr"
          WHERE ("pr"."project_id" = "p"."id")) AS "team_member_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."project_dates" "pd"
          WHERE (("pd"."project_id" = "p"."id") AND ("pd"."due_date" < CURRENT_DATE) AND ("pd"."status" <> 'Done'::"text"))) AS "overdue_count",
        CASE
            WHEN ("p"."updated_at" > ("now"() - '7 days'::interval)) THEN 'recent'::"text"
            WHEN ("p"."updated_at" > ("now"() - '30 days'::interval)) THEN 'active'::"text"
            ELSE 'stale'::"text"
        END AS "activity_status"
   FROM ("public"."projects" "p"
     LEFT JOIN "public"."clients" "c" ON (("p"."client_id" = "c"."id")));


ALTER VIEW "public"."project_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "template_data" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_nets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid",
    "net_type" "text" NOT NULL,
    "net_label" "text",
    "net_config" "jsonb" NOT NULL,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_net_type" CHECK (("net_type" = ANY (ARRAY['codes'::"text", 'range'::"text"])))
);


ALTER TABLE "public"."question_nets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_options" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid",
    "option_code" "text" NOT NULL,
    "option_label" "text" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "is_exclusive" boolean DEFAULT false,
    "is_terminate" boolean DEFAULT false,
    "anchor_position" "text",
    "lock_randomize" boolean DEFAULT false,
    "custom_code" "text",
    "custom_label" "text",
    "nested_dropdown" "jsonb" DEFAULT '{}'::"jsonb",
    "validation_range" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "medication_group" "text",
    "input_type" "text" DEFAULT 'number'::"text",
    "preferred_name" boolean DEFAULT false,
    CONSTRAINT "valid_anchor_position" CHECK ((("anchor_position" = ANY (ARRAY['top'::"text", 'bottom'::"text"])) OR ("anchor_position" IS NULL)))
);


ALTER TABLE "public"."question_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_statements" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid",
    "statement_text" "text" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."question_statements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid",
    "group_code" "text" NOT NULL,
    "group_name" "text" NOT NULL,
    "description" "text",
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."question_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_option_assignments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "group_id" "uuid",
    "option_id" "uuid",
    "is_preferred" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."group_option_assignments" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."question_analysis" AS
 SELECT "q"."id",
    "q"."project_id",
    "q"."question_id",
    "q"."question_text",
    "q"."question_type",
    "q"."question_mode",
    "q"."order_index",
    "q"."notes",
    "q"."is_required",
    "q"."base",
    "q"."randomization",
    "q"."conditions",
    "q"."validation",
    "q"."repeated_measures",
    "q"."numeric_config",
    "q"."open_config",
    "q"."scale_config",
    "q"."grid_config",
    "q"."exports",
    "q"."tab_plan",
    "q"."created_at",
    "q"."updated_at",
    "p"."name" AS "project_name",
    ( SELECT "count"(*) AS "count"
           FROM "public"."question_options" "qo"
          WHERE ("qo"."question_id" = "q"."id")) AS "option_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."question_statements" "qs"
          WHERE ("qs"."question_id" = "q"."id")) AS "statement_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."question_nets" "qn"
          WHERE ("qn"."question_id" = "q"."id")) AS "net_count"
   FROM ("public"."questions" "q"
     JOIN "public"."projects" "p" ON (("q"."project_id" = "p"."id")));


ALTER VIEW "public"."question_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_library" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "client_id" "uuid",
    "question_data" "jsonb" NOT NULL,
    "source_project_id" "uuid",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "usage_count" integer DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_used_at" timestamp with time zone
);


ALTER TABLE "public"."question_library" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tag_associations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tag_id" "uuid",
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tag_associations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "tag_name" "text" NOT NULL,
    "tag_category" "text",
    "color_hex" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_wire" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_wire" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_prefs"
    ADD CONSTRAINT "app_prefs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."banner_dimensions"
    ADD CONSTRAINT "banner_dimensions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."banner_groups"
    ADD CONSTRAINT "banner_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_organization_id_name_key" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_scales"
    ADD CONSTRAINT "custom_scales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."people"
    ADD CONSTRAINT "people_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."people"
    ADD CONSTRAINT "people_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_analytics"
    ADD CONSTRAINT "project_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_dates"
    ADD CONSTRAINT "project_dates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_globals"
    ADD CONSTRAINT "project_globals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_roles"
    ADD CONSTRAINT "project_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_roles"
    ADD CONSTRAINT "project_roles_project_id_person_id_role_name_key" UNIQUE ("project_id", "person_id", "role_name");



ALTER TABLE ONLY "public"."project_snapshots"
    ADD CONSTRAINT "project_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_status_history"
    ADD CONSTRAINT "project_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_templates"
    ADD CONSTRAINT "project_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_library"
    ADD CONSTRAINT "question_library_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_nets"
    ADD CONSTRAINT "question_nets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_options"
    ADD CONSTRAINT "question_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_statements"
    ADD CONSTRAINT "question_statements_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."question_groups"
    ADD CONSTRAINT "question_groups_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."group_option_assignments"
    ADD CONSTRAINT "group_option_assignments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."group_option_assignments"
    ADD CONSTRAINT "group_option_assignments_group_option_unique" UNIQUE ("group_id", "option_id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tag_associations"
    ADD CONSTRAINT "tag_associations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_wire"
    ADD CONSTRAINT "test_wire_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."banner_groups"
    ADD CONSTRAINT "unique_dimension_group" UNIQUE ("dimension_id", "group_id");



ALTER TABLE ONLY "public"."custom_scales"
    ADD CONSTRAINT "unique_org_scale" UNIQUE ("organization_id", "scale_name", "point_count");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "unique_org_tag" UNIQUE ("organization_id", "tag_name");



ALTER TABLE ONLY "public"."banner_dimensions"
    ADD CONSTRAINT "unique_project_banner_dimension" UNIQUE ("project_id", "banner_id", "dimension_id");



ALTER TABLE ONLY "public"."project_globals"
    ADD CONSTRAINT "unique_project_globals" UNIQUE ("project_id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "unique_project_question" UNIQUE ("project_id", "question_id");



ALTER TABLE ONLY "public"."question_options"
    ADD CONSTRAINT "unique_question_option" UNIQUE ("question_id", "option_code");



ALTER TABLE ONLY "public"."tag_associations"
    ADD CONSTRAINT "unique_tag_entity" UNIQUE ("tag_id", "entity_type", "entity_id");



CREATE INDEX "idx_activity_log_created_at" ON "public"."activity_log" USING "btree" ("created_at");



CREATE INDEX "idx_activity_log_organization_id" ON "public"."activity_log" USING "btree" ("organization_id");



CREATE INDEX "idx_activity_log_person_id" ON "public"."activity_log" USING "btree" ("person_id");



CREATE INDEX "idx_activity_log_project_id" ON "public"."activity_log" USING "btree" ("project_id");



CREATE INDEX "idx_clients_name_gin" ON "public"."clients" USING "gin" ("name" "public"."gin_trgm_ops");



CREATE INDEX "idx_project_globals_rules_gin" ON "public"."project_globals" USING "gin" ("rules");



CREATE INDEX "idx_projects_client_id" ON "public"."projects" USING "btree" ("client_id");



CREATE INDEX "idx_projects_created_at" ON "public"."projects" USING "btree" ("created_at");



CREATE INDEX "idx_projects_name_gin" ON "public"."projects" USING "gin" ("name" "public"."gin_trgm_ops");



CREATE INDEX "idx_projects_organization_id" ON "public"."projects" USING "btree" ("organization_id");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_projects_tags_gin" ON "public"."projects" USING "gin" ("tags");



CREATE INDEX "idx_projects_updated_at" ON "public"."projects" USING "btree" ("updated_at");



CREATE INDEX "idx_question_options_medication_group" ON "public"."question_options" USING "btree" ("medication_group") WHERE ("medication_group" IS NOT NULL);



CREATE INDEX "idx_questions_conditions_gin" ON "public"."questions" USING "gin" ("conditions");



CREATE INDEX "idx_questions_order_index" ON "public"."questions" USING "btree" ("order_index");



CREATE INDEX "idx_questions_project_id" ON "public"."questions" USING "btree" ("project_id");



CREATE INDEX "idx_questions_question_id" ON "public"."questions" USING "btree" ("question_id");



CREATE INDEX "idx_questions_question_type" ON "public"."questions" USING "btree" ("question_type");



CREATE INDEX "idx_questions_text_gin" ON "public"."questions" USING "gin" ("question_text" "public"."gin_trgm_ops");



CREATE OR REPLACE TRIGGER "project_status_change_trigger" AFTER UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."log_project_status_change"();



CREATE OR REPLACE TRIGGER "update_project_globals_updated_at" BEFORE UPDATE ON "public"."project_globals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_questions_updated_at" BEFORE UPDATE ON "public"."questions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."app_prefs"
    ADD CONSTRAINT "app_prefs_last_project_id_fkey" FOREIGN KEY ("last_project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."banner_dimensions"
    ADD CONSTRAINT "banner_dimensions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."banner_groups"
    ADD CONSTRAINT "banner_groups_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "public"."banner_dimensions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_scales"
    ADD CONSTRAINT "custom_scales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."people"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."custom_scales"
    ADD CONSTRAINT "custom_scales_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."people"
    ADD CONSTRAINT "people_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_analytics"
    ADD CONSTRAINT "project_analytics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_dates"
    ADD CONSTRAINT "project_dates_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."project_dates"
    ADD CONSTRAINT "project_dates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_globals"
    ADD CONSTRAINT "project_globals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_roles"
    ADD CONSTRAINT "project_roles_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_roles"
    ADD CONSTRAINT "project_roles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_snapshots"
    ADD CONSTRAINT "project_snapshots_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."people"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."project_snapshots"
    ADD CONSTRAINT "project_snapshots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_status_history"
    ADD CONSTRAINT "project_status_history_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."project_status_history"
    ADD CONSTRAINT "project_status_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_templates"
    ADD CONSTRAINT "project_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."people"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."project_templates"
    ADD CONSTRAINT "project_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_library"
    ADD CONSTRAINT "question_library_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."question_library"
    ADD CONSTRAINT "question_library_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."people"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."question_library"
    ADD CONSTRAINT "question_library_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_library"
    ADD CONSTRAINT "question_library_source_project_id_fkey" FOREIGN KEY ("source_project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."question_nets"
    ADD CONSTRAINT "question_nets_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_options"
    ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_statements"
    ADD CONSTRAINT "question_statements_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."question_groups"
    ADD CONSTRAINT "question_groups_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."group_option_assignments"
    ADD CONSTRAINT "group_option_assignments_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."question_groups"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."group_option_assignments"
    ADD CONSTRAINT "group_option_assignments_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."question_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tag_associations"
    ADD CONSTRAINT "tag_associations_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



CREATE POLICY "anon read" ON "public"."app_prefs" FOR SELECT TO "anon" USING (true);



CREATE POLICY "anon update" ON "public"."app_prefs" FOR UPDATE TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "anon upsert" ON "public"."app_prefs" FOR INSERT TO "anon" WITH CHECK (true);



ALTER TABLE "public"."app_prefs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_activity"("p_organization_id" "uuid", "p_activity_type" "text", "p_project_id" "uuid", "p_person_id" "uuid", "p_description" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_activity"("p_organization_id" "uuid", "p_activity_type" "text", "p_project_id" "uuid", "p_person_id" "uuid", "p_description" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_activity"("p_organization_id" "uuid", "p_activity_type" "text", "p_project_id" "uuid", "p_person_id" "uuid", "p_description" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_project_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_project_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_project_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_localstorage_data"("p_organization_name" "text", "p_projects_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_localstorage_data"("p_organization_name" "text", "p_projects_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_localstorage_data"("p_organization_name" "text", "p_projects_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."app_prefs" TO "anon";
GRANT ALL ON TABLE "public"."app_prefs" TO "authenticated";
GRANT ALL ON TABLE "public"."app_prefs" TO "service_role";



GRANT ALL ON TABLE "public"."banner_dimensions" TO "anon";
GRANT ALL ON TABLE "public"."banner_dimensions" TO "authenticated";
GRANT ALL ON TABLE "public"."banner_dimensions" TO "service_role";



GRANT ALL ON TABLE "public"."banner_groups" TO "anon";
GRANT ALL ON TABLE "public"."banner_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."banner_groups" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."custom_scales" TO "anon";
GRANT ALL ON TABLE "public"."custom_scales" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_scales" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."people" TO "anon";
GRANT ALL ON TABLE "public"."people" TO "authenticated";
GRANT ALL ON TABLE "public"."people" TO "service_role";



GRANT ALL ON TABLE "public"."project_analytics" TO "anon";
GRANT ALL ON TABLE "public"."project_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."project_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."project_dates" TO "anon";
GRANT ALL ON TABLE "public"."project_dates" TO "authenticated";
GRANT ALL ON TABLE "public"."project_dates" TO "service_role";



GRANT ALL ON TABLE "public"."project_globals" TO "anon";
GRANT ALL ON TABLE "public"."project_globals" TO "authenticated";
GRANT ALL ON TABLE "public"."project_globals" TO "service_role";



GRANT ALL ON TABLE "public"."project_roles" TO "anon";
GRANT ALL ON TABLE "public"."project_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."project_roles" TO "service_role";



GRANT ALL ON TABLE "public"."project_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."project_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."project_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."project_status_history" TO "anon";
GRANT ALL ON TABLE "public"."project_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."project_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON TABLE "public"."project_summary" TO "anon";
GRANT ALL ON TABLE "public"."project_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."project_summary" TO "service_role";



GRANT ALL ON TABLE "public"."project_templates" TO "anon";
GRANT ALL ON TABLE "public"."project_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."project_templates" TO "service_role";



GRANT ALL ON TABLE "public"."question_nets" TO "anon";
GRANT ALL ON TABLE "public"."question_nets" TO "authenticated";
GRANT ALL ON TABLE "public"."question_nets" TO "service_role";



GRANT ALL ON TABLE "public"."question_options" TO "anon";
GRANT ALL ON TABLE "public"."question_options" TO "authenticated";
GRANT ALL ON TABLE "public"."question_options" TO "service_role";



GRANT ALL ON TABLE "public"."question_statements" TO "anon";
GRANT ALL ON TABLE "public"."question_statements" TO "authenticated";
GRANT ALL ON TABLE "public"."question_statements" TO "service_role";



GRANT ALL ON TABLE "public"."question_analysis" TO "anon";
GRANT ALL ON TABLE "public"."question_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."question_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."question_library" TO "anon";
GRANT ALL ON TABLE "public"."question_library" TO "authenticated";
GRANT ALL ON TABLE "public"."question_library" TO "service_role";



GRANT ALL ON TABLE "public"."tag_associations" TO "anon";
GRANT ALL ON TABLE "public"."tag_associations" TO "authenticated";
GRANT ALL ON TABLE "public"."tag_associations" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."test_wire" TO "anon";
GRANT ALL ON TABLE "public"."test_wire" TO "authenticated";
GRANT ALL ON TABLE "public"."test_wire" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























\unrestrict 07XKbvF4h8nFeD8xeQo69tOr4TE1uTeGsV2cXyOnFKbSv17mdFnGuGbkE2Ukcgh

RESET ALL;
