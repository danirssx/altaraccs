
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.brand_images (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  brand_id integer NOT NULL,
  url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT brand_images_pkey PRIMARY KEY (id),
  CONSTRAINT brand_images_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);
CREATE TABLE public.brands (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory_current (
  product_id integer NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT inventory_current_pkey PRIMARY KEY (product_id),
  CONSTRAINT inventory_current_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.inventory_movements (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  product_id integer NOT NULL,
  movement_type text NOT NULL CHECK (movement_type = ANY (ARRAY['IN'::text, 'OUT'::text])),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT inventory_movements_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.order_items (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id bigint NOT NULL,
  product_variant_id integer NOT NULL,
  qty integer NOT NULL CHECK (qty > 0),
  unit_price numeric NOT NULL,
  unit_original_price numeric,
  unit_sale_price numeric,
  title_snapshot text,
  sku_snapshot text,
  line_subtotal numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.order_status_history (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id bigint NOT NULL,
  from_status_id integer,
  to_status_id integer NOT NULL,
  actor_uid uuid DEFAULT auth.uid(),
  actor_name text,
  reason text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_status_history_from_status_id_fkey FOREIGN KEY (from_status_id) REFERENCES public.order_statuses(id),
  CONSTRAINT order_status_history_to_status_id_fkey FOREIGN KEY (to_status_id) REFERENCES public.order_statuses(id)
);
CREATE TABLE public.order_statuses (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_terminal boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_statuses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  customer_uid uuid,
  customer_email text,
  customer_name text,
  customer_phone text,
  status_id integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD'::text,
  subtotal numeric NOT NULL DEFAULT 0,
  discount_total numeric NOT NULL DEFAULT 0,
  shipping_total numeric NOT NULL DEFAULT 0,
  tax_total numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  orig_price numeric NOT NULL DEFAULT 0,
  ship_full_name text,
  ship_address_line1 text,
  ship_address_line2 text,
  ship_city text,
  ship_state text,
  ship_postal_code text,
  ship_country text,
  ship_notes text,
  bill_full_name text,
  bill_address_line1 text,
  bill_address_line2 text,
  bill_city text,
  bill_state text,
  bill_postal_code text,
  bill_country text,
  order_number text UNIQUE,
  notes_internal text,
  placed_at timestamp with time zone,
  paid_at timestamp with time zone,
  canceled_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.order_statuses(id)
);
CREATE TABLE public.product_groups (
  id integer NOT NULL DEFAULT nextval('product_groups_id_seq'::regclass),
  name text NOT NULL,
  description text,
  brand_id integer NOT NULL,
  product_type_id integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_groups_pkey PRIMARY KEY (id),
  CONSTRAINT product_groups_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id),
  CONSTRAINT product_groups_product_type_id_fkey FOREIGN KEY (product_type_id) REFERENCES public.product_types(id)
);
CREATE TABLE public.product_images (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  product_id integer NOT NULL,
  url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  url_cloudinary text,
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.product_types (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  CONSTRAINT product_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_variants (
  id integer NOT NULL,
  product_group_id integer NOT NULL,
  size text,
  color text,
  code bigint NOT NULL UNIQUE,
  price numeric NOT NULL,
  original_price numeric,
  sale_price numeric,
  composition text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_group_id_fkey FOREIGN KEY (product_group_id) REFERENCES public.product_groups(id)
);
CREATE TABLE public.scans (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  barcode text NOT NULL UNIQUE,
  quantity integer NOT NULL DEFAULT 0,
  first_scan timestamp with time zone DEFAULT now(),
  last_scan timestamp with time zone DEFAULT now(),
  responsible text,
  CONSTRAINT scans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scans_logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  scans_id bigint,
  scans_testing_id bigint,
  source_table text NOT NULL CHECK (source_table = ANY (ARRAY['scans'::text, 'scans_testing'::text])),
  barcode text NOT NULL,
  delta integer NOT NULL,
  quantity_after integer NOT NULL,
  actor_uid uuid DEFAULT auth.uid(),
  actor_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT scans_logs_pkey PRIMARY KEY (id),
  CONSTRAINT scans_logs_scans_id_fkey FOREIGN KEY (scans_id) REFERENCES public.scans(id),
  CONSTRAINT scans_logs_scans_testing_id_fkey FOREIGN KEY (scans_testing_id) REFERENCES public.scans_testing(id)
);
CREATE TABLE public.scans_testing (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  barcode text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  first_scan timestamp with time zone DEFAULT now(),
  last_scan timestamp with time zone DEFAULT now(),
  responsible text,
  CONSTRAINT scans_testing_pkey PRIMARY KEY (id)
);
