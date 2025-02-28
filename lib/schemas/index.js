// Supabase SQL Editor Schemas:

// create table public.users (
//     id uuid default gen_random_uuid() primary key,
//     email varchar(255) unique not null,
//     password varchar(255) not null,
//     name varchar(255) not null,
//     phone varchar(255) not null,
//     role varchar(50) default 'user' not null,
//     is_verified boolean default false,
//     verification_token varchar(64),
//     verification_token_expires_at timestamp with time zone,
//     reset_token varchar(64),
//     reset_token_expires_at timestamp with time zone,
//     subscription_status varchar(50) DEFAULT 'trial',
//     subscription_start_date timestamp with time zone,
//     subscription_end_date timestamp with time zone,
//     trial_end_date timestamp with time zone;
//     created_at timestamp with time zone default now(),
//     updated_at timestamp with time zone default now()
// );

// ###########################################################################

// CREATE TABLE public.companies (
//     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//     user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
//     business_name varchar(255) NOT NULL,
//     business_address text NOT NULL,
//     created_at timestamp with time zone DEFAULT now(),
//     updated_at timestamp with time zone DEFAULT now()
// );
// -- Create index for user lookups
// CREATE INDEX idx_companies_user_id ON public.companies(user_id);

// ###########################################################################

// CREATE TABLE public.subscriptions (
//     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//     user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
//     plan_type varchar(50) NOT NULL CHECK (plan_type IN ('trial', 'monthly', 'annually')),
//     user_count integer DEFAULT 1,
//     amount_per_user decimal(10,2) NOT NULL,
//     total_amount decimal(10,2) NOT NULL,
//     status varchar(50) DEFAULT 'active',
//     current_period_start timestamp with time zone NOT NULL,
//     current_period_end timestamp with time zone NOT NULL,
//     cancel_at_period_end boolean DEFAULT false,
//     created_at timestamp with time zone DEFAULT now(),
//     updated_at timestamp with time zone DEFAULT now(),
    
//     -- Optional fields for when using a payment processor
//     payment_processor_id varchar(255),
//     customer_id varchar(255),
//     subscription_id varchar(255)
// );
// -- Create indexes
// CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
// CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

// ###########################################################################

// CREATE TABLE public.refresh_tokens (
//     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//     user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
//     token varchar(255) NOT NULL UNIQUE,
//     expires_at timestamp with time zone NOT NULL,
//     created_at timestamp with time zone DEFAULT now(),
//     updated_at timestamp with time zone DEFAULT now()
// );

// -- Create index for faster token lookups
// CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens(token);
// -- Create index for user lookups
// CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);