--
-- PostgreSQL database dump
--

\restrict aBJxvapYZeEqs5WTNclGKWDcyZvcf1N3bpNbAFhUhTaN9wXzeoucS7XFgEOjXom

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-06-10 16:20:02

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 932 (class 1247 OID 17128)
-- Name: BulletType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BulletType" AS ENUM (
    'BULLET',
    'NUMBERED',
    'DASH'
);


ALTER TYPE public."BulletType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 231 (class 1259 OID 16822)
-- Name: Vacancy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Vacancy" (
    id integer NOT NULL,
    "isNew" boolean DEFAULT false NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "categoryId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "closingDate" timestamp(3) without time zone,
    "isDateVisible" boolean DEFAULT true NOT NULL,
    "requirementsType" public."BulletType" DEFAULT 'BULLET'::public."BulletType" NOT NULL,
    "responsibleType" public."BulletType" DEFAULT 'BULLET'::public."BulletType" NOT NULL,
    "isStartDateVisible" boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone,
    slug text NOT NULL,
    title jsonb DEFAULT '{}'::jsonb NOT NULL,
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    "aboutRole" jsonb,
    "newLabel" jsonb,
    requirements jsonb DEFAULT '[]'::jsonb NOT NULL,
    responsible jsonb DEFAULT '[]'::jsonb NOT NULL,
    skills jsonb DEFAULT '[]'::jsonb NOT NULL
);


ALTER TABLE public."Vacancy" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16806)
-- Name: VacancyCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VacancyCategory" (
    id integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public."VacancyCategory" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16805)
-- Name: VacancyCategory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."VacancyCategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."VacancyCategory_id_seq" OWNER TO postgres;

--
-- TOC entry 5492 (class 0 OID 0)
-- Dependencies: 228
-- Name: VacancyCategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."VacancyCategory_id_seq" OWNED BY public."VacancyCategory".id;


--
-- TOC entry 233 (class 1259 OID 16843)
-- Name: VacancyPageHeader; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VacancyPageHeader" (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    title jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public."VacancyPageHeader" OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16842)
-- Name: VacancyPageHeader_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."VacancyPageHeader_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."VacancyPageHeader_id_seq" OWNER TO postgres;

--
-- TOC entry 5493 (class 0 OID 0)
-- Dependencies: 232
-- Name: VacancyPageHeader_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."VacancyPageHeader_id_seq" OWNED BY public."VacancyPageHeader".id;


--
-- TOC entry 230 (class 1259 OID 16821)
-- Name: Vacancy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Vacancy_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Vacancy_id_seq" OWNER TO postgres;

--
-- TOC entry 5494 (class 0 OID 0)
-- Dependencies: 230
-- Name: Vacancy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Vacancy_id_seq" OWNED BY public."Vacancy".id;


--
-- TOC entry 219 (class 1259 OID 16387)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 33547)
-- Name: about_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.about_settings (
    id integer NOT NULL,
    "heroImage" text,
    "heroParagraphs" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "storyBlocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "teamCtaHref" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "heroImageAlt" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "heroBadge" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "heroTitle" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "teamTitle" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "teamDescription" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "teamCtaLabel" jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.about_settings OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 33546)
-- Name: about_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.about_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.about_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5495 (class 0 OID 0)
-- Dependencies: 252
-- Name: about_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.about_settings_id_seq OWNED BY public.about_settings.id;


--
-- TOC entry 245 (class 1259 OID 25178)
-- Name: blog_authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_authors (
    id integer NOT NULL,
    name text NOT NULL,
    role text,
    avatar text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    bio text,
    "linkedinHref" text,
    skills text[],
    "skillsTitle" text,
    slug text,
    "avatarAlt" text,
    "linkedinIcon" text,
    "isOurTeam" boolean DEFAULT false NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.blog_authors OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 25177)
-- Name: blog_authors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_authors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_authors_id_seq OWNER TO postgres;

--
-- TOC entry 5496 (class 0 OID 0)
-- Dependencies: 244
-- Name: blog_authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_authors_id_seq OWNED BY public.blog_authors.id;


--
-- TOC entry 247 (class 1259 OID 25194)
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_categories (
    id integer NOT NULL,
    label text NOT NULL,
    slug text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.blog_categories OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 25193)
-- Name: blog_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5497 (class 0 OID 0)
-- Dependencies: 246
-- Name: blog_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_categories_id_seq OWNED BY public.blog_categories.id;


--
-- TOC entry 251 (class 1259 OID 26073)
-- Name: blog_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_settings (
    id integer NOT NULL,
    "pageTitle" text DEFAULT 'Bloglar'::text NOT NULL,
    "buttonText" text DEFAULT 'Portfolio'::text NOT NULL,
    "buttonLink" text DEFAULT '/portfolio'::text NOT NULL,
    "quoteText" text DEFAULT ''::text NOT NULL,
    "quoteImage" text DEFAULT ''::text NOT NULL,
    "quoteImageAlt" text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "buttonNewTab" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.blog_settings OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 26072)
-- Name: blog_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5498 (class 0 OID 0)
-- Dependencies: 250
-- Name: blog_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_settings_id_seq OWNED BY public.blog_settings.id;


--
-- TOC entry 249 (class 1259 OID 25211)
-- Name: blogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blogs (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    badge text NOT NULL,
    excerpt text NOT NULL,
    "coverImage" text NOT NULL,
    "coverImageAlt" text,
    "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "isFeaturedMain" boolean DEFAULT false NOT NULL,
    "isFeaturedSide" boolean DEFAULT false NOT NULL,
    "isPickOfWeek" boolean DEFAULT false NOT NULL,
    "isPreview" boolean DEFAULT false NOT NULL,
    "isGrid" boolean DEFAULT false NOT NULL,
    hashtags text[],
    sections jsonb DEFAULT '[]'::jsonb NOT NULL,
    "authorId" integer,
    "categoryId" integer,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isAuthorList" boolean DEFAULT false NOT NULL,
    "isAuthorPreview" boolean DEFAULT false NOT NULL,
    "isHomeVisible" boolean DEFAULT false NOT NULL,
    "authorListPinnedAt" timestamp(3) without time zone
);


ALTER TABLE public.blogs OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 25210)
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blogs_id_seq OWNER TO postgres;

--
-- TOC entry 5499 (class 0 OID 0)
-- Dependencies: 248
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blogs_id_seq OWNED BY public.blogs.id;


--
-- TOC entry 269 (class 1259 OID 36789)
-- Name: contact_budget_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_budget_options (
    id integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "contactId" integer NOT NULL,
    label jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.contact_budget_options OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 36788)
-- Name: contact_budget_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_budget_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_budget_options_id_seq OWNER TO postgres;

--
-- TOC entry 5500 (class 0 OID 0)
-- Dependencies: 268
-- Name: contact_budget_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_budget_options_id_seq OWNED BY public.contact_budget_options.id;


--
-- TOC entry 265 (class 1259 OID 36714)
-- Name: contact_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_settings (
    id integer NOT NULL,
    tags text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "formBudgetPlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formTimelinePlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    title jsonb DEFAULT '{}'::jsonb NOT NULL,
    description jsonb DEFAULT '{}'::jsonb NOT NULL,
    "emailLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "emailValue" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "phoneLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "phoneValue" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "locationLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "locationValue" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "hoursLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "hoursValue" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "followUsLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formNameLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formNamePlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formEmailLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formEmailPlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formPhoneLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formPhonePlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formServiceLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formBudgetLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formTimelineLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formMessageLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formMessagePlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formSubmitLabel" jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.contact_settings OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 36713)
-- Name: contact_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5501 (class 0 OID 0)
-- Dependencies: 264
-- Name: contact_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_settings_id_seq OWNED BY public.contact_settings.id;


--
-- TOC entry 267 (class 1259 OID 36773)
-- Name: contact_social_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_social_links (
    id integer NOT NULL,
    icon text,
    href text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "contactId" integer NOT NULL
);


ALTER TABLE public.contact_social_links OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 36772)
-- Name: contact_social_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_social_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_social_links_id_seq OWNER TO postgres;

--
-- TOC entry 5502 (class 0 OID 0)
-- Dependencies: 266
-- Name: contact_social_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_social_links_id_seq OWNED BY public.contact_social_links.id;


--
-- TOC entry 273 (class 1259 OID 36817)
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_submissions (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    service text NOT NULL,
    budget text NOT NULL,
    timeline text NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.contact_submissions OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 36816)
-- Name: contact_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_submissions_id_seq OWNER TO postgres;

--
-- TOC entry 5503 (class 0 OID 0)
-- Dependencies: 272
-- Name: contact_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_submissions_id_seq OWNED BY public.contact_submissions.id;


--
-- TOC entry 271 (class 1259 OID 36803)
-- Name: contact_timeline_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_timeline_options (
    id integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "contactId" integer NOT NULL,
    label jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.contact_timeline_options OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 36802)
-- Name: contact_timeline_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_timeline_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_timeline_options_id_seq OWNER TO postgres;

--
-- TOC entry 5504 (class 0 OID 0)
-- Dependencies: 270
-- Name: contact_timeline_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_timeline_options_id_seq OWNED BY public.contact_timeline_options.id;


--
-- TOC entry 223 (class 1259 OID 16452)
-- Name: faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    question jsonb DEFAULT '{}'::jsonb NOT NULL,
    answer jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16451)
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faqs_id_seq OWNER TO postgres;

--
-- TOC entry 5505 (class 0 OID 0)
-- Dependencies: 222
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- TOC entry 261 (class 1259 OID 35529)
-- Name: footer_nav_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.footer_nav_links (
    id integer NOT NULL,
    href text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "openInNewTab" boolean DEFAULT false NOT NULL,
    "footerId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    label jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.footer_nav_links OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 35528)
-- Name: footer_nav_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.footer_nav_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.footer_nav_links_id_seq OWNER TO postgres;

--
-- TOC entry 5506 (class 0 OID 0)
-- Dependencies: 260
-- Name: footer_nav_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.footer_nav_links_id_seq OWNED BY public.footer_nav_links.id;


--
-- TOC entry 259 (class 1259 OID 35496)
-- Name: footer_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.footer_settings (
    id integer NOT NULL,
    "logoImage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "logoAlt" jsonb DEFAULT '{}'::jsonb NOT NULL,
    description jsonb DEFAULT '{}'::jsonb NOT NULL,
    "copyrightText" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "privacyText" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "locationLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "phoneLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "emailLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "locationValue" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "phoneValue" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "emailValue" jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.footer_settings OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 35495)
-- Name: footer_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.footer_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.footer_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5507 (class 0 OID 0)
-- Dependencies: 258
-- Name: footer_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.footer_settings_id_seq OWNED BY public.footer_settings.id;


--
-- TOC entry 263 (class 1259 OID 35551)
-- Name: footer_social_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.footer_social_links (
    id integer NOT NULL,
    icon text,
    href text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "footerId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.footer_social_links OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 35550)
-- Name: footer_social_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.footer_social_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.footer_social_links_id_seq OWNER TO postgres;

--
-- TOC entry 5508 (class 0 OID 0)
-- Dependencies: 262
-- Name: footer_social_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.footer_social_links_id_seq OWNED BY public.footer_social_links.id;


--
-- TOC entry 257 (class 1259 OID 34459)
-- Name: nav_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nav_links (
    id integer NOT NULL,
    href text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "openInNewTab" boolean DEFAULT false NOT NULL,
    "navbarId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    label jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.nav_links OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 34458)
-- Name: nav_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nav_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nav_links_id_seq OWNER TO postgres;

--
-- TOC entry 5509 (class 0 OID 0)
-- Dependencies: 256
-- Name: nav_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nav_links_id_seq OWNED BY public.nav_links.id;


--
-- TOC entry 255 (class 1259 OID 34440)
-- Name: navbar_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.navbar_settings (
    id integer NOT NULL,
    "logoImage" text,
    "showSearch" boolean DEFAULT true NOT NULL,
    "showLang" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "logoImageAlt" jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.navbar_settings OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 34439)
-- Name: navbar_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.navbar_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.navbar_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5510 (class 0 OID 0)
-- Dependencies: 254
-- Name: navbar_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.navbar_settings_id_seq OWNED BY public.navbar_settings.id;


--
-- TOC entry 239 (class 1259 OID 20900)
-- Name: partner_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partner_sections (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "linkText" text DEFAULT ''::text NOT NULL,
    "linkHref" text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.partner_sections OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 20899)
-- Name: partner_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.partner_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partner_sections_id_seq OWNER TO postgres;

--
-- TOC entry 5511 (class 0 OID 0)
-- Dependencies: 238
-- Name: partner_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.partner_sections_id_seq OWNED BY public.partner_sections.id;


--
-- TOC entry 241 (class 1259 OID 20919)
-- Name: partners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partners (
    id integer NOT NULL,
    image text NOT NULL,
    "altText" text DEFAULT ''::text NOT NULL,
    name text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isHomepage" boolean DEFAULT false NOT NULL,
    "sectionId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.partners OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 20918)
-- Name: partners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partners_id_seq OWNER TO postgres;

--
-- TOC entry 5512 (class 0 OID 0)
-- Dependencies: 240
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.partners_id_seq OWNED BY public.partners.id;


--
-- TOC entry 237 (class 1259 OID 18233)
-- Name: portfolios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolios (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    tags text[],
    "coverImage" text NOT NULL,
    sections jsonb DEFAULT '[]'::jsonb NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isHomepage" boolean DEFAULT false NOT NULL,
    "coverImageAlt" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.portfolios OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 18232)
-- Name: portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.portfolios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolios_id_seq OWNER TO postgres;

--
-- TOC entry 5513 (class 0 OID 0)
-- Dependencies: 236
-- Name: portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;


--
-- TOC entry 221 (class 1259 OID 16402)
-- Name: product_owners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_owners (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_owners OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16401)
-- Name: product_owners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_owners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_owners_id_seq OWNER TO postgres;

--
-- TOC entry 5514 (class 0 OID 0)
-- Dependencies: 220
-- Name: product_owners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_owners_id_seq OWNED BY public.product_owners.id;


--
-- TOC entry 243 (class 1259 OID 22016)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    number text NOT NULL,
    slug text NOT NULL,
    badge text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    image text NOT NULL,
    "imageAlt" text,
    gif text,
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    "portfolioButtonText" text,
    "portfolioButtonLink" text,
    "portfolioButtonNewTab" boolean DEFAULT false NOT NULL,
    "detailButtonText" text,
    "detailButtonLink" text,
    "detailButtonNewTab" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    sections jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 22015)
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- TOC entry 5515 (class 0 OID 0)
-- Dependencies: 242
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- TOC entry 227 (class 1259 OID 16626)
-- Name: testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    image text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "sectionId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "altText" text DEFAULT ''::text NOT NULL,
    company jsonb DEFAULT '{}'::jsonb NOT NULL,
    quote jsonb DEFAULT '{}'::jsonb NOT NULL,
    name jsonb DEFAULT '{}'::jsonb NOT NULL,
    role jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.testimonials OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16625)
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.testimonials_id_seq OWNER TO postgres;

--
-- TOC entry 5516 (class 0 OID 0)
-- Dependencies: 226
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- TOC entry 225 (class 1259 OID 16611)
-- Name: testimonials_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials_sections (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    title jsonb DEFAULT '{}'::jsonb NOT NULL,
    description jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.testimonials_sections OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16610)
-- Name: testimonials_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.testimonials_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.testimonials_sections_id_seq OWNER TO postgres;

--
-- TOC entry 5517 (class 0 OID 0)
-- Dependencies: 224
-- Name: testimonials_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.testimonials_sections_id_seq OWNED BY public.testimonials_sections.id;


--
-- TOC entry 235 (class 1259 OID 17434)
-- Name: vacancy_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vacancy_settings (
    id integer NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    "emailHref" text DEFAULT ''::text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    "phoneHref" text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "backLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "applyTitle" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "aboutRoleLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "skillsLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "responsibleLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "requirementsLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    location jsonb DEFAULT '{}'::jsonb NOT NULL,
    "emailLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "phoneLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "locationLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formCvLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formCvPlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formEmailLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formEmailPlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formMessageLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formMessagePlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formNameLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formNamePlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formPhoneLabel" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formPhonePlaceholder" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "formSubmitLabel" jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.vacancy_settings OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17433)
-- Name: vacancy_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vacancy_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vacancy_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5518 (class 0 OID 0)
-- Dependencies: 234
-- Name: vacancy_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vacancy_settings_id_seq OWNED BY public.vacancy_settings.id;


--
-- TOC entry 275 (class 1259 OID 38281)
-- Name: vacancy_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vacancy_submissions (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    message text,
    "cvUrl" text NOT NULL,
    "vacancyId" integer,
    "vacancyTitle" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.vacancy_submissions OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 38280)
-- Name: vacancy_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vacancy_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vacancy_submissions_id_seq OWNER TO postgres;

--
-- TOC entry 5519 (class 0 OID 0)
-- Dependencies: 274
-- Name: vacancy_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vacancy_submissions_id_seq OWNED BY public.vacancy_submissions.id;


--
-- TOC entry 5024 (class 2604 OID 16825)
-- Name: Vacancy id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vacancy" ALTER COLUMN id SET DEFAULT nextval('public."Vacancy_id_seq"'::regclass);


--
-- TOC entry 5020 (class 2604 OID 16809)
-- Name: VacancyCategory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VacancyCategory" ALTER COLUMN id SET DEFAULT nextval('public."VacancyCategory_id_seq"'::regclass);


--
-- TOC entry 5038 (class 2604 OID 16846)
-- Name: VacancyPageHeader id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VacancyPageHeader" ALTER COLUMN id SET DEFAULT nextval('public."VacancyPageHeader_id_seq"'::regclass);


--
-- TOC entry 5124 (class 2604 OID 33550)
-- Name: about_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.about_settings ALTER COLUMN id SET DEFAULT nextval('public.about_settings_id_seq'::regclass);


--
-- TOC entry 5093 (class 2604 OID 25181)
-- Name: blog_authors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_authors ALTER COLUMN id SET DEFAULT nextval('public.blog_authors_id_seq'::regclass);


--
-- TOC entry 5098 (class 2604 OID 25197)
-- Name: blog_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories ALTER COLUMN id SET DEFAULT nextval('public.blog_categories_id_seq'::regclass);


--
-- TOC entry 5115 (class 2604 OID 26076)
-- Name: blog_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_settings ALTER COLUMN id SET DEFAULT nextval('public.blog_settings_id_seq'::regclass);


--
-- TOC entry 5101 (class 2604 OID 25214)
-- Name: blogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs ALTER COLUMN id SET DEFAULT nextval('public.blogs_id_seq'::regclass);


--
-- TOC entry 5197 (class 2604 OID 36792)
-- Name: contact_budget_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_budget_options ALTER COLUMN id SET DEFAULT nextval('public.contact_budget_options_id_seq'::regclass);


--
-- TOC entry 5167 (class 2604 OID 36717)
-- Name: contact_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_settings ALTER COLUMN id SET DEFAULT nextval('public.contact_settings_id_seq'::regclass);


--
-- TOC entry 5194 (class 2604 OID 36776)
-- Name: contact_social_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_social_links ALTER COLUMN id SET DEFAULT nextval('public.contact_social_links_id_seq'::regclass);


--
-- TOC entry 5203 (class 2604 OID 36820)
-- Name: contact_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_submissions ALTER COLUMN id SET DEFAULT nextval('public.contact_submissions_id_seq'::regclass);


--
-- TOC entry 5200 (class 2604 OID 36806)
-- Name: contact_timeline_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_timeline_options ALTER COLUMN id SET DEFAULT nextval('public.contact_timeline_options_id_seq'::regclass);


--
-- TOC entry 5002 (class 2604 OID 16455)
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- TOC entry 5157 (class 2604 OID 35532)
-- Name: footer_nav_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_nav_links ALTER COLUMN id SET DEFAULT nextval('public.footer_nav_links_id_seq'::regclass);


--
-- TOC entry 5145 (class 2604 OID 35499)
-- Name: footer_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_settings ALTER COLUMN id SET DEFAULT nextval('public.footer_settings_id_seq'::regclass);


--
-- TOC entry 5163 (class 2604 OID 35554)
-- Name: footer_social_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_social_links ALTER COLUMN id SET DEFAULT nextval('public.footer_social_links_id_seq'::regclass);


--
-- TOC entry 5139 (class 2604 OID 34462)
-- Name: nav_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nav_links ALTER COLUMN id SET DEFAULT nextval('public.nav_links_id_seq'::regclass);


--
-- TOC entry 5134 (class 2604 OID 34443)
-- Name: navbar_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.navbar_settings ALTER COLUMN id SET DEFAULT nextval('public.navbar_settings_id_seq'::regclass);


--
-- TOC entry 5075 (class 2604 OID 20903)
-- Name: partner_sections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_sections ALTER COLUMN id SET DEFAULT nextval('public.partner_sections_id_seq'::regclass);


--
-- TOC entry 5079 (class 2604 OID 20922)
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.partners_id_seq'::regclass);


--
-- TOC entry 5068 (class 2604 OID 18236)
-- Name: portfolios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);


--
-- TOC entry 5000 (class 2604 OID 16405)
-- Name: product_owners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_owners ALTER COLUMN id SET DEFAULT nextval('public.product_owners_id_seq'::regclass);


--
-- TOC entry 5085 (class 2604 OID 22019)
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- TOC entry 5012 (class 2604 OID 16629)
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- TOC entry 5008 (class 2604 OID 16614)
-- Name: testimonials_sections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials_sections ALTER COLUMN id SET DEFAULT nextval('public.testimonials_sections_id_seq'::regclass);


--
-- TOC entry 5041 (class 2604 OID 17437)
-- Name: vacancy_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancy_settings ALTER COLUMN id SET DEFAULT nextval('public.vacancy_settings_id_seq'::regclass);


--
-- TOC entry 5205 (class 2604 OID 38284)
-- Name: vacancy_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancy_submissions ALTER COLUMN id SET DEFAULT nextval('public.vacancy_submissions_id_seq'::regclass);


--
-- TOC entry 5442 (class 0 OID 16822)
-- Dependencies: 231
-- Data for Name: Vacancy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Vacancy" (id, "isNew", "isVisible", "order", "categoryId", "createdAt", "updatedAt", "closingDate", "isDateVisible", "requirementsType", "responsibleType", "isStartDateVisible", "startDate", slug, title, tags, "aboutRole", "newLabel", requirements, responsible, skills) FROM stdin;
7	t	t	0	6	2026-05-21 06:55:33.835	2026-06-10 10:26:21.111	\N	f	BULLET	BULLET	t	2026-05-11 00:00:00	senior-designer-az	{"az": "Senior Designer az", "en": "Senior Designer en", "ru": "Senior Designer ru"}	[{"az": "smm", "en": "", "ru": ""}, {"az": "full time", "en": "", "ru": ""}]	null	{"az": "NEW", "en": "", "ru": ""}	[]	[]	[]
8	t	t	0	4	2026-05-21 06:56:45.662	2026-06-10 10:26:48.234	2026-06-25 00:00:00	t	BULLET	BULLET	t	2026-05-24 00:00:00	smm	{"az": "SMM"}	[{"az": "smm", "en": "", "ru": ""}, {"az": "smm", "en": "", "ru": ""}]	null	{"az": "TEZ", "en": "", "ru": ""}	[]	[]	[]
6	f	t	0	6	2026-05-21 06:54:48.895	2026-06-10 10:27:23.265	2024-06-15 00:00:00	t	BULLET	BULLET	t	2026-05-06 00:00:00	graphic-designer-az	{"az": "Graphic designer az", "en": "Graphic designer en", "ru": "Graphic designer ru"}	[{"az": "lojyuhtgr", "en": "", "ru": ""}, {"az": "ijyuhtgrfe", "en": "", "ru": ""}, {"az": "ijuhyt", "en": "", "ru": ""}, {"az": "kijuhyt", "en": "", "ru": ""}]	null	null	[]	[]	[]
\.


--
-- TOC entry 5440 (class 0 OID 16806)
-- Dependencies: 229
-- Data for Name: VacancyCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VacancyCategory" (id, "order", "createdAt", "updatedAt", name) FROM stdin;
4	0	2026-05-19 14:35:34.723	2026-06-10 10:24:43.796	{"az": "SMM"}
1	1	2026-05-19 14:30:13.109	2026-06-10 10:24:51.914	{"az": "Motion"}
5	2	2026-05-19 14:35:51.355	2026-06-10 10:25:02.66	{"az": "UX/UI"}
6	3	2026-05-19 14:41:21.931	2026-06-10 10:25:14.114	{"az": "Graphic Designer"}
\.


--
-- TOC entry 5444 (class 0 OID 16843)
-- Dependencies: 233
-- Data for Name: VacancyPageHeader; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VacancyPageHeader" (id, "createdAt", "updatedAt", title) FROM stdin;
1	2026-05-20 05:08:43.571	2026-06-10 10:24:36.329	{"az": "Vakansiyalar"}
\.


--
-- TOC entry 5430 (class 0 OID 16387)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4b6a8847-1461-4717-81d9-265be1852cea	43def9d77125ac349ce5171c4d5731459d3d5667166fa6bfc69c5e01e4ea7f13	2026-06-01 11:47:34.539383+04	20260601074734_add_author_avatar_alt_linkedin_icon	\N	\N	2026-06-01 11:47:34.537456+04	1
49c6f77c-11b2-414a-ac90-d29ff124f74e	195c7335b6f95871135798774c61b231b55ebaf0c5636d74f9170b09dbf02fff	2026-05-19 12:04:57.554057+04	20260519080457_init	\N	\N	2026-05-19 12:04:57.54389+04	1
2118045c-1117-42ae-ba05-64bc426fedeb	93d1599a0db6976a5d87b7f0562732320a502d78ee7df45dd7664cfa85f3b4a2	2026-05-21 14:24:39.590641+04	20260521102439_add_partners	\N	\N	2026-05-21 14:24:39.569136+04	1
53d20bdd-7d87-4fd3-b4c7-171cec161a66	e749537c04b7cac74d6d2fcbd9495d3e303937512f3c20e23e56a369370fa642	2026-05-19 14:38:56.991469+04	20260519103856_add_faq	\N	\N	2026-05-19 14:38:56.978947+04	1
45c22554-9d1a-4d96-b7c5-fcb5d0fe92f4	5aba05b76206330baacd522823c7824fa3cdb436bfa35a31837cb93bc07b094c	2026-05-19 15:16:25.18533+04	20260519111625_add_faq_order	\N	\N	2026-05-19 15:16:25.18124+04	1
cf33b258-3fdc-40b0-8d7a-bd33095d60ec	d010af216941a505ae0375d0ba71366ee6aff9c165451b3e4f1fbe0238dfaf62	2026-05-19 15:34:31.365965+04	20260519113431_add_testimonials	\N	\N	2026-05-19 15:34:31.355377+04	1
dada92e6-d38a-4b55-bc41-93e71b20c869	d63104ebf38330ecc817c215bed00ef6bad89007b1b1c7ce00dda98dbadb3f1e	2026-05-21 15:17:22.510898+04	20260521111722_add_partners_is_visible	\N	\N	2026-05-21 15:17:22.507495+04	1
e0db68cb-88d3-4570-a9c8-6dae1a106af5	944336d6fb05193525bcde6a470d4bee735e78a1323adfac23fe0f0547d57e69	2026-05-19 18:09:30.30871+04	20260519140930_add_vacancy_modules	\N	\N	2026-05-19 18:09:30.296922+04	1
15c76db0-dde3-4a7f-8266-2d75346c97ff	5956b3187fcc516bd4361c25ce4a915146ada446ab99ec967fe3143c43acf61c	2026-05-20 09:59:22.439426+04	20260520055922_vacancy_full	\N	\N	2026-05-20 09:59:22.430484+04	1
8b972901-9f64-4311-aa1a-4e4db2448f09	651f5d9f49e65a0d4005057be39e6837dcc97a7673a62dc9015925a415f93346	2026-05-20 11:36:41.60183+04	20260520073641_add_vacancy_settings	\N	\N	2026-05-20 11:36:41.590642+04	1
e16ddcd4-faf4-4a53-9ece-6f1eaa878605	22f4f9bb2a2aeac633c06100d82ee16cccdd6e3bb2e7839e7cbf40a529bdf398	2026-05-22 10:32:27.71208+04	20260522063227_add_service	\N	\N	2026-05-22 10:32:27.702599+04	1
3f7b3a7a-528f-46d0-b085-21a577d7cd8d	24aae68e17954781f3bf58439b31f88e43d205c012699fd032884a853439390c	2026-05-20 12:32:28.528772+04	20260520083228_add_vacancy_start_date	\N	\N	2026-05-20 12:32:28.525668+04	1
353ce7ad-d410-4cb1-bae9-52ec6ac034d6	ebb081eb825d4befb53eb9e7023e7ef932d4df94361fbde637ebe9fb07adf065	2026-05-20 13:49:13.786272+04	20260520094913_add_portfolio	\N	\N	2026-05-20 13:49:13.778626+04	1
6b36feee-5e61-4bd2-879d-ad23483e9b82	70d4eea3e42ca19cb0270f4039403755d421bf93ef213b7110bf15c94b29246c	2026-06-01 12:40:56.082249+04	20260601084056_add_author_detail_placements	\N	\N	2026-06-01 12:40:56.078542+04	1
78f667e7-4201-4fa6-91f5-77495095c112	6a26ab0801e5510fff4e4bb0c55aaa2fa1cd1d14f3f2ad0866c4dfcaf151bef8	2026-05-20 17:53:48.060721+04	20260520135348_add_is_homepage	\N	\N	2026-05-20 17:53:48.05343+04	1
c06e883a-b622-451d-bc93-72c394e17276	828cbe50ed0b8c63166d4bcd159591063ef3c93753208faabb87f8e853b3861c	2026-05-25 10:55:01.890242+04	20260525065501_add_blog	\N	\N	2026-05-25 10:55:01.873795+04	1
5fb2316f-2510-4998-8e06-77d390a0a047	d90dac0aaa75b998d273d8164b796288fe41bde2ac926dbf783152d9031f7993	2026-05-21 10:40:08.768343+04	20260521064008_add_vacancy_slug	\N	\N	2026-05-21 10:40:08.760611+04	1
c2ac4124-9c63-4151-9554-5f0010735c47	7cd117df3798e4b9aca01c394a9ddecc8c5e3ffc3f49455577eacc684bedb507	2026-05-21 11:23:15.886974+04	20260521072315_add_alt_text_to_testimonial	\N	\N	2026-05-21 11:23:15.884183+04	1
9f859ec7-c010-434b-ab17-1b2dbc4c46dc	05d6ce01fc98647d57513da05d6ee07852e49602022698550835ce43520d76fc	2026-05-21 11:59:32.080994+04	20260521075932_add_cover_image_alt	\N	\N	2026-05-21 11:59:32.073619+04	1
6df61b3f-b7e1-4053-99e9-995b0bb9a3df	6afb296d0b02e55120e1ea5a15db302d8d7d4d2bbe9c0ed9e43dc18a02243728	2026-05-26 11:24:36.923089+04	20260526072436_add_blog_settings	\N	\N	2026-05-26 11:24:36.915242+04	1
6f7370c1-8a88-43cf-a61b-0c6385abcfd4	24cea092fb6c9f23386faa088b5995508068a8f67ec143d9560b35d11e0fa3ee	2026-06-09 10:45:53.286625+04	20260609064553_add_vacancy_apply_now	\N	\N	2026-06-09 10:45:53.272652+04	1
bc813746-d9f9-4562-9c74-be3fc632a629	f8904afcfdec1874016c693817464feaa84557faa78069c16fb7ac450c323645	2026-05-26 11:48:13.081485+04	20260526074813_add_button_new_tab	\N	\N	2026-05-26 11:48:13.079041+04	1
7de7be9b-b562-43c9-9c5e-4afc0f582447	3ea02e98187ee15531f7c93d2afb86d7716cad3cb9876fc0f8f011f3b071279f	2026-06-02 15:16:33.533925+04	20260602111633_add_is_home_visible	\N	\N	2026-06-02 15:16:33.530593+04	1
f01c7b29-1fcb-4ac2-9822-e578fd8ea446	661453f907a903a4b37958c107619c8018940705a03d6af4031a5dd3de088539	2026-06-01 10:34:17.428632+04	20260601063417_add_author_fields	\N	\N	2026-06-01 10:34:17.426361+04	1
c29b6f04-6948-464f-b826-0fc12e981335	5f1ffe1260b57b4645a5bc165dc68861937d67f632b6203689e1d36815fa1320	2026-06-01 10:50:52.438095+04	20260601065052_add_author_fields_slug	\N	\N	2026-06-01 10:50:52.432414+04	1
85f9462f-ab71-4bb1-888b-ae7bfb6aab5e	db8f8c4ee745639cd6e5a202c7ae3c7ec0a1615d00818dfea78dc0ded5a46799	2026-06-03 12:08:48.836677+04	20260603080848_add_navbar_settings	\N	\N	2026-06-03 12:08:48.824429+04	1
4177aeb8-5c20-4165-bfec-1c90b514f683	7a9063bb031733aa9ab1b86ebbf4f258ecffaba2b29195ea08d8f4dd7a27afe6	2026-06-02 15:56:14.458248+04	20260602115614_add_author_list_pinned_at	\N	\N	2026-06-02 15:56:14.455863+04	1
b24db972-b565-41b3-9d52-e1d742184aab	9578fe0dd83960cea8ab8585c2f4c27f5f6d54c0178bd4ff8bdad375533a70a8	2026-06-03 10:25:57.020881+04	20260603062556_add_author_team_fields	\N	\N	2026-06-03 10:25:57.013902+04	1
a5c855d8-4aaa-491d-81c7-40a14a88f20a	14135d992f9daf51e597a76e9890d0fe8b3cdab947f62ebc22aedc1753f57a11	2026-06-05 14:19:06.056122+04	20260605101906_add_footer_settings	\N	\N	2026-06-05 14:19:06.042853+04	1
29c7b46d-69b4-481d-a8a6-6c1f3d8ffb24	b1ed7f36880594fb9b9f10c025580bd7b9f96d145336f8e028abcd4a857c075d	2026-06-03 11:06:41.410602+04	20260603070641_add_about_settings	\N	\N	2026-06-03 11:06:41.403718+04	1
43f73aab-659e-4af0-98e3-0c8310ecedbc	1531edbd9bbcfd95fd1212590410f9527c1435e5ada613bef1fb5bf416c91736	2026-06-08 10:33:44.976705+04	20260608063344_add_contact_settings	\N	\N	2026-06-08 10:33:44.934004+04	1
ea888fff-08e8-4db3-a631-08abb88417be	b8281000406b8b6fa105e514143a5b04ddd39731eb7ee5c1f98d21625a3388a6	2026-06-10 11:23:08.112868+04	20260610072308_navbar_localizee	\N	\N	2026-06-10 11:23:08.110914+04	1
49e847e8-5e4c-42d1-8c3b-90c4399d6cc5	22266d0f682dea69186ceaf3e8e85915ae8fdd6f1e0680dc28e88fdd0cabce35	2026-06-10 10:32:29.540092+04	20260610063229_contact_i18n	\N	\N	2026-06-10 10:32:29.527233+04	1
25986a17-c5eb-497e-969a-a9c3e94367b4	e9fb75b086e9e4e78f5abafeaa2e2924e996db625df5e0f29157e13cc88749a0	2026-06-10 11:16:40.875855+04	20260610071640_navbar_localize	\N	\N	2026-06-10 11:16:40.871493+04	1
c3b15d02-914e-47bf-bb03-56efa0d84845	4c3dc247a1c8d00779f20f1f489d7d1153072715141a5fc42534ec4b34383993	2026-06-10 11:03:41.446568+04	20260610070341_faq_localize	\N	\N	2026-06-10 11:03:41.442772+04	1
db5aaa38-9132-4bfd-9c15-8db6f7be4901	91b7ab0f1373f13a8ed82c399020e312ad5e94f57a006649ef246e53ac420646	2026-06-10 11:34:28.314259+04	20260610073428_footer_localize	\N	\N	2026-06-10 11:34:28.307668+04	1
ab67ecf6-ae15-4654-a88c-47dbadbda6ce	788836a1009160e4e11023d48c1fea81418a01b32d81b708e73a6d970941a259	2026-06-10 12:12:59.839612+04	20260610081259_aboutus_localize	\N	\N	2026-06-10 12:12:59.834489+04	1
7c2d0db0-3825-4329-b3c3-6d29a8adafa9	7f6b51b0668f849bbd4c4f8b4e5e1b74773b5ce626387c065b7745ab6cad65bb	2026-06-10 12:53:59.548097+04	20260610085359_vacancy_localize	\N	\N	2026-06-10 12:53:59.533492+04	1
\.


--
-- TOC entry 5464 (class 0 OID 33547)
-- Dependencies: 253
-- Data for Name: about_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.about_settings (id, "heroImage", "heroParagraphs", "storyBlocks", "teamCtaHref", "createdAt", "updatedAt", "heroImageAlt", "heroBadge", "heroTitle", "teamTitle", "teamDescription", "teamCtaLabel") FROM stdin;
1	/uploads/about/1780471008353-440767179.webp	[{"0": "<", "1": "p", "2": ">", "3": "B", "4": "i", "5": "z", "6": " ", "7": "t", "8": "i", "9": "p", "10": "i", "11": "k", "12": " ", "13": "b", "14": "i", "15": "r", "16": " ", "17": "m", "18": "a", "19": "r", "20": "k", "21": "e", "22": "t", "23": "i", "24": "n", "25": "q", "26": " ", "27": "ş", "28": "i", "29": "r", "30": "k", "31": "ə", "32": "t", "33": "i", "34": " ", "35": "d", "36": "e", "37": "y", "38": "i", "39": "l", "40": "i", "41": "k", "42": "!", "43": " ", "44": "B", "45": "i", "46": "r", "47": " ", "48": "ç", "49": "o", "50": "x", "51": " ", "52": "b", "53": "r", "54": "e", "55": "n", "56": "d", "57": "l", "58": "ə", "59": "r", "60": " ", "61": "t", "62": "r", "63": "e", "64": "n", "65": "d", "66": "l", "67": "ə", "68": "r", "69": "i", "70": " ", "71": "i", "72": "z", "73": "l", "74": "ə", "75": "m", "76": "ə", "77": "y", "78": "ə", "79": " ", "80": "ç", "81": "a", "82": "l", "83": "ı", "84": "ş", "85": "d", "86": "ı", "87": "ğ", "88": "ı", "89": " ", "90": "z", "91": "a", "92": "m", "93": "a", "94": "n", "95": ",", "96": "&", "97": "n", "98": "b", "99": "s", "az": "<p></p><p>Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman,&nbsp;biz sizə trendi yaratmağa kömək edəcəyik.<br><br>Komandamız dizayn, rəqəmsal media reklam və marketinqin müxtəlif sahələrində hərtərəfli istedadlı peşəkarlardan ibarətdir. <strong>Strategiyamızın daim təkmilləşdirilməsi və innovasiyası sayəsində biz brendlərə yaradıcı yanaşma vasitəsilə diqqətin cəlb edilməsində köməklik göstərməkdə lider olduq.</strong> Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman,&nbsp;biz sizə trendi yaratmağa kömək edəcəyik.<br>Komandamız dizayn, rəqəmsal media reklam və marketinqin müxtəlif sahələrində hərtərəfli istedadlı peşəkarlardan ibarətdir. Strategiyamızın daim təkmilləşdirilməsi və innovasiyası sayəsində biz brendlərə yaradıcı yanaşma vasitəsilə diqqətin cəlb edilməsində köməklik göstərməkdə lider olduq.</p>", "100": "p", "101": ";", "102": "b", "103": "i", "104": "z", "105": " ", "106": "s", "107": "i", "108": "z", "109": "ə", "110": " ", "111": "t", "112": "r", "113": "e", "114": "n", "115": "d", "116": "i", "117": " ", "118": "y", "119": "a", "120": "r", "121": "a", "122": "t", "123": "m", "124": "a", "125": "ğ", "126": "a", "127": " ", "128": "k", "129": "ö", "130": "m", "131": "ə", "132": "k", "133": " ", "134": "e", "135": "d", "136": "ə", "137": "c", "138": "ə", "139": "y", "140": "i", "141": "k", "142": ".", "143": "<", "144": "b", "145": "r", "146": ">", "147": "<", "148": "b", "149": "r", "150": ">", "151": "K", "152": "o", "153": "m", "154": "a", "155": "n", "156": "d", "157": "a", "158": "m", "159": "ı", "160": "z", "161": " ", "162": "d", "163": "i", "164": "z", "165": "a", "166": "y", "167": "n", "168": ",", "169": " ", "170": "r", "171": "ə", "172": "q", "173": "ə", "174": "m", "175": "s", "176": "a", "177": "l", "178": " ", "179": "m", "180": "e", "181": "d", "182": "i", "183": "a", "184": " ", "185": "r", "186": "e", "187": "k", "188": "l", "189": "a", "190": "m", "191": " ", "192": "v", "193": "ə", "194": " ", "195": "m", "196": "a", "197": "r", "198": "k", "199": "e", "200": "t", "201": "i", "202": "n", "203": "q", "204": "i", "205": "n", "206": " ", "207": "m", "208": "ü", "209": "x", "210": "t", "211": "ə", "212": "l", "213": "i", "214": "f", "215": " ", "216": "s", "217": "a", "218": "h", "219": "ə", "220": "l", "221": "ə", "222": "r", "223": "i", "224": "n", "225": "d", "226": "ə", "227": " ", "228": "h", "229": "ə", "230": "r", "231": "t", "232": "ə", "233": "r", "234": "ə", "235": "f", "236": "l", "237": "i", "238": " ", "239": "i", "240": "s", "241": "t", "242": "e", "243": "d", "244": "a", "245": "d", "246": "l", "247": "ı", "248": " ", "249": "p", "250": "e", "251": "ş", "252": "ə", "253": "k", "254": "a", "255": "r", "256": "l", "257": "a", "258": "r", "259": "d", "260": "a", "261": "n", "262": " ", "263": "i", "264": "b", "265": "a", "266": "r", "267": "ə", "268": "t", "269": "d", "270": "i", "271": "r", "272": ".", "273": " ", "274": "<", "275": "s", "276": "t", "277": "r", "278": "o", "279": "n", "280": "g", "281": ">", "282": "S", "283": "t", "284": "r", "285": "a", "286": "t", "287": "e", "288": "g", "289": "i", "290": "y", "291": "a", "292": "m", "293": "ı", "294": "z", "295": "ı", "296": "n", "297": " ", "298": "d", "299": "a", "300": "i", "301": "m", "302": " ", "303": "t", "304": "ə", "305": "k", "306": "m", "307": "i", "308": "l", "309": "l", "310": "ə", "311": "ş", "312": "d", "313": "i", "314": "r", "315": "i", "316": "l", "317": "m", "318": "ə", "319": "s", "320": "i", "321": " ", "322": "v", "323": "ə", "324": " ", "325": "i", "326": "n", "327": "n", "328": "o", "329": "v", "330": "a", "331": "s", "332": "i", "333": "y", "334": "a", "335": "s", "336": "ı", "337": " ", "338": "s", "339": "a", "340": "y", "341": "ə", "342": "s", "343": "i", "344": "n", "345": "d", "346": "ə", "347": " ", "348": "b", "349": "i", "350": "z", "351": " ", "352": "b", "353": "r", "354": "e", "355": "n", "356": "d", "357": "l", "358": "ə", "359": "r", "360": "ə", "361": " ", "362": "y", "363": "a", "364": "r", "365": "a", "366": "d", "367": "ı", "368": "c", "369": "ı", "370": " ", "371": "y", "372": "a", "373": "n", "374": "a", "375": "ş", "376": "m", "377": "a", "378": " ", "379": "v", "380": "a", "381": "s", "382": "i", "383": "t", "384": "ə", "385": "s", "386": "i", "387": "l", "388": "ə", "389": " ", "390": "d", "391": "i", "392": "q", "393": "q", "394": "ə", "395": "t", "396": "i", "397": "n", "398": " ", "399": "c", "400": "ə", "401": "l", "402": "b", "403": " ", "404": "e", "405": "d", "406": "i", "407": "l", "408": "m", "409": "ə", "410": "s", "411": "i", "412": "n", "413": "d", "414": "ə", "415": " ", "416": "k", "417": "ö", "418": "m", "419": "ə", "420": "k", "421": "l", "422": "i", "423": "k", "424": " ", "425": "g", "426": "ö", "427": "s", "428": "t", "429": "ə", "430": "r", "431": "m", "432": "ə", "433": "k", "434": "d", "435": "ə", "436": " ", "437": "l", "438": "i", "439": "d", "440": "e", "441": "r", "442": " ", "443": "o", "444": "l", "445": "d", "446": "u", "447": "q", "448": ".", "449": "<", "450": "/", "451": "s", "452": "t", "453": "r", "454": "o", "455": "n", "456": "g", "457": ">", "458": " ", "459": "B", "460": "i", "461": "z", "462": " ", "463": "t", "464": "i", "465": "p", "466": "i", "467": "k", "468": " ", "469": "b", "470": "i", "471": "r", "472": " ", "473": "m", "474": "a", "475": "r", "476": "k", "477": "e", "478": "t", "479": "i", "480": "n", "481": "q", "482": " ", "483": "ş", "484": "i", "485": "r", "486": "k", "487": "ə", "488": "t", "489": "i", "490": " ", "491": "d", "492": "e", "493": "y", "494": "i", "495": "l", "496": "i", "497": "k", "498": "!", "499": " ", "500": "B", "501": "i", "502": "r", "503": " ", "504": "ç", "505": "o", "506": "x", "507": " ", "508": "b", "509": "r", "510": "e", "511": "n", "512": "d", "513": "l", "514": "ə", "515": "r", "516": " ", "517": "t", "518": "r", "519": "e", "520": "n", "521": "d", "522": "l", "523": "ə", "524": "r", "525": "i", "526": " ", "527": "i", "528": "z", "529": "l", "530": "ə", "531": "m", "532": "ə", "533": "y", "534": "ə", "535": " ", "536": "ç", "537": "a", "538": "l", "539": "ı", "540": "ş", "541": "d", "542": "ı", "543": "ğ", "544": "ı", "545": " ", "546": "z", "547": "a", "548": "m", "549": "a", "550": "n", "551": ",", "552": "&", "553": "n", "554": "b", "555": "s", "556": "p", "557": ";", "558": "b", "559": "i", "560": "z", "561": " ", "562": "s", "563": "i", "564": "z", "565": "ə", "566": " ", "567": "t", "568": "r", "569": "e", "570": "n", "571": "d", "572": "i", "573": " ", "574": "y", "575": "a", "576": "r", "577": "a", "578": "t", "579": "m", "580": "a", "581": "ğ", "582": "a", "583": " ", "584": "k", "585": "ö", "586": "m", "587": "ə", "588": "k", "589": " ", "590": "e", "591": "d", "592": "ə", "593": "c", "594": "ə", "595": "y", "596": "i", "597": "k", "598": ".", "599": "<", "600": "b", "601": "r", "602": ">", "603": "K", "604": "o", "605": "m", "606": "a", "607": "n", "608": "d", "609": "a", "610": "m", "611": "ı", "612": "z", "613": " ", "614": "d", "615": "i", "616": "z", "617": "a", "618": "y", "619": "n", "620": ",", "621": " ", "622": "r", "623": "ə", "624": "q", "625": "ə", "626": "m", "627": "s", "628": "a", "629": "l", "630": " ", "631": "m", "632": "e", "633": "d", "634": "i", "635": "a", "636": " ", "637": "r", "638": "e", "639": "k", "640": "l", "641": "a", "642": "m", "643": " ", "644": "v", "645": "ə", "646": " ", "647": "m", "648": "a", "649": "r", "650": "k", "651": "e", "652": "t", "653": "i", "654": "n", "655": "q", "656": "i", "657": "n", "658": " ", "659": "m", "660": "ü", "661": "x", "662": "t", "663": "ə", "664": "l", "665": "i", "666": "f", "667": " ", "668": "s", "669": "a", "670": "h", "671": "ə", "672": "l", "673": "ə", "674": "r", "675": "i", "676": "n", "677": "d", "678": "ə", "679": " ", "680": "h", "681": "ə", "682": "r", "683": "t", "684": "ə", "685": "r", "686": "ə", "687": "f", "688": "l", "689": "i", "690": " ", "691": "i", "692": "s", "693": "t", "694": "e", "695": "d", "696": "a", "697": "d", "698": "l", "699": "ı", "700": " ", "701": "p", "702": "e", "703": "ş", "704": "ə", "705": "k", "706": "a", "707": "r", "708": "l", "709": "a", "710": "r", "711": "d", "712": "a", "713": "n", "714": " ", "715": "i", "716": "b", "717": "a", "718": "r", "719": "ə", "720": "t", "721": "d", "722": "i", "723": "r", "724": ".", "725": " ", "726": "S", "727": "t", "728": "r", "729": "a", "730": "t", "731": "e", "732": "g", "733": "i", "734": "y", "735": "a", "736": "m", "737": "ı", "738": "z", "739": "ı", "740": "n", "741": " ", "742": "d", "743": "a", "744": "i", "745": "m", "746": " ", "747": "t", "748": "ə", "749": "k", "750": "m", "751": "i", "752": "l", "753": "l", "754": "ə", "755": "ş", "756": "d", "757": "i", "758": "r", "759": "i", "760": "l", "761": "m", "762": "ə", "763": "s", "764": "i", "765": " ", "766": "v", "767": "ə", "768": " ", "769": "i", "770": "n", "771": "n", "772": "o", "773": "v", "774": "a", "775": "s", "776": "i", "777": "y", "778": "a", "779": "s", "780": "ı", "781": " ", "782": "s", "783": "a", "784": "y", "785": "ə", "786": "s", "787": "i", "788": "n", "789": "d", "790": "ə", "791": " ", "792": "b", "793": "i", "794": "z", "795": " ", "796": "b", "797": "r", "798": "e", "799": "n", "800": "d", "801": "l", "802": "ə", "803": "r", "804": "ə", "805": " ", "806": "y", "807": "a", "808": "r", "809": "a", "810": "d", "811": "ı", "812": "c", "813": "ı", "814": " ", "815": "y", "816": "a", "817": "n", "818": "a", "819": "ş", "820": "m", "821": "a", "822": " ", "823": "v", "824": "a", "825": "s", "826": "i", "827": "t", "828": "ə", "829": "s", "830": "i", "831": "l", "832": "ə", "833": " ", "834": "d", "835": "i", "836": "q", "837": "q", "838": "ə", "839": "t", "840": "i", "841": "n", "842": " ", "843": "c", "844": "ə", "845": "l", "846": "b", "847": " ", "848": "e", "849": "d", "850": "i", "851": "l", "852": "m", "853": "ə", "854": "s", "855": "i", "856": "n", "857": "d", "858": "ə", "859": " ", "860": "k", "861": "ö", "862": "m", "863": "ə", "864": "k", "865": "l", "866": "i", "867": "k", "868": " ", "869": "g", "870": "ö", "871": "s", "872": "t", "873": "ə", "874": "r", "875": "m", "876": "ə", "877": "k", "878": "d", "879": "ə", "880": " ", "881": "l", "882": "i", "883": "d", "884": "e", "885": "r", "886": " ", "887": "o", "888": "l", "889": "d", "890": "u", "891": "q", "892": ".", "893": "<", "894": "/", "895": "p", "896": ">", "897": "<", "898": "p", "899": ">", "900": "<", "901": "/", "902": "p", "903": ">"}]	[{"image": "/uploads/about/1780471251939-741090159.webp", "title": {"0": "K", "1": "o", "2": "m", "3": "a", "4": "n", "5": "d", "6": "a", "7": "m", "8": "ı", "9": "z", "10": " ", "11": "d", "12": "i", "13": "z", "14": "a", "15": "y", "16": "n", "17": ",", "18": " ", "19": "r", "20": "ə", "21": "q", "22": "ə", "23": "m", "24": "s", "25": "a", "26": "l", "27": " ", "28": "m", "29": "e", "30": "d", "31": "i", "32": "a", "33": ".", "az": "Komandamız dizayn, rəqəmsal media."}, "imageAlt": "altimagegeropageblabla", "paragraphs": [{"0": "<", "1": "p", "2": ">", "3": "Y", "4": "o", "5": "u", "6": "n", "7": "g", "8": " ", "9": "L", "10": "i", "11": "o", "12": "n", "13": "s", "14": " ", "15": "A", "16": "z", "17": "e", "18": "r", "19": "b", "20": "a", "21": "i", "22": "j", "23": "a", "24": "n", "25": " ", "26": "3", "27": "0", "28": " ", "29": "y", "30": "a", "31": "ş", "32": "a", "33": "d", "34": "ə", "35": "k", "36": " ", "37": "y", "38": "a", "39": "r", "40": "a", "41": "d", "42": "ı", "43": "c", "44": "ı", "45": ",", "46": " ", "47": "m", "48": "e", "49": "d", "50": "i", "51": "a", "52": " ", "53": "v", "54": "ə", "55": " ", "56": "m", "57": "a", "58": "r", "59": "k", "60": "e", "61": "t", "62": "i", "63": "n", "64": "q", "65": " ", "66": "m", "67": "ü", "68": "t", "69": "ə", "70": "x", "71": "ə", "72": "s", "73": "s", "74": "i", "75": "s", "76": "l", "77": "ə", "78": "r", "79": "i", "80": " ", "81": "ü", "82": "ç", "83": "ü", "84": "n", "85": " ", "86": "n", "87": "ə", "88": "z", "89": "ə", "90": "r", "91": "d", "92": "ə", "93": " ", "94": "t", "95": "u", "96": "t", "97": "u", "98": "l", "99": "m", "az": "<p>Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq “Young Lions” proqramının Azərbaycan üzrə rəsmi seçim mərhələsidir. Bu proqram dünyanın ən nüfuzlu yaradıcılıq tədbirlərindən biri olan Cannes Lions International Festival of Creativity çərçivəsində keçirilir və gənc mütəxəssislərə öz ölkələrini beynəlxalq səviyyədə təmsil etmək imkanı yaradır. Azərbaycan bu proqramda 2022-ci ildən etibarən rəsmi şəkildə iştirak edir. Bu müddət ərzində Young Lions Azerbaijan ölkədə yaradıcı sənayenin inkişafına töhfə verən, yeni nəsil kreativlərin formalaşmasına xidmət edən mühüm platformaya çevrilib.<br><br>Young Lions Azerbaijan artıq 3 ildir ki, ölkəmizdə keçirilir. İlk dəfə yerli mərhələnin təşkili ilə Azərbaycan beynəlxalq Young Lions şəbəkəsinə qoşulub. Sonrakı illərdə yarışmaya maraq artıb və hər il daha çox komanda qeydiyyatdan keçib.<br>Bu artım həm yerli kreativ sənayenin inkişafını, həm də gənc mütəxəssislərin beynəlxalq platformalara çıxışa olan marağını göstərir.</p>", "en": "<p>Young Lions Azerbaijan is the official selection stage for Azerbaijan of the international “Young Lions” program, designed for creative, media and marketing professionals under the age of 30. This program is held within the framework of the Cannes Lions International Festival of Creativity, one of the most prestigious creative events in the world, and provides an opportunity for young professionals to represent their country at the international level. Azerbaijan has been officially participating in this program since 2022. During this time, Young Lions Azerbaijan has become an important platform that contributes to the development of the creative industry in the country and serves to form a new generation of creatives.</p><p>Young Lions Azerbaijan has been held in our country for 3 years now. For the first time, Azerbaijan joined the international Young Lions network by organizing a local stage. In subsequent years, interest in the competition has increased and more teams have registered every year.</p><p>This growth shows both the development of the local creative industry and the interest of young professionals in accessing international platforms.</p>", "ru": "<p></p>", "100": "u", "101": "ş", "102": " ", "103": "b", "104": "e", "105": "y", "106": "n", "107": "ə", "108": "l", "109": "x", "110": "a", "111": "l", "112": "q", "113": " ", "114": "“", "115": "Y", "116": "o", "117": "u", "118": "n", "119": "g", "120": " ", "121": "L", "122": "i", "123": "o", "124": "n", "125": "s", "126": "”", "127": " ", "128": "p", "129": "r", "130": "o", "131": "q", "132": "r", "133": "a", "134": "m", "135": "ı", "136": "n", "137": "ı", "138": "n", "139": " ", "140": "A", "141": "z", "142": "ə", "143": "r", "144": "b", "145": "a", "146": "y", "147": "c", "148": "a", "149": "n", "150": " ", "151": "ü", "152": "z", "153": "r", "154": "ə", "155": " ", "156": "r", "157": "ə", "158": "s", "159": "m", "160": "i", "161": " ", "162": "s", "163": "e", "164": "ç", "165": "i", "166": "m", "167": " ", "168": "m", "169": "ə", "170": "r", "171": "h", "172": "ə", "173": "l", "174": "ə", "175": "s", "176": "i", "177": "d", "178": "i", "179": "r", "180": ".", "181": " ", "182": "B", "183": "u", "184": " ", "185": "p", "186": "r", "187": "o", "188": "q", "189": "r", "190": "a", "191": "m", "192": " ", "193": "d", "194": "ü", "195": "n", "196": "y", "197": "a", "198": "n", "199": "ı", "200": "n", "201": " ", "202": "ə", "203": "n", "204": " ", "205": "n", "206": "ü", "207": "f", "208": "u", "209": "z", "210": "l", "211": "u", "212": " ", "213": "y", "214": "a", "215": "r", "216": "a", "217": "d", "218": "ı", "219": "c", "220": "ı", "221": "l", "222": "ı", "223": "q", "224": " ", "225": "t", "226": "ə", "227": "d", "228": "b", "229": "i", "230": "r", "231": "l", "232": "ə", "233": "r", "234": "i", "235": "n", "236": "d", "237": "ə", "238": "n", "239": " ", "240": "b", "241": "i", "242": "r", "243": "i", "244": " ", "245": "o", "246": "l", "247": "a", "248": "n", "249": " ", "250": "C", "251": "a", "252": "n", "253": "n", "254": "e", "255": "s", "256": " ", "257": "L", "258": "i", "259": "o", "260": "n", "261": "s", "262": " ", "263": "I", "264": "n", "265": "t", "266": "e", "267": "r", "268": "n", "269": "a", "270": "t", "271": "i", "272": "o", "273": "n", "274": "a", "275": "l", "276": " ", "277": "F", "278": "e", "279": "s", "280": "t", "281": "i", "282": "v", "283": "a", "284": "l", "285": " ", "286": "o", "287": "f", "288": " ", "289": "C", "290": "r", "291": "e", "292": "a", "293": "t", "294": "i", "295": "v", "296": "i", "297": "t", "298": "y", "299": " ", "300": "ç", "301": "ə", "302": "r", "303": "ç", "304": "i", "305": "v", "306": "ə", "307": "s", "308": "i", "309": "n", "310": "d", "311": "ə", "312": " ", "313": "k", "314": "e", "315": "ç", "316": "i", "317": "r", "318": "i", "319": "l", "320": "i", "321": "r", "322": " ", "323": "v", "324": "ə", "325": " ", "326": "g", "327": "ə", "328": "n", "329": "c", "330": " ", "331": "m", "332": "ü", "333": "t", "334": "ə", "335": "x", "336": "ə", "337": "s", "338": "s", "339": "i", "340": "s", "341": "l", "342": "ə", "343": "r", "344": "ə", "345": " ", "346": "ö", "347": "z", "348": " ", "349": "ö", "350": "l", "351": "k", "352": "ə", "353": "l", "354": "ə", "355": "r", "356": "i", "357": "n", "358": "i", "359": " ", "360": "b", "361": "e", "362": "y", "363": "n", "364": "ə", "365": "l", "366": "x", "367": "a", "368": "l", "369": "q", "370": " ", "371": "s", "372": "ə", "373": "v", "374": "i", "375": "y", "376": "y", "377": "ə", "378": "d", "379": "ə", "380": " ", "381": "t", "382": "ə", "383": "m", "384": "s", "385": "i", "386": "l", "387": " ", "388": "e", "389": "t", "390": "m", "391": "ə", "392": "k", "393": " ", "394": "i", "395": "m", "396": "k", "397": "a", "398": "n", "399": "ı", "400": " ", "401": "y", "402": "a", "403": "r", "404": "a", "405": "d", "406": "ı", "407": "r", "408": ".", "409": " ", "410": "A", "411": "z", "412": "ə", "413": "r", "414": "b", "415": "a", "416": "y", "417": "c", "418": "a", "419": "n", "420": " ", "421": "b", "422": "u", "423": " ", "424": "p", "425": "r", "426": "o", "427": "q", "428": "r", "429": "a", "430": "m", "431": "d", "432": "a", "433": " ", "434": "2", "435": "0", "436": "2", "437": "2", "438": "-", "439": "c", "440": "i", "441": " ", "442": "i", "443": "l", "444": "d", "445": "ə", "446": "n", "447": " ", "448": "e", "449": "t", "450": "i", "451": "b", "452": "a", "453": "r", "454": "ə", "455": "n", "456": " ", "457": "r", "458": "ə", "459": "s", "460": "m", "461": "i", "462": " ", "463": "ş", "464": "ə", "465": "k", "466": "i", "467": "l", "468": "d", "469": "ə", "470": " ", "471": "i", "472": "ş", "473": "t", "474": "i", "475": "r", "476": "a", "477": "k", "478": " ", "479": "e", "480": "d", "481": "i", "482": "r", "483": ".", "484": " ", "485": "B", "486": "u", "487": " ", "488": "m", "489": "ü", "490": "d", "491": "d", "492": "ə", "493": "t", "494": " ", "495": "ə", "496": "r", "497": "z", "498": "i", "499": "n", "500": "d", "501": "ə", "502": " ", "503": "Y", "504": "o", "505": "u", "506": "n", "507": "g", "508": " ", "509": "L", "510": "i", "511": "o", "512": "n", "513": "s", "514": " ", "515": "A", "516": "z", "517": "e", "518": "r", "519": "b", "520": "a", "521": "i", "522": "j", "523": "a", "524": "n", "525": " ", "526": "ö", "527": "l", "528": "k", "529": "ə", "530": "d", "531": "ə", "532": " ", "533": "y", "534": "a", "535": "r", "536": "a", "537": "d", "538": "ı", "539": "c", "540": "ı", "541": " ", "542": "s", "543": "ə", "544": "n", "545": "a", "546": "y", "547": "e", "548": "n", "549": "i", "550": "n", "551": " ", "552": "i", "553": "n", "554": "k", "555": "i", "556": "ş", "557": "a", "558": "f", "559": "ı", "560": "n", "561": "a", "562": " ", "563": "t", "564": "ö", "565": "h", "566": "f", "567": "ə", "568": " ", "569": "v", "570": "e", "571": "r", "572": "ə", "573": "n", "574": ",", "575": " ", "576": "y", "577": "e", "578": "n", "579": "i", "580": " ", "581": "n", "582": "ə", "583": "s", "584": "i", "585": "l", "586": " ", "587": "k", "588": "r", "589": "e", "590": "a", "591": "t", "592": "i", "593": "v", "594": "l", "595": "ə", "596": "r", "597": "i", "598": "n", "599": " ", "600": "f", "601": "o", "602": "r", "603": "m", "604": "a", "605": "l", "606": "a", "607": "ş", "608": "m", "609": "a", "610": "s", "611": "ı", "612": "n", "613": "a", "614": " ", "615": "x", "616": "i", "617": "d", "618": "m", "619": "ə", "620": "t", "621": " ", "622": "e", "623": "d", "624": "ə", "625": "n", "626": " ", "627": "m", "628": "ü", "629": "h", "630": "ü", "631": "m", "632": " ", "633": "p", "634": "l", "635": "a", "636": "t", "637": "f", "638": "o", "639": "r", "640": "m", "641": "a", "642": "y", "643": "a", "644": " ", "645": "ç", "646": "e", "647": "v", "648": "r", "649": "i", "650": "l", "651": "i", "652": "b", "653": ".", "654": "<", "655": "b", "656": "r", "657": ">", "658": "<", "659": "b", "660": "r", "661": ">", "662": "Y", "663": "o", "664": "u", "665": "n", "666": "g", "667": " ", "668": "L", "669": "i", "670": "o", "671": "n", "672": "s", "673": " ", "674": "A", "675": "z", "676": "e", "677": "r", "678": "b", "679": "a", "680": "i", "681": "j", "682": "a", "683": "n", "684": " ", "685": "a", "686": "r", "687": "t", "688": "ı", "689": "q", "690": " ", "691": "3", "692": " ", "693": "i", "694": "l", "695": "d", "696": "i", "697": "r", "698": " ", "699": "k", "700": "i", "701": ",", "702": " ", "703": "ö", "704": "l", "705": "k", "706": "ə", "707": "m", "708": "i", "709": "z", "710": "d", "711": "ə", "712": " ", "713": "k", "714": "e", "715": "ç", "716": "i", "717": "r", "718": "i", "719": "l", "720": "i", "721": "r", "722": ".", "723": " ", "724": "İ", "725": "l", "726": "k", "727": " ", "728": "d", "729": "ə", "730": "f", "731": "ə", "732": " ", "733": "y", "734": "e", "735": "r", "736": "l", "737": "i", "738": " ", "739": "m", "740": "ə", "741": "r", "742": "h", "743": "ə", "744": "l", "745": "ə", "746": "n", "747": "i", "748": "n", "749": " ", "750": "t", "751": "ə", "752": "ş", "753": "k", "754": "i", "755": "l", "756": "i", "757": " ", "758": "i", "759": "l", "760": "ə", "761": " ", "762": "A", "763": "z", "764": "ə", "765": "r", "766": "b", "767": "a", "768": "y", "769": "c", "770": "a", "771": "n", "772": " ", "773": "b", "774": "e", "775": "y", "776": "n", "777": "ə", "778": "l", "779": "x", "780": "a", "781": "l", "782": "q", "783": " ", "784": "Y", "785": "o", "786": "u", "787": "n", "788": "g", "789": " ", "790": "L", "791": "i", "792": "o", "793": "n", "794": "s", "795": " ", "796": "ş", "797": "ə", "798": "b", "799": "ə", "800": "k", "801": "ə", "802": "s", "803": "i", "804": "n", "805": "ə", "806": " ", "807": "q", "808": "o", "809": "ş", "810": "u", "811": "l", "812": "u", "813": "b", "814": ".", "815": " ", "816": "S", "817": "o", "818": "n", "819": "r", "820": "a", "821": "k", "822": "ı", "823": " ", "824": "i", "825": "l", "826": "l", "827": "ə", "828": "r", "829": "d", "830": "ə", "831": " ", "832": "y", "833": "a", "834": "r", "835": "ı", "836": "ş", "837": "m", "838": "a", "839": "y", "840": "a", "841": " ", "842": "m", "843": "a", "844": "r", "845": "a", "846": "q", "847": " ", "848": "a", "849": "r", "850": "t", "851": "ı", "852": "b", "853": " ", "854": "v", "855": "ə", "856": " ", "857": "h", "858": "ə", "859": "r", "860": " ", "861": "i", "862": "l", "863": " ", "864": "d", "865": "a", "866": "h", "867": "a", "868": " ", "869": "ç", "870": "o", "871": "x", "872": " ", "873": "k", "874": "o", "875": "m", "876": "a", "877": "n", "878": "d", "879": "a", "880": " ", "881": "q", "882": "e", "883": "y", "884": "d", "885": "i", "886": "y", "887": "y", "888": "a", "889": "t", "890": "d", "891": "a", "892": "n", "893": " ", "894": "k", "895": "e", "896": "ç", "897": "i", "898": "b", "899": ".", "900": "<", "901": "b", "902": "r", "903": ">", "904": "B", "905": "u", "906": " ", "907": "a", "908": "r", "909": "t", "910": "ı", "911": "m", "912": " ", "913": "h", "914": "ə", "915": "m", "916": " ", "917": "y", "918": "e", "919": "r", "920": "l", "921": "i", "922": " ", "923": "k", "924": "r", "925": "e", "926": "a", "927": "t", "928": "i", "929": "v", "930": " ", "931": "s", "932": "ə", "933": "n", "934": "a", "935": "y", "936": "e", "937": "n", "938": "i", "939": "n", "940": " ", "941": "i", "942": "n", "943": "k", "944": "i", "945": "ş", "946": "a", "947": "f", "948": "ı", "949": "n", "950": "ı", "951": ",", "952": " ", "953": "h", "954": "ə", "955": "m", "956": " ", "957": "d", "958": "ə", "959": " ", "960": "g", "961": "ə", "962": "n", "963": "c", "964": " ", "965": "m", "966": "ü", "967": "t", "968": "ə", "969": "x", "970": "ə", "971": "s", "972": "s", "973": "i", "974": "s", "975": "l", "976": "ə", "977": "r", "978": "i", "979": "n", "980": " ", "981": "b", "982": "e", "983": "y", "984": "n", "985": "ə", "986": "l", "987": "x", "988": "a", "989": "l", "990": "q", "991": " ", "992": "p", "993": "l", "994": "a", "995": "t", "996": "f", "997": "o", "998": "r", "999": "m", "1000": "a", "1001": "l", "1002": "a", "1003": "r", "1004": "a", "1005": " ", "1006": "ç", "1007": "ı", "1008": "x", "1009": "ı", "1010": "ş", "1011": "a", "1012": " ", "1013": "o", "1014": "l", "1015": "a", "1016": "n", "1017": " ", "1018": "m", "1019": "a", "1020": "r", "1021": "a", "1022": "ğ", "1023": "ı", "1024": "n", "1025": "ı", "1026": " ", "1027": "g", "1028": "ö", "1029": "s", "1030": "t", "1031": "ə", "1032": "r", "1033": "i", "1034": "r", "1035": ".", "1036": "<", "1037": "/", "1038": "p", "1039": ">"}]}]	http://localhost:3001/OurTeam	2026-06-03 07:16:11.899	2026-06-10 08:38:46.348	{}	{"az": "Haqqımızda", "en": "About Us", "ru": "About Ru"}	{"az": "SİZİN RƏQƏMSAL KOMANDANIZ"}	{"az": "İLHAM VERƏN KOMANDA"}	{"az": "Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik. Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik. az", "en": "Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik. Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik. en", "ru": "Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik. Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik. ru"}	{}
\.


--
-- TOC entry 5456 (class 0 OID 25178)
-- Dependencies: 245
-- Data for Name: blog_authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_authors (id, name, role, avatar, "order", "createdAt", "updatedAt", bio, "linkedinHref", skills, "skillsTitle", slug, "avatarAlt", "linkedinIcon", "isOurTeam", "isVisible") FROM stdin;
7	Vusal Kerimli	Bas Icraci Direktor	/uploads/blog/1780469165265-901884594.webp	3	2026-06-03 06:46:17.998	2026-06-03 06:53:28.944	\N	\N	{}	SKILLS	vusal-kerimli	\N	\N	t	t
3	Almaz Abdullayeva	Bas Icraci Direktor	/uploads/blog/1780468250524-561548142.webp	4	2026-06-01 06:44:14.242	2026-06-03 06:53:28.944	Trenders-ın təsisçisi, daşınmaz əmlak, biznesin inkişafı və korporativ idarəetmə sahələrində 10 ildən artıq təcrübəyə malik sahibkar və sistem qurucusudur. 	http://localhost:3001/Blog/young-lions-azerbaijan-nedir	{Management,"Business Strategy Development",Strategy}	SKILLS	almaz-abdullayeva	sekilllllljfr	/uploads/blog/1780300542037-525968821.svg	t	t
2	Namiq  Hesenov	CPO	/uploads/blog/1780468237990-309073721.webp	5	2026-05-25 07:10:03.715	2026-06-03 06:53:28.944	\N	\N	{}	SKILLS	namiq-hesenov	sekiljfjf	\N	t	t
1	Leyla Akhundova	CEO	/uploads/blog/1780468258118-303003579.webp	6	2026-05-25 07:09:32.914	2026-06-03 06:53:28.944	\N	\N	{}	SKILLS	leyla-akhundova	jfjfskeil	\N	t	t
4	Cavid Basirov	Director	/uploads/blog/1780468265776-611805960.webp	0	2026-06-01 10:42:39.354	2026-06-03 06:53:28.944	\N	https://az.linkedin.com/	{}	SKILLS	cavid-basirov	mjuhngybft	/uploads/blog/1780469112366-843656566.svg	t	t
5	Fauda Isgender	Marketing Directoru	/uploads/blog/1780469032879-514089861.webp	1	2026-06-03 06:44:18.191	2026-06-03 06:53:28.944	\N	\N	{}	SKILLS	fauda-isgender	oiujytgfrdedgtryu	\N	t	t
6	Nazrin Ehmedov	Designer	/uploads/blog/1780469076049-390217482.webp	2	2026-06-03 06:44:57.503	2026-06-03 06:53:28.944	\N	\N	{}	SKILLS	nazrin-ehmedov	\N	\N	t	t
\.


--
-- TOC entry 5458 (class 0 OID 25194)
-- Dependencies: 247
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_categories (id, label, slug, "order", "createdAt", "updatedAt") FROM stdin;
1	Ai	ai	0	2026-05-25 07:07:47.288	2026-05-25 07:07:47.288
2	Design	design	0	2026-05-25 07:07:53.834	2026-05-25 07:07:53.834
3	Marketing	marketing	0	2026-05-25 07:08:05.211	2026-05-25 07:08:05.211
4	E-commerce	e-commerce	0	2026-05-25 07:08:11.583	2026-05-25 07:08:11.583
5	SMM	smm	0	2026-05-25 07:08:28.317	2026-05-25 07:08:28.317
6	AEO	aeo	0	2026-05-25 07:08:38.653	2026-05-25 07:08:38.653
7	Social Media	social-media	0	2026-06-03 13:40:44.281	2026-06-03 13:40:44.281
8	Case Studies	case-studies	0	2026-06-03 13:40:54.128	2026-06-03 13:40:54.128
9	Graphic Designer	graphic-designer	0	2026-06-03 13:41:09.49	2026-06-03 13:41:09.49
\.


--
-- TOC entry 5462 (class 0 OID 26073)
-- Dependencies: 251
-- Data for Name: blog_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_settings (id, "pageTitle", "buttonText", "buttonLink", "quoteText", "quoteImage", "quoteImageAlt", "createdAt", "updatedAt", "buttonNewTab") FROM stdin;
1	Bloglar !	Portfolio	/portfolio	<p>Agentliyimizin brend strategiyası xidmətlərinə <strong>bazar araşdırması, rəqabət təhlili, brend memarlığı və brend qaydaları daxildir.</strong></p><p></p>	/uploads/blog/1779780942389-885850541.webp	poiuytrewq	2026-05-26 07:33:13.134	2026-06-01 06:14:25.89	f
\.


--
-- TOC entry 5460 (class 0 OID 25211)
-- Dependencies: 249
-- Data for Name: blogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blogs (id, title, slug, badge, excerpt, "coverImage", "coverImageAlt", "publishedAt", "isVisible", "isFeaturedMain", "isFeaturedSide", "isPickOfWeek", "isPreview", "isGrid", hashtags, sections, "authorId", "categoryId", "order", "createdAt", "updatedAt", "isAuthorList", "isAuthorPreview", "isHomeVisible", "authorListPinnedAt") FROM stdin;
1	<h1>Young Lions Azerbaijan nədir?</h1><p></p>	young-lions-azerbaijan-nedir	Brending	<p>Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq “Young Lions” proqramının Azərbaycan üzrə...</p><p></p>	/uploads/blog/1779693228870-622193650.webp	younglionsjf	2026-04-27 00:00:00	t	t	f	f	t	t	{#design,ai,aeo,ceoo}	[{"type": "hero", "title": "<p>Young Lions Azerbaijan: Gənc yaradıcılar üçün beynəlxalq karyera platforması.JF</p><blockquote><h4></h4></blockquote><p></p>", "hashtag": "Design", "heroImage": "/uploads/blog/1779693354316-456001155.webp", "paragraphs": ["<p>Müasir rəqabətli iş dünyasında brendinq hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib. Güclü brend biznesə özünü rəqiblərindən fərqləndirməyə, müştəriləri arasında etibar və inam yaratmağa və istehlakçıların şüurunda qalıcı təəssürat yaratmağa kömək edə bilər. Xidmətlərinə müraciət edir. Trendersin fərqini bilmək üçün isə xidmətimizi bizdən eşidin. Müasir rəqabətli iş dünyasında brendinq hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib.</p><p><br>Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq \\"Young Lions\\" proqramının Azərbaycan üzrə rəsmi seçim mərhələsidir. Bu proqram dünyanın ən nüfuzlu yaradıcılıq tədbirlərindən biri olan Cannes Lions International Festival of Creativity çərçivəsində keçirilir və gənc mütəxəssislərə öz ölkələrini beynəlxalq səviyyədə təmsil etmək imkanı yaradr. Azerbaycan bu proqramda 2022-ci ildən etibarən rəsmi şəkildə iştirak edir. Bu müddət ərzində Young Lions Azerbaijan ölkədə yaradıcı sənayenin inkişafına töhfə verən, yeni nəsil kreativlərin formalaşmasına xidmət edən mühüm platformaya çevrilib.</p><p></p>"], "heroImageAlt": "heroblogjf"}, {"type": "content", "sections": [{"title": "<h3>Young Lions Azerbaijan nədir?</h3><p></p>", "paragraphs": ["<p>Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq \\"Young Lions\\" proqramının Azərbaycan üzrə rəsmi seçim mərhələsidir. Bu proqram dünyanın ən nüfuzlu yaradıcılıq tədbirlərindən biri olan Cannes Lions International Festival of Creativity çərçivəsində keçirilir və gənc mütəxəssislərə öz ölkələrini beynəlxalq səviyyədə təmsil etmək imkanı yaradır.<br><br>Azərbaycan bu proqramda 2022-ci ildən etibarən rəsmi şəkildə iştirak edir. Bu müddət ərzində Young Lions Azerbaijan ölkədə yaradıcı sənayenin inkişafına töhfə verən, yeni nəsil kreativlərin formalaşmasına xidmət edən mühüm platformaya çevrilib.<br><br>Young Lions Azerbaijan artıq 3 ildir ki, ölkəmizdə keçirilir. İlk dəfə yerli kreativlərin təşkili ilə Azərbaycan beynəlxalq Young Lions şəbəkəsinə qoşulub. Sonrakı illərdə yarışmaya maraq artıb və hər il daha çox komanda qeydiyyatdan keçib.<br><br>Bu artım həm yerli kreativ sənayenin inkişafını, həm də gənc mütəxəssislərin beynəlxalq platformalara çıxış olan marağını göstərir.</p><p></p>"]}], "heroImage": "/uploads/blog/1779693484221-70996997.webp", "bottomImages": {"left": "/uploads/blog/1779693594315-762117463.webp", "right": "/uploads/blog/1779693602262-981695195.webp", "leftAlt": "solsekil", "rightAlt": "sagsekil"}, "heroImageAlt": "festivaljf", "overlapTitle": "<p>Young Lions Azerbaijan: Gənc yaradıcılar üçün beynəlxalq</p><p></p>", "introParagraphs": ["<p>Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq \\"Young Lions\\" proqramının Azərbaycan üzrə rəsmi seçim mərhələsidir. Bu proqram dünyanın ən nüfuzlu yaradıcılıq tədbirlərindən biri olan Cannes Lions International Festival of Creativity çərçivəsində keçirilir və gənc mütəxəssislərə öz ölkələrini beynəlxalq səviyyədə təmsil etmək imkanı yaradır.<br><br>Azərbaycan bu proqramda 2022-ci ildən etibarən rəsmi şəkildə iştirak edir. Bu müddət ərzində Young Lions Azerbaijan ölkədə yaradıcı sənayenin inkişafına töhfə verən, yeni nəsil kreativlərin formalaşmasına xidmət edən mühüm platformaya çevrilib.</p><p></p>", ""]}, {"type": "article", "hashtags": "#ai, #blog #test, #agencyai, #azerbaijan, #project manager, #managment, #trenders, #marketing", "sections": [{"blocks": [{"type": "heading", "content": "<h6>Yarışmanın Azərbaycanda keçirilmə tarixi</h6><p></p>"}, {"type": "paragraph", "content": "<p>1.Young Lions Azerbaijan 30 jfyaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq \\"Young Lions\\" proqramının Azərbaycan üzrə rəsmi seçim mərhələsidir. Bu proqram dünyanın ən nüfuzlu yaradıcılıq tədbirlərindən biri olan Cannes Lions International Festival of Creativity çərçivəsində keçirilir və gənc mütəxəssislərə öz ölkələrini beynəlxalq səviyyədə təmsil etmək imkanı yaradır.</p><p></p>"}, {"type": "paragraph", "content": "<p>Azərbaycan bu proqramda 2022-ci ildən etibarən rəsmi şəkildə iştirak edir. Bu müddət ərzində Young Lions Azerbaijan ölkədə yaradıcı sənayenin inkişafına töhfə verən, yeni nəsil kreativlərin formalaşmasına xidmət edən mühüm platformaya çevrilib.</p>"}, {"type": "heading", "content": "<p>Young Lions Azerbaijan nədir?</p>"}, {"type": "paragraph", "content": "<p>Azərbaycan bu proqramda 2022-ci ildən etibarən rəsmi şəkildə iştirak edir. Bu müddət ərzində Young Lions Azerbaijan ölkədə yaradıcı sənayenin inkişafına töhfə verən, yeni nəsil kreativlərin formalaşmasına xidmət edən mühüm platformaya çevrilib.</p>"}], "sideImage": "/uploads/blog/1779693845956-71175953.webp", "hashHeading": "<p>Kategoriyalar</p>", "hashSections": [{"tag": "Dizayn kateqoriyası ", "heading": "<p>Kategoriya</p>", "paragraphs": ["<p>Bu kateqoriyada iştirakçılara branding üzərində işləmək tapşırılır. Komandalar verilən brifə uyğun olaraq brend üçün konseptual vizual həll hazırlayırlar.<br>Hazırlanan iş bir A4 formatlı səhifədə təqdim edilməlidir. Bu səhifədə brend ideyası, əsas vizual istiqamət və dizayn yanaşması aydın şəkildə göstərilməlidir. Məqsəd iştirakçının brend düşüncə tərzini, vizual strategiya qurmaq bacarığını və ideyanı kompakt formada ifadə etmək qabiliyyətini nümayiş etdirməkdir.<br></p><p></p>", "<p></p>"]}, {"tag": "Film kateqoriyası", "paragraphs": ["<p>Bu kateqoriyada iştirakçılara branding üzərində işləmək tapşırılır. Komandalar verilən brifə uyğun olaraq brend üçün konseptual vizual həll hazırlayırlar.<br>Hazırlanan iş bir A4 formatlı səhifədə təqdim edilməlidir. Bu səhifədə brend ideyası, əsas vizual istiqamət və dizayn yanaşması aydın şəkildə göstərilməlidir. Məqsəd iştirakçının brend düşüncə tərzini, vizual strategiya qurmaq bacarığını və ideyanı kompakt formada ifadə etmək qabiliyyətini nümayiş etdirməkdir.</p>"]}, {"tag": "test", "paragraphs": ["<p>Bu kateqoriyada iştirakçılara branding üzərində işləmək tapşırılır. Komandalar verilən brifə uyğun olaraq brend üçün konseptual vizual həll hazırlayırlar.<br>Hazırlanan iş bir A4 formatlı səhifədə təqdim edilməlidir. Bu səhifədə brend ideyası, əsas vizual istiqamət və dizayn yanaşması aydın şəkildə göstərilməlidir. Məqsəd iştirakçının brend düşüncə tərzini, vizual strategiya qurmaq bacarığını və ideyanı kompakt formada ifadə etmək qabiliyyətini nümayiş etdirməkdir.</p>"]}], "sideImageAlt": "yansekil"}], "mainTitle": "<p></p><h4>Yarışmanın Azərbaycanda keçirilmə tarixi1</h4><p></p>"}]	3	2	0	2026-05-25 07:14:33.577	2026-06-04 08:07:29.27	f	t	t	\N
2	Süni İntellekt Erasında Necə Sağ Qalmaq?	suni-intellekt-erasinda-nece-sag-qalmaq	Ai	<h2>Süni intellekt dövründə sağ qalmağın yolu ona qarşı mübarizə aparmaq deyil, onunla birlikdə işləməyi öyrənməkdir. AI insanı əvəz etmir; onu effektiv istifadə etmek</h2><p></p>	/uploads/blog/1779696791189-262268384.webp	aimotion	2026-05-10 00:00:00	t	f	t	f	f	t	{#ai,#aeo,#ceo}	[]	2	1	3	2026-05-25 08:14:06.971	2026-06-01 08:51:11.009	t	f	f	\N
3	<h6>Bir vizual, min fikir: İdeyanı ‘kill etmə’ mədəniyyəti</h6><p></p>	bir-vizual-min-fikir-ideyani-kill-etme-medeniyyeti	Visual	Hər dizayn prosesinin əvvəlində ağlında partlayan onlarcafikir olur. Heç biri tam formalaşmayıb, amma hamısında bir potensial var. Bu mərhələ,ağ səhifəyə...	/uploads/blog/1779696954534-298691763.webp	ailab	2026-05-05 00:00:00	t	f	t	f	t	t	{#ai,#design}	[]	2	2	4	2026-05-25 08:16:21.52	2026-06-01 12:12:43.156	t	f	f	\N
4	<h5>Korporativ üslubunuzu yaradaraq, rəqiblərinizdən fərqlənməyə kömək edirik.</h5><p></p>	korporativ-uslubunuzu-yaradaraq-reqiblerinizden-ferqlenmeye-komek-edirik	design	<h1>KJForporativ üslubunuzu yaradaraq, rəqiblərinizdən fərqlənməyə kömək edirik.Korporativ üslubunuzu yaradaraq, rəqiblərinizdən fərqlənməyə kömək edirik.</h1><p></p>	/uploads/blog/1779697049494-866903880.webp	wehtukidfergdfthyg	2026-05-03 00:00:00	t	f	t	f	f	t	{}	[]	1	5	5	2026-05-25 08:17:50.553	2026-06-01 12:16:09.021	f	f	f	\N
5	<h1>Marketing Komandasi</h1><p></p>	marketing-komandasi	testt	<h6>testtestt</h6><p></p>	/uploads/blog/1779701390879-688374293.webp	poiuytrew	2026-04-28 00:00:00	t	f	f	f	t	t	{}	[]	2	4	1	2026-05-25 09:30:08.632	2026-06-02 11:30:59.239	t	f	f	\N
16	<p>Hər dizayn prosesinin əvvəlində ağlında partlayan onlarcafikir olur1</p>	her-dizayn-prosesinin-evvelinde-aglinda-partlayan-onlarcafikir-olur1	design	<p>Hər dizayn prosesinin əvvəlində ağlında partlayan onlarcafikir olur. Heç biri tam formalaşmayıb, amma hamısında bir potensial ...</p>	/uploads/blog/1780647169120-471224230.webp	\N	2026-06-01 00:00:00	t	f	f	f	f	t	{}	[]	3	3	0	2026-06-01 13:22:32.27	2026-06-05 08:12:50.343	f	f	f	\N
14	<p>Dizayn prosesinin testinde</p>	dizayn-prosesinin-testinde	design	<p>Hər dizayn prosesinin əvvəlində ağlında partlayan onlarcafikir olur. Heç biri tam formalaşmayıb, amma hamısında bir potensial ...</p>	/uploads/blog/1780320057187-600694512.webp	\N	2026-06-01 00:00:00	t	f	f	f	f	t	{}	[]	2	\N	0	2026-06-01 13:20:59.917	2026-06-01 13:21:07.631	f	f	f	\N
6	<p>Tvim Ecommerce</p><p></p>	tvim-ecommerce	E-commerce	<p>Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün</p>	/uploads/blog/1779714210122-262164111.webp	altdesc	2026-05-09 00:00:00	t	f	f	t	t	t	{#e-commerce,#ai,#trenders}	[{"type": "hero", "title": "<p>Gənc yaradıcılar üçün beynəlxalq karyera</p>", "hashtag": "E-commerce", "heroImage": "/uploads/blog/1779714291816-826119613.webp", "paragraphs": ["<p>Müasir rəqabətli iş dünyasında brendinq hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib. Güclü brend biznesə özünü rəqiblərindən fərqləndirməyə, müştəriləri arasında etibar və inam yaratmağa və istehlakçıların şüurunda qalıcı təəssürat yaratmağa kömək edə bilər. Xidmətlərinə müraciət edir. Trendersin fərqini bilmək üçün isə xidmətimizi bizdən eşidin. Müasir rəqabətli iş dünyasında brendinq hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib.</p>", "<p>Müasir rəqabətli iş dünyasında brendinq hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib. Güclü brend biznesə özünü rəqiblərindən fərqləndirməyə, müştəriləri arasında etibar və inam yaratmağa və istehlakçıların şüurunda qalıcı təəssürat yaratmağa kömək edə bilər. Xidmətlərinə müraciət edir. Trendersin fərqini bilmək üçün isə xidmətimizi bizdən eşidin. Müasir rəqabətli iş dünyasında brendinq hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib.</p>"], "heroImageAlt": "altimage"}, {"type": "content", "sections": [{"title": "<p>Test nedir ?</p>", "paragraphs": ["<p>Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq \\"Young Lions\\" proqramının Azərbaycan üzrə rəsmi seçim mərhələsidir. Bu proqram dünyanın ən nüfuzlu yaradıcılıq tədbirlərindən biri olan Cannes Lions International Festival of Creativity çərçivəsində keçirilir və gənc mütəxəssislərə öz ölkələrini beynəlxalq səviyyədə təmsil etmək imkanı yaradır.</p>", "<p>Azərbaycan bu proqramda 2022-ci ildən etibarən rəsmi şəkildə iştirak edir. Bu müddət ərzində Young Lions Azerbaijan ölkədə yaradıcı sənayenin inkişafına töhfə verən, yeni nəsil kreativlərin formalaşmasına xidmət edən mühüm platformaya çevrilib.</p>", "<p>Young Lions Azerbaijan artıq 3 ildir ki, ölkəmizdə keçirilir. İlk dəfə yerli kreativlərin təşkili ilə Azərbaycan beynəlxalq Young Lions şəbəkəsinə qoşulub. Sonrakı illərdə yarışmaya maraq artıb və hər il daha çox komanda qeydiyyatdan keçib.</p>", "<p>Bu artım həm yerli kreativ sənayenin inkişafını, həm də gənc mütəxəssislərin beynəlxalq platformalara çıxış olan marağını göstərir.</p>"]}], "heroImage": "/uploads/blog/1779714377777-746401809.webp", "bottomImages": {"left": "/uploads/blog/1779714618747-242651978.webp", "right": "/uploads/blog/1779714620437-34075920.webp"}, "heroImageAlt": "imagee", "overlapTitle": "<p>Sizi Trend Edəcək Marketinq Agentliyi</p>", "introParagraphs": ["<p>Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq \\"Young Lions\\" proqramının Azərbaycan üzrə rəsmi seçim mərhələsidir. Bu proqram dünyanın ən nüfuzlu yaradıcılıq tədbirlərindən biri olan Cannes Lions International Festival of Creativity çərçivəsində keçirilir və gənc mütəxəssislərə öz ölkələrini beynəlxalq səviyyədə təmsil etmək imkanı yaradır.</p>", "<p>Azərbaycan bu proqramda 2022-ci ildən etibarən rəsmi şəkildə iştirak edir. Bu müddət ərzində Young Lions Azerbaijan ölkədə yaradıcı sənayenin inkişafına töhfə verən, yeni nəsil kreativlərin formalaşmasına xidmət edən mühüm platformaya çevrilib.</p>"]}]	2	4	2	2026-05-25 13:10:24.891	2026-06-02 11:25:52.2	t	f	t	\N
12	<p>Süni İntellekt Erasında Necə Sağ Qalmaqq ?</p><p></p><p></p>	suni-intellekt-erasinda-nece-sag-qalmaqq-	test	<p>Hər dizayn prosesinin əvvəlində ağlında partlayan onlarcafikir olur. Heç biri tam formalaşmayıb, amma hamısında bir potensial var. Bu mərhələ,ağ səhifəyə...</p>	/uploads/blog/1780317077736-582633325.webp	poiuytrewqasdfghjkl	2026-06-01 00:00:00	t	f	f	f	f	t	{}	[]	3	3	0	2026-06-01 12:31:26.831	2026-06-02 13:46:03.757	t	f	t	2026-06-02 12:20:28.636
11	<p>Hər dizayn prosesinin əvvəlində ağlında partlayan onlarcafikir olur</p>	her-dizayn-prosesinin-evvelinde-aglinda-partlayan-onlarcafikir-olur	test	<p>testtesttesttest testtesttesttest</p>	/uploads/blog/1780316396266-12002441.webp	\N	2026-06-01 00:00:00	t	f	f	f	f	t	{}	[]	3	\N	0	2026-06-01 12:20:00.036	2026-06-04 06:12:10.598	f	f	f	\N
15	<p>Hər dizayn prosesinin əvvəlində ağlında partlayan onlarca fikir olur</p>	her-dizayn-prosesinin-evvelinde-aglinda-partlayan-onlarca-fikir-olur	design	<p>Hər dizayn prosesinin əvvəlində ağlında partlayan onlarcafikir olur. Heç biri tam formalaşmayıb, amma hamısında bir potensial ...</p>	/uploads/blog/1780320080880-338198652.webp	\N	2026-06-01 00:00:00	t	f	f	f	f	t	{}	[]	4	\N	0	2026-06-01 13:21:25.424	2026-06-04 06:12:48.953	f	f	f	\N
13	<p>Hər dizayn prosesinin əvvəlində ağlında partlayan onlarcafikir olurtest</p>	her-dizayn-prosesinin-evvelinde-aglinda-partlayan-onlarcafikir-olurtest	testttt	<p>Hər dizayn prosesinin əvvəlində ağlında partlayan onlarcafikir olur. Heç biri tam formalaşmayıb, amma hamısında bir potensial </p>	/uploads/blog/1780320035170-144060230.webp	\N	2026-06-01 00:00:00	t	f	f	f	f	t	{}	[]	2	\N	0	2026-06-01 13:20:37.444	2026-06-04 06:13:08.537	f	f	f	\N
\.


--
-- TOC entry 5480 (class 0 OID 36789)
-- Dependencies: 269
-- Data for Name: contact_budget_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_budget_options (id, "order", "contactId", label) FROM stdin;
1	0	1	{"az": "1000-2000"}
2	1	1	{"az": "5000-7000"}
\.


--
-- TOC entry 5476 (class 0 OID 36714)
-- Dependencies: 265
-- Data for Name: contact_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_settings (id, tags, "createdAt", "updatedAt", "formBudgetPlaceholder", "formTimelinePlaceholder", title, description, "emailLabel", "emailValue", "phoneLabel", "phoneValue", "locationLabel", "locationValue", "hoursLabel", "hoursValue", "followUsLabel", "formNameLabel", "formNamePlaceholder", "formEmailLabel", "formEmailPlaceholder", "formPhoneLabel", "formPhonePlaceholder", "formServiceLabel", "formBudgetLabel", "formTimelineLabel", "formMessageLabel", "formMessagePlaceholder", "formSubmitLabel") FROM stdin;
1	{#aiblog,#management,#ceo}	2026-06-08 06:47:35.426	2026-06-10 06:52:12.538	{"az": "Estimated Budget"}	{}	{"az": "Contact Us ", "en": "Contact Us ", "ru": "Contact Us"}	{"az": "Ready to start a project, collaborate, or just say hello? Drop us a message - we typically reply within 24 hours. az", "en": "Ready to start a project, collaborate, or just say hello? Drop us a message - we typically reply within 24 hours. en", "ru": "Ready to start a project, collaborate, or just say hello? Drop us a message - we typically reply within 24 hours. ru"}	{"az": "Email Adress"}	{"az": "info@trenders.com"}	{"az": "phone"}	{"az": "+994 50 000 99 99"}	{"az": "Location"}	{"az": "Baku, Sabail Alibayov Gardashlari, 12"}	{"az": "Hours"}	{"az": "Monday - Friday 9:00 AM - 6:00 PM"}	{"az": "Follow us"}	{"az": "Name"}	{"az": "Your name"}	{"az": "Email"}	{"az": "Your email"}	{"az": "Phone"}	{"az": "Your Phone"}	{"az": "Service"}	{"az": "Budget"}	{"az": "Timeline"}	{"az": "Message"}	{"az": "Your message"}	{"az": "Submit"}
\.


--
-- TOC entry 5478 (class 0 OID 36773)
-- Dependencies: 267
-- Data for Name: contact_social_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_social_links (id, icon, href, "order", "isVisible", "contactId") FROM stdin;
1	/uploads/about/1780901376078-763160017.webp	https://towebp.io/	0	t	1
\.


--
-- TOC entry 5484 (class 0 OID 36817)
-- Dependencies: 273
-- Data for Name: contact_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_submissions (id, name, email, phone, service, budget, timeline, message, "createdAt") FROM stdin;
23	Aitaj Chodarli	aitaj.c@omnuvex.net	+994 988 23 46	brending	1000 - 2000	2 month	Ready to start a project, collaborate, or just say hello? Drop us a message – we typically reply within 24 hours.Ready to start a project, collaborate, or just say hello? Drop us a message – we typically reply within 24 hours.Ready to start a project, collaborate, or just say hello? Drop us a message – we typically reply within 24 hours.	2026-06-08 11:43:28.808
24	Aga Atayev	aitaj.c@omnuvex.net	+994 988 23 46	ADS &amp; Targeting	5000-10.000	2 month	TESTESTESTESTES Ready to start a project, collaborate, or just say hello? Drop us a message – we typically reply within 24 hours.	2026-06-08 11:44:13.075
\.


--
-- TOC entry 5482 (class 0 OID 36803)
-- Dependencies: 271
-- Data for Name: contact_timeline_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_timeline_options (id, "order", "contactId", label) FROM stdin;
2	1	1	{"az": "3 motth"}
1	0	1	{"az": "2 month"}
\.


--
-- TOC entry 5434 (class 0 OID 16452)
-- Dependencies: 223
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, "isVisible", "createdAt", "updatedAt", "order", question, answer) FROM stdin;
5	t	2026-05-19 11:09:42.976	2026-06-10 07:06:31.234	0	{"az": "Where can I watch? "}	{"az": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. az", "en": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. en", "ru": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. ru"}
2	t	2026-05-19 10:58:36.233	2026-06-10 07:06:52.434	1	{"az": "Where can I watch?"}	{"az": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. az", "en": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. en", "ru": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. ru"}
6	t	2026-05-19 11:31:14.395	2026-06-10 07:07:10.685	2	{"az": "Where can I watch?"}	{"az": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. az", "en": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. en", "ru": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. ru"}
3	t	2026-05-19 10:59:46.818	2026-06-10 07:07:28.56	3	{"az": "Where can I watch?"}	{"az": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. az", "en": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla.en", "ru": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet id ullamcorper venenatis. Fermentum sulla craspor ttitore  ismod nulla. ru"}
\.


--
-- TOC entry 5472 (class 0 OID 35529)
-- Dependencies: 261
-- Data for Name: footer_nav_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.footer_nav_links (id, href, "order", "isVisible", "openInNewTab", "footerId", "createdAt", "updatedAt", label) FROM stdin;
1	/	0	t	f	1	2026-06-05 10:45:28.113	2026-06-10 11:57:56.83	{"az": "Haqqımızda"}
2	/	1	t	f	1	2026-06-05 10:45:40.875	2026-06-10 11:57:56.83	{"az": "Service"}
3	/	2	t	f	1	2026-06-05 10:45:42.246	2026-06-10 11:57:56.83	{"az": "Portfolio"}
4	/	3	t	f	1	2026-06-05 10:45:43.347	2026-06-10 11:57:56.83	{"az": "Vakansiyalar"}
5	/	4	t	f	1	2026-06-05 10:45:44.742	2026-06-10 11:57:56.83	{"az": "Blog"}
6	/	5	t	f	1	2026-06-05 10:45:45.793	2026-06-10 11:57:56.83	{"az": "Əlaqə"}
\.


--
-- TOC entry 5470 (class 0 OID 35496)
-- Dependencies: 259
-- Data for Name: footer_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.footer_settings (id, "logoImage", "createdAt", "updatedAt", "logoAlt", description, "copyrightText", "privacyText", "locationLabel", "phoneLabel", "emailLabel", "locationValue", "phoneValue", "emailValue") FROM stdin;
1	/uploads/about/1781076997429-931081615.webp	2026-06-05 10:36:34.558	2026-06-10 11:57:56.761	{"az": "trenders"}	{"az": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet az", "en": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet en", "ru": "Nibh quisque suscipit fermentum netus nulla cras porttitor euismod nulla. Orci, dictumst nec aliquet ru"}	{"az": "© 2023 Trenders"}	{"az": "Məxfilik siyasəti | Bütün hüquqlar qorunur "}	{"az": "Location"}	{"az": "Phone"}	{"az": "Email Adress"}	{"az": "Baku, Sabail Alibayov Gardashlari, 12"}	{"az": "+994 55 555 55 55"}	{"az": "trenders@gmail.com"}
\.


--
-- TOC entry 5474 (class 0 OID 35551)
-- Dependencies: 263
-- Data for Name: footer_social_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.footer_social_links (id, icon, href, "order", "isVisible", "footerId", "createdAt", "updatedAt") FROM stdin;
1	/uploads/about/1780656118570-519922742.webp	https://towebp.io/	0	t	1	2026-06-05 10:41:38.289	2026-06-10 11:57:56.846
2	/uploads/about/1780656284558-820806844.webp	https://towebp.io/	1	t	1	2026-06-05 10:42:44.882	2026-06-10 11:57:56.846
3	/uploads/about/1780656312091-23153582.webp	https://towebp.io/	2	t	1	2026-06-05 10:42:45.653	2026-06-10 11:57:56.846
\.


--
-- TOC entry 5468 (class 0 OID 34459)
-- Dependencies: 257
-- Data for Name: nav_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nav_links (id, href, "order", "isVisible", "openInNewTab", "navbarId", "createdAt", "updatedAt", label) FROM stdin;
1	http://localhost:3001/About	0	t	f	1	2026-06-03 08:26:04.349	2026-06-10 11:21:39.155	{"az": "Haqqımızda", "en": "About Us", "ru": "About Ru"}
2	http://localhost:3001/service	1	t	f	1	2026-06-03 08:27:37.355	2026-06-10 11:21:39.155	{"az": "Service"}
3	http://localhost:3001/portfolio	2	t	f	1	2026-06-03 08:28:04.725	2026-06-10 11:21:39.155	{"az": "Portfolio"}
4	http://localhost:3001/Vacancy	3	t	f	1	2026-06-03 08:28:20.991	2026-06-10 11:21:39.155	{"az": "Vakansiyalar"}
5	http://localhost:3001/Blog	4	t	f	1	2026-06-03 08:29:07.838	2026-06-10 11:21:39.155	{"az": "Blog"}
6	http://localhost:3001/Contact	5	t	f	1	2026-06-03 08:29:26.925	2026-06-10 11:21:39.155	{"az": "Əlaqə"}
\.


--
-- TOC entry 5466 (class 0 OID 34440)
-- Dependencies: 255
-- Data for Name: navbar_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.navbar_settings (id, "logoImage", "showSearch", "showLang", "createdAt", "updatedAt", "logoImageAlt") FROM stdin;
1	/uploads/about/1780562284365-913730569.webp	t	t	2026-06-03 08:25:17.445	2026-06-10 11:21:39.136	{"az": "logo"}
\.


--
-- TOC entry 5450 (class 0 OID 20900)
-- Dependencies: 239
-- Data for Name: partner_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_sections (id, title, description, "linkText", "linkHref", "createdAt", "updatedAt") FROM stdin;
1	Terefdaslarimiz	<h1>Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, <a target="_self" rel="noopener noreferrer" href="http://localhost:3001/partnerspage"><strong>biz sizə trendi yaratmağa kömək edəcəyik.</strong>&nbsp;</a></h1><p class="editor-p"></p>	biz size trendiy yaratmaga komek edeeyik	/partners	2026-05-21 10:37:55.133	2026-06-08 11:31:34.731
\.


--
-- TOC entry 5452 (class 0 OID 20919)
-- Dependencies: 241
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partners (id, image, "altText", name, "order", "isHomepage", "sectionId", "createdAt", "updatedAt", "isVisible") FROM stdin;
6	/uploads/partners/1780637843262-526238573.webp	poiuytrew	<p>qwerty</p>	0	t	1	2026-05-21 12:55:02.561	2026-06-05 05:37:23.331	t
8	/uploads/partners/1780637855937-861097164.webp		<p class="editor-p">Sabah</p>	0	t	1	2026-06-04 06:51:56.749	2026-06-05 05:37:35.951	t
7	/uploads/partners/1780637863048-593272066.webp	poiuytrew	<p>yrewqwer</p>	1	t	1	2026-05-21 12:55:18.48	2026-06-05 05:37:43.068	t
3	/uploads/partners/1780637868679-264631871.webp	freefrferferfrefref	<h1>kapital bakk</h1><p class="editor-p"></p>	2	t	1	2026-05-21 12:01:42.255	2026-06-05 05:37:48.688	t
1	/uploads/partners/1780637878037-252637788.webp	Kpatila bank	<h1>App icons of EMUI 10, animated clock skins for P50 Pocket, design and graphics for OS</h1><p></p>	3	t	1	2026-05-21 10:38:35.838	2026-06-05 05:37:58.047	t
2	/uploads/partners/1780637915487-435171896.webp	logos	Pasa Bank	4	t	1	2026-05-21 10:39:27.103	2026-06-05 05:38:35.495	t
\.


--
-- TOC entry 5448 (class 0 OID 18233)
-- Dependencies: 237
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolios (id, title, slug, tags, "coverImage", sections, "order", "isVisible", "createdAt", "updatedAt", "isHomepage", "coverImageAlt") FROM stdin;
4	<h3>Test test</h3><p></p>	test-test	{Smm,Test}	/uploads/portfolio/1780405480758-6097174.webp	[{"type": "hero", "title": "<h1>Testt</h1>", "images": ["/uploads/portfolio/1779279427296-801792037.webp", "/uploads/portfolio/1779279427308-423099234.webp", "/uploads/portfolio/1779279427319-432582594.webp"], "number": "01", "description": "<p><strong>salammmmm   </strong></p>"}]	3	t	2026-05-20 12:17:32.201	2026-06-04 07:51:00.769	t	
10	<p>Test23</p>	test23	{Smm,CEO}	/uploads/portfolio/1780395512341-160519216.webp	[]	4	t	2026-06-02 10:18:35.76	2026-06-04 07:51:00.769	f	
11	<p>testtt test</p>	testtt-test	{Marketinq,SMM}	/uploads/portfolio/1780395773516-289183336.webp	[]	5	t	2026-06-02 10:22:54.596	2026-06-04 07:51:00.769	f	
12	<p>tREVA Real Estate</p>	treva-real-estate	{AI,CPO}	/uploads/portfolio/1780395821496-208611886.webp	[]	6	t	2026-06-02 10:23:42.556	2026-06-04 07:51:00.769	f	
7	<p>Young Lions</p>	young-lions	{SMM,DEVELOPMENT}	/uploads/portfolio/1780405215922-778091869.webp	[{"type": "service", "badge": "tt", "items": [{"title": "ttr", "images": ["/uploads/portfolio/1779286577882-728756953.webp", "/uploads/portfolio/1779286580149-163211884.webp", "/uploads/portfolio/1779286582695-500796923.webp"], "number": "01"}], "title": "gffffffffffffff", "bigNumber": "43", "descriptions": ["<p>gffffffffffffffff</p>", "<p>gffffffffffffffffff</p>"]}]	1	t	2026-05-20 14:16:24.494	2026-06-04 07:51:00.769	t	
6	<p>F1-GP</p>	f1-gp	{SMM,INNOVATION}	/uploads/portfolio/1780405496261-890797750.webp	[{"type": "hero", "title": "dfffffffffffff", "images": ["/uploads/portfolio/1779286524819-759502922.webp"], "number": "45", "description": "<p>fddddddddddddddddd</p>"}, {"type": "steps", "steps": [{"label": "trrewgfgd", "number": "01"}, {"label": "555555555555555", "number": "02"}, {"label": "yyyyyyyyyyyyy", "number": "03"}], "description": "<p>bvgfds</p>"}]	2	t	2026-05-20 14:15:38.9	2026-06-04 07:51:00.769	t	
2	East Park Premium Suites	east-park-premium-suites	{SMM,Development}	/uploads/portfolio/1780405524750-612838444.webp	[{"type": "hero", "title": "East Park Premium Suites", "images": ["/uploads/portfolio/1779278247429-806217743.webp", "/uploads/portfolio/1779278244370-217807703.webp", "/uploads/portfolio/1779278250245-704183615.webp", "/uploads/portfolio/1779278240399-385893421.webp"], "number": "01", "description": "<p>Agentliyimizin brend strategiyası xidmətlərinə <strong>bazar araşdırması, rəqabət təhlili, brend memarlığı və brend qaydaları</strong> daxildir.</p>"}]	7	t	2026-05-20 11:57:47.565	2026-06-04 07:51:00.769	t	
3	AI LAB	ai-lab	{SMM,AI}	/uploads/portfolio/1780405533137-158555903.webp	[{"type": "hero", "title": "Agentliyimiz", "images": ["/uploads/portfolio/1779278364310-984059480.webp", "/uploads/portfolio/1779278366478-983571196.webp"], "description": "<p>Agentliyimizin brend strategiyası xidmətlərinə <strong>bazar araşdırması, rəqabət təhlili, brend memarlığı və brend qaydaları</strong> daxildir.</p>"}]	8	t	2026-05-20 11:59:27.644	2026-06-04 07:51:00.769	t	
1	<h6>Marian Villagee</h6><p></p>	marian-villagee	{Smm,Development}	/uploads/portfolio/1780405199895-45127630.webp	[{"_id": "26efaf9d-8ade-4179-94a3-6ac79565731e", "type": "hero", "title": "<h6>MARINA VILLAGEE</h6><p></p>", "images": ["/uploads/portfolio/1780559867538-543953762.webp", "/uploads/portfolio/1780559872120-47449975.webp", "/uploads/portfolio/1780559874772-971927822.webp", "/uploads/portfolio/1780559879483-504150446.webp"], "number": "01", "imagesAlt": "TESTT", "description": "<h1>Agentliyimizin brend strategiyası xidmətlərinə <strong>bazar araşdırması, rəqabət təhlili, brend memarlığı və brend qaydaları</strong> daxildir.</h1><p></p>"}, {"_id": "bc06a820-4a17-4260-98c3-57698084f109", "type": "steps", "steps": [{"label": "Saytın məqsədinin müəyyən edilməsi olur", "number": "01"}, {"label": "Sayt üçün texniki tapşırığın yaradılması", "number": "02"}, {"label": "Kontentin mütləq hazırlanması", "number": "03"}, {"label": "Prototipləmə işlərin vacib tutulması", "number": "04"}], "description": "<h6>Agentliyimizin brend strategiyası xidmətlərinə <strong>bazar araşdırması, rəqabət təhlili, brend memarlığı və brend qaydaları daxildir.</strong></h6><p></p>"}, {"_id": "680d1311-9bab-49e1-b993-0ce47cc73f8a", "type": "service", "badge": " Brendinq", "items": [{"title": "Saytın məqsədinin müəyyən edilməsi olur", "images": ["/uploads/portfolio/1780559639831-359726973.webp", "/uploads/portfolio/1780559643754-453419478.webp", "/uploads/portfolio/1780559648212-34830347.webp"], "number": "/01", "imagesAlt": "TESTTT"}, {"title": "Saytın məqsədinin müəyyən edilməsi olur", "images": ["/uploads/portfolio/1780559747479-579721440.webp", "/uploads/portfolio/1780559752157-284755686.webp"], "number": "/02", "imagesAlt": "TESTTT"}], "title": "Satyın məqsədinin müəəyən edilməsi olunur", "bigNumber": "02", "descriptions": ["<p>Brendin pozisiyası, markanın rəqiblərinə nisbətən bazarda özünəməxsus mövqeyinin müəyyən edilməsi prosesidir. Bu, bir markanın əsas üstünlüklərini və xüsusiyyətlərini müəyyənləşdirməyi və müştərilərə informasiyanı birbaşa şəkildə çatdırmağı əhatə edir. Trendlər müştərilərə onları rəqiblərindən fərqləndirən və müştəriləri ilə güclü emosional əlaqələr quran effektiv brend pozisiyası üçün strategiyaları hazırlamağa kömək edir. Bizim brendin bazar pozisiyası xidmətlərimizə brendin fərqləndirilməsi, hədəf auditoriya təhlili və brend mesajlaşması daxildir<br></p>", "<p>Brendin diferensiallaşdırılması, brendi rəqiblərindən nəyin fərqləndirdiyini müəyyən etmək prosesidir. Hədəf auditoriyasının təhlili bir markanın hədəf auditoriyasının ehtiyaclarını, üstünlüklərini başa düşməyi və onlarla birbaşa danışan mesajlaşmanı inkişaf etdirməyi əhatə edir. Nəhayət, brend mesajlaşması brendin xidmətlərini müştərilərə birbaşa şəkildə çatdıran aydın və qısa mesajın hazırlanmasını nəzərdə tutur.</p>"]}, {"_id": "60ccfcee-6ee7-4cab-835f-27d40445daaa", "type": "strategy", "badge": "  Brendinq", "quote": "<p><br>Agentliyimizin brend strategiyası xidmətlərinə <strong>bazar araşdırması, rəqabət təhlili, brend memarlığı və brend qaydaları daxildir.</strong></p>", "title": "Brend strategiyasının qurulması", "mainImage": "/uploads/portfolio/1779275977841-203638058.webp", "quoteImage": "/uploads/portfolio/1780559493934-807848774.webp", "smallImages": ["/uploads/portfolio/1779276115461-892410618.webp", "/uploads/portfolio/1779275987045-175978783.webp"], "descriptions": ["<p>Brend strategiyası, markanın uzunmüddətli məqsədlərinə çatmaq üçün planlaşdırılmış addımlar toplusudur. Bu proses brendin dəyərlərini, missiyasını və vizyonunu aydın şəkildə müəyyənləşdirir</p>", "<p>Effektiv strategiya müştərilərlə emosional bağ qurmağa, rəqiblərdən fərqlənməyə və bazarda güclü mövqe tutmağa imkan verir. Bizim yanaşmamız brendin əsas güclü tərəflərini ön plana çıxarır.</p>"], "quoteImageAlt": "TESTTT", "smallImagesAlt": "TESTTT"}, {"_id": "38fc2a9a-af87-4b44-a20c-083d349d43cc", "type": "overlay", "badge": "Brendinq", "image": "/uploads/portfolio/1780559626267-417138599.webp", "title": "Brend Kimliyi:", "imageAlt": "TESTTT", "descriptions": ["<p>Brend identifikasiyası brendin vizual və emosional ifadəsidir. Bura müştərilərin marka ilə əlaqələndirdiyi bütün vizual elementlər, məsələn, loqolar, rəng sxemləri, tipoqrafiya və təsvirlər daxildir. Trendlər müştərilərə öz brendlərinin mahiyyətini əks etdirən, onları rəqiblərindən fərqləndirən, unikal və yaddaqalan brend şəxsiyyətlərini inkişaf etdirməyə kömək edir. Bizim brend identifikasiyası xidmətlərimizə loqo dizaynı, vizual brend dizaynı və brend stilistikası daxildir.</p><p></p>", "<p>Loqo dizaynı brendi təmsil edən fərqli vizual simvolun yaradılması prosesidir. Trenders-in dizayn komandası yaddaqalan, özünəməxsus və brend hekayəsinə uyğun loqolar hazırlamaq üçün müştərilərə sıx əməkdaşlıq edir. Vizual brend dizaynına brendin şəxsiyyətini və dəyərlərini çatdıran hərtərəfli vizual elementlərin hazırlanması daxildir.</p>"]}]	0	t	2026-05-20 10:04:56.356	2026-06-04 07:59:49.717	t	TESTT
\.


--
-- TOC entry 5432 (class 0 OID 16402)
-- Dependencies: 221
-- Data for Name: product_owners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_owners (id, email, password, "createdAt", "updatedAt") FROM stdin;
1	wearetrenders@gmail.com	$2b$10$bTRGH/chMU2OeQrEiCeq4uccqdj/wHFMTWU8LxIUB4qOziYNHQ.qm	2026-05-19 12:10:49.852	2026-05-19 12:10:49.852
\.


--
-- TOC entry 5454 (class 0 OID 22016)
-- Dependencies: 243
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, number, slug, badge, title, description, image, "imageAlt", gif, features, "portfolioButtonText", "portfolioButtonLink", "portfolioButtonNewTab", "detailButtonText", "detailButtonLink", "detailButtonNewTab", "order", "isVisible", sections, "createdAt", "updatedAt") FROM stdin;
3	01	ads-amp-targeting	Brending	<p>ADS &amp; Targeting</p>	<p>Korporativ üslubunuzu yaradaraq, rəqiblərinizdan fərqlənməyə kömək edirik.</p>	/uploads/services/1780928232447-133891307.webp	testtt	/uploads/services/1780550453336-807486905.gif	[{"label": "Brend Strategiyası"}, {"label": "Brend İdarəetmə:"}, {"label": "Brend Strategiyası"}, {"label": "Brend Mesajlaşması"}, {"label": "Brend Pozisyası"}, {"label": "Brend Kimliyi"}]	Portfolioo	http://localhost:3001/Portfolio	f	Daha etraflii	\N	f	0	t	[{"type": "hero", "badge": "Brending", "stats": [], "title": "<p>Sizi Trend Edəcək<br>Marketinq Agentliyi</p>", "heroImage": "/uploads/services/1780550713601-896445630.webp", "quoteText": "<p>Trenders bizneslərə öz&nbsp;brendlərini&nbsp;yaratmaqda, məhsul və ya xidmətlərini <strong>effektiv şəkildə satmaqda kömək etmək üzrə ixtisaslaşaraq xidmət göstərən&nbsp;marketinq agentliyidir.</strong></p>", "bottomImage": "/uploads/services/1780550731912-703467548.webp", "descriptions": ["<p>Müasir rəqabətli iş dünyasında&nbsp;brendinq&nbsp;hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib. Güclü brend biznesə özünü rəqiblərindən fərqləndirməyə, müştəriləri arasında etibar və inam yaratmağa və istehlakçıların şüurunda qalıcı təəssürat yaratmağa kömək edə bilər.<br><br>Məhz buna görə də getdikcə daha çox şirkət Bakıda, Azərbaycanda yerləşən yerli agentlik olan Trenders kimi marketinq agentliklərinin təqdim etdiyi brendinq xidmətlərinə müraciət edir.&nbsp;Trendersin&nbsp;fərqini bilmək üçün isə xidmətimizi bizdən eşidin.</p>", ""], "heroImageAlt": "testtttt", "bottomImageAlt": "poiuytrewq"}, {"type": "content", "items": [{"badge": "Brending", "image": "", "quote": "<p>Agentliyimizin brend strategiyası xidmətlərinə <strong>bazar araşdırması, rəqabət təhlili,&nbsp;brend memarlığı&nbsp;və&nbsp;brend qaydaları&nbsp;daxildir.</strong></p>", "title": "<p>Brend<br>Strategİyası:</p>", "number": "01", "subText": "<p>Trenders&nbsp;brend<strong> strategiyası,&nbsp;brend identifikasiyası,&nbsp;brend mesajlaşması,&nbsp;brendin pozisiyası&nbsp;və&nbsp;brendin idarə edilməsi</strong>&nbsp;də daxil olmaqla geniş çeşiddə brendinq xidmətləri təklif edir. Xidmətlərimiz daxilində brendinq xidmətimizdən yararlanan şirkətlər üçün hazırladığımız&nbsp;dizayn&nbsp;və&nbsp;loqoları&nbsp;da görə bilərsiniz</p>", "imageAlt": "", "quoteImage": "/uploads/services/1780550995976-518126230.webp", "descriptions": ["<p>Bazar araşdırması brend strategiyasının inkişafının vacib komponentidir. Trenders müştərilərə hədəf auditoriyasını, ehtiyaclarını və üstünlüklərini daha yaxşı başa düşməyə kömək etmək üçün geniş bazar araşdırması aparır.<br><br>Bu tədqiqat əsas bazar tendensiyalarını, müştəri fikirlərini və brend strategiyasının inkişafına təsir edə biləcək rəqabət mühitini müəyyən etməyə kömək edir. Rəqabət təhlili müştərilərə rəqiblərini tanımağa və bazarda fərqlənmək imkanlarını müəyyən etməyə kömək edir.</p>", ""]}, {"badge": "Brending", "image": "/uploads/services/1780551049239-320197389.webp", "quote": "", "title": "<p>Brend<br>Strategİyası:</p>", "number": "02", "subText": "", "imageAlt": "poiuytrerthjmhgfrgn", "quoteImage": "", "descriptions": ["<p>Brendin pozisiyası, markanın rəqiblərinə nisbətən bazarda özünəməxsus mövqeyinin müəyyən edilməsi prosesidir. Bu, bir markanın əsas üstünlüklərini və xüsusiyyətlərini müəyyənləşdirməyi və müştərilərə informasiyanı birbaşa şəkildə çatdırmağı əhatə edir. Trendlər müştərilərə onları rəqiblərindən fərqləndirən və müştəriləri ilə güclü emosional əlaqələr quran effektiv brend pozisiyası üçün strategiyaları hazırlamağa kömək edir. Bizim brendin bazar pozisiyası xidmətlərimizə brendin fərqləndirilməsi, hədəf auditoriya təhlili və brend mesajlaşması daxildir.<br><br>Brendin diferensiallaşdırılması, brendi rəqiblərindən nəyin fərqləndirdiyini müəyyən etmək prosesidir. Hədəf auditoriyasının təhlili bir markanın hədəf auditoriyasının ehtiyaclarını, üstünlüklərini başa düşməyi və onlarla birbaşa danışan mesajlaşmanı inkişaf etdirməyi əhatə edir. Nəhayət, brend mesajlaşması brendin xidmətlərini müştərilərə birbaşa şəkildə çatdıran aydın və qısa mesajın hazırlanmasını nəzərdə tutur.</p>", ""]}]}, {"type": "quote", "badge": "Brending", "title": "<p>Brend<br>Strategİyası:</p>", "number": "03", "quoteText": "<p>Brend memarlığı brend adları, loqolar və sloganlar kimi<strong> brend elementlərinin aydın iyerarxiyasının inkişaf etdirilməsi prosesidir</strong></p>", "quoteImage": "/uploads/services/1780551660012-946343084.webp", "descriptions": ["<p>‍Brend menecmenti markanın şəxsiyyətini və reputasiyasını zamanla saxlamaq və gücləndirmək üçün davam edən prosesdir. Bu, brend qavrayışının monitorinqini, brend aktivlərinin idarə olunmasını və bütün brend təmas nöqtələrində ardıcıllığın təmin edilməsini əhatə edir. Trendlər müştərilərə brendlərinin zamanla güclü və aktual qalmasını təmin edən hərtərəfli brend idarəetmə strategiyaları hazırlamağa kömək edir. Agentliyimizin brend idarəçiliyi xidmətlərinə brend auditləri, brend monitorinqi və brend aktivlərinin idarə edilməsi daxildir.<br>‍<br>Brend auditləri, brendin dəyərlərinə və mesajlaşmalarına uyğun olduğundan əmin olmaq üçün brendin bütün aspektlərinin nəzərdən keçirilməsini əhatə edir.&nbsp;Brend monitorinqi potensial problemləri və ya imkanları müəyyən etmək üçün müxtəlif kanallar üzrə brend haqqında qeydləri və müştəri reaksiyalarını izləməyi əhatə edir.<br><br>Brend aktivlərinin idarə edilməsi loqotiplər və vizual elementlər kimi bütün brend aktivlərinin brendin paylaşımlar etdiyi platformalarda müasir və ardıcıl olmasını təmin etməyi nəzərdə tutur.</p>", "", ""], "quoteImageAlt": "jyugtregtrjyui"}, {"type": "overlay", "badge": "brending", "image": "/uploads/services/1780551724095-158944790.webp", "title": "<p>Brend Kimliyi:</p>", "imageAlt": "rtyuiohjgfdtyufr", "descriptions": ["<p>Brend identifikasiyası brendin vizual və emosional ifadəsidir. Bura müştərilərin marka ilə əlaqələndirdiyi bütün vizual elementlər, məsələn, loqolar, rəng sxemləri, tipoqrafiya və təsvirlər daxildir. Trendlər müştərilərə öz brendlərinin mahiyyətini əks etdirən, onları rəqiblərindən fərqləndirən, unikal və yaddaqalan brend şəxsiyyətlərini inkişaf etdirməyə kömək edir.&nbsp;Bizim brend identifikasiyası&nbsp;xidmətlərimizə&nbsp;loqo dizaynı,&nbsp;vizual brend dizaynı&nbsp;və&nbsp;brend stilistikası&nbsp;daxildir.<br>‍<br>Loqo dizaynı brendi təmsil edən fərqli vizual simvolun yaradılması prosesidir. Trenders-in dizayn komandası yaddaqalan,özünəməxsus və brend hekayəsinə uyğun loqolar hazırlamaq üçün müştərilərlə sıx əməkdaşlıq edir. Vizual brend dizaynına brendin şəxsiyyətini və dəyərlərini çatdıran hərtərəfli vizual elementlərin hazırlanması daxildir.&nbsp;</p>", ""]}]	2026-06-04 05:22:52.163	2026-06-08 14:17:14.155
1	02	brending	Berding	<p>brending</p>	<p>Korporativ üslubunuzu yaradaraq, rəqiblərinizdan fərqlənməyə kömək edirik.</p><p></p><p></p>	/uploads/services/1779433722983-3012510.webp	testtttttt	/uploads/services/1780550595826-813116340.gif	[{"label": "Brend Strategiyası"}, {"label": "Brend İdarəetmə:"}, {"label": "Brend Strategiyası"}, {"label": "Brend Mesajlaşması"}, {"label": "Brend Pozisyası"}, {"label": "Brend Kimliyi"}]	Portfolio	http://localhost:3001/portfolio	t	Daha etrafli	\N	t	1	t	[{"type": "hero", "badge": "Brending", "stats": [{"icon": "/uploads/services/1779449803746-543749434.svg", "label": " Kliklə", "value": "+98%"}, {"icon": "/uploads/services/1779449714136-432977405.svg", "label": "donusum", "value": "35%"}, {"icon": "/uploads/services/1779449718198-321165498.svg", "label": "teserruatlar", "value": " 2.3M"}, {"icon": "", "label": " Müştərilər", "value": "3456"}], "title": "<p>Hero</p><p></p>", "heroImage": "/uploads/services/1779436629407-52177413.webp", "quoteText": "<p><br>Trenders bizneslərə öz brendlərini yaratmaqda, məhsul və ya xidmətlərini <strong><em>effektiv şəkildə satmaqda kömək etmək üzrə ixtisaslaşaraq xidmət göstərən marketinq agentliyidir</em></strong></p>", "bottomImage": "/uploads/services/1779433979280-776107759.webp", "descriptions": ["<p>Müasir rəqabətli iş dünyasında brendinq hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib. Güclü brend biznese özünü rəqiblərindən fərqləndirməyə, müştəriləri arasında etibar və inam yaratmağa və istehlakçıların şüurunda qalıcı təəssürat yaratmağa kömək edə bilər.</p>", "<p>Müasir rəqabətli iş dünyasında brendinq hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib. Güclü brend biznese özünü rəqiblərindən fərqləndirməyə, müştəriləri arasında etibar və inam yaratmağa və istehlakçıların şüurunda qalıcı təəssürat yaratmağa kömək edə bilər.</p>"], "heroImageAlt": "testtttttt", "bottomImageAlt": "testtttttt"}, {"type": "content", "items": [{"badge": "brending", "image": "/uploads/services/1780497980044-625542941.webp", "quote": "<p><br>Agentliyimizin brend strategiyası xidmətlərinə <strong>bazar araşdırması, rəqabət təhlili, brend memarlığı və brend qaydaları daxildir</strong></p>", "title": "<h4>Brend<br>Strategİyası:</h4><p></p>", "badge2": "Brending", "number": "01", "title2": "<p>Brend<br>Strategİyası:</p>", "number2": "02", "subText": "<p>Trenders brend <strong>strategiyası, brend identifikasiyası, brend mesajlaşması, brendin pozisiyası və brendin idarə edilməsi</strong> də daxil olmaqla geniş çeşidli brendinq xidmətləri təklif edir. Xidmətlərimiz daxilində brendinq xidmətinizdən yararlanan şirkətlər üçün hazırladığımız dizayn və loqoları da görə bilərsiniz</p><p><br></p>", "imageAlt": "testtttttt", "quoteImage": "/uploads/services/1779433987940-300227323.webp", "descriptions": ["<p>Bazar araşdırması brend strategiyasının inkişafının vacib komponentidir. Trenders müştərilərinin hədəf auditoriyasını, ehtiyaclarını və üstünlüklərini daha yaxşı başa düşməyə kömək etmək üçün geniş bazar araşdırması aparır.<br><br>Bazar araşdırması brend strategiyasının inkişafının vacib komponentidir. Trenders müştərilərinin hədəf auditoriyasını, ehtiyaclarını və üstünlüklərini daha yaxşı başa düşməyə kömək etmək üçün geniş bazar araşdırması aparır.</p>", "<p></p>"], "descriptions2": ["<p>Brendin pozisiyası, markanın rəqiblərinə nisbətən bazarda özünəməxsus mövqeyinin müəyyən edilməsi prosesidir. Bu, bir markanın əsas üstünlüklərini və xüsusiyyətlərini müəyyənləşdirməyi və müştərilərə informasiyanı birbaşa şəkildə çatdırmağı əhatə edir. Trendlər müştərilərə onları rəqiblərindən fərqləndirən və müştəriləri ilə güclü emosional əlaqələr quran effektiv brend pozisiyası üçün strategiyaları hazırlamağa kömək edir. Bizim brendin bazar pozisiyası xidmətlərimizə brendin fərqləndirilməsi, hədəf auditoriya təhlili və brend mesajlaşması daxildir.<br><br>Brendin diferensiallaşdırılması, brendi rəqiblərindən nəyin fərqləndirdiyini müəyyən etmək prosesidir. Hədəf auditoriyasının təhlili bir markanın hədəf auditoriyasının ehtiyaclarını, üstünlüklərini başa düşməyi və onlarla birbaşa danışan mesajlaşmanı inkişaf etdirməyi əhatə edir. Nəhayət, brend mesajlaşması brendin xidmətlərini müştərilərə birbaşa şəkildə çatdıran aydın və qısa mesajın hazırlanmasını nəzərdə tutur.</p>", ""]}, {"badge": "Brending", "image": "/uploads/services/1780550282161-942494493.webp", "quote": "", "title": "<p>Brend<br>Strategİyası:</p>", "number": "02", "subText": "", "imageAlt": "testtt", "quoteImage": "", "descriptions": ["<p>Brendin pozisiyası, markanın rəqiblərinə nisbətən bazarda özünəməxsus mövqeyinin müəyyən edilməsi prosesidir. Bu, bir markanın əsas üstünlüklərini və xüsusiyyətlərini müəyyənləşdirməyi və müştərilərə informasiyanı birbaşa şəkildə çatdırmağı əhatə edir. Trendlər müştərilərə onları rəqiblərindən fərqləndirən və müştəriləri ilə güclü emosional əlaqələr quran effektiv brend pozisiyası üçün strategiyaları hazırlamağa kömək edir. Bizim brendin bazar pozisiyası xidmətlərimizə brendin fərqləndirilməsi, hədəf auditoriya təhlili və brend mesajlaşması daxildir.<br><br>Brendin diferensiallaşdırılması, brendi rəqiblərindən nəyin fərqləndirdiyini müəyyən etmək prosesidir. Hədəf auditoriyasının təhlili bir markanın hədəf auditoriyasının ehtiyaclarını, üstünlüklərini başa düşməyi və onlarla birbaşa danışan mesajlaşmanı inkişaf etdirməyi əhatə edir. Nəhayət, brend mesajlaşması brendin xidmətlərini müştərilərə birbaşa şəkildə çatdıran aydın və qısa mesajın hazırlanmasını nəzərdə tutur.</p>", ""]}]}, {"type": "quote", "badge": "ertyutr", "title": "<p>Quote</p>", "number": "03", "quoteText": "<p>Agentliyimizin brend strategiyası xidmətlərinə <strong>bazar araşdırması, rəqabət təhlili, brend memarlığı və brend qaydaları daxildir.</strong></p><p></p>", "quoteImage": "/uploads/services/1779434818475-814334343.webp", "descriptions": ["<p>‍Brend menecmenti markanın şəxsiyyətini və reputasiyasını zamanla saxlamaq və gücləndirmək üçün davam edən prosesdir. Bu, brend qavrayışının monitorinqini, brend aktivlərinin idarə olunmasını və bütün brend təmas nöqtələrində ardıcıllığın təmin edilməsini əhatə edir. Trendlər müştərilərə brendlərinin zamanla güclü və aktual qalmasını təmin edən hərtərəfli brend idarəetmə strategiyaları hazırlamağa kömək edir. Agentliyimizin brend idarəçiliyi xidmətlərinə brend auditləri, brend monitorinqi və brend aktivlərinin idarə edilməsi daxildir.<br>‍<br><br>Brend auditləri, brendin dəyərlərinə və mesajlaşmalarına uyğun olduğundan əmin olmaq üçün brendin bütün aspektlərinin nəzərdən keçirilməsini əhatə edir.&nbsp;Brend monitorinqi potensial problemləri və ya imkanları müəyyən etmək üçün müxtəlif kanallar üzrə brend haqqında qeydləri və müştəri reaksiyalarını izləməyi əhatə edir.<br><br>Brend aktivlərinin idarə edilməsi loqotiplər və vizual elementlər kimi bütün brend aktivlərinin brendin paylaşımlar etdiyi platformalarda müasir və ardıcıl olmasını təmin etməyi nəzərdə tutur.</p><p></p>", "<p></p>", "<p></p><p></p>"], "quoteImageAlt": "testtttttt"}, {"type": "overlay", "badge": "testt", "image": "/uploads/services/1780497005961-932570308.webp", "title": "<p>Brend Kimliyi Overlay</p>", "imageAlt": "testtttttt", "descriptions": ["<p>Brend identifikasiyası brendin vizual və emosional ifadəsidir. Bura müştərilərin marka ilə əlaqələndirdiyi bütün vizual elementlər, məsələn, loqolar, rəng sxemləri, tipoqrafiya və təsvirlər daxildir. Trendlər müştərilərə öz brendlərinin mahiyyətini əks etdirən, onları rəqiblərindən fərqləndirən, unikal və yaddaqalan brend şəxsiyyətlərini inkişaf etdirməyə kömək edir. Bizim brend identifikasiyası xidmətlərimizə loqo dizaynı, vizual brend dizaynı və brend stilistikası daxildir.</p><p></p>", "<p>Loqo dizaynı brendi təmsil edən fərqli vizual simvolun yaradılması prosesidir. Trenders-in dizayn komandası yaddaqalan, özünəməxsus və brend hekayəsinə uyğun loqolar hazırlamaq üçün müştərilərə sıx əməkdaşlıq edir. Vizual brend dizaynına brendin şəxsiyyətini və dəyərlərini çatdıran hərtərəfli vizual elementlərin hazırlanması daxildir.</p><p></p>"]}]	2026-05-22 06:56:58.835	2026-06-04 05:32:57.269
2	03	vebsayt	Vebsayt	<p>Vebsayt</p>	<p>Ziyarətçiləri potensial müştərilərə çevirəcək, istifadədə rahat və kreativ vebsayt hazırlayırıq.</p>	/uploads/services/1780493966379-604088332.webp	vebsite	\N	[{"label": "Veb-sayt dizaynı"}, {"label": "Brend Strategiyası:"}, {"label": "Brend İdarəetmə:"}, {"label": "Brend İdarəetmə:"}, {"label": "Brend İdarəetmə:"}, {"label": "Brend İdarəetmə:"}]	Portfolio	\N	t	Daha etrafli	\N	t	2	t	[{"type": "hero", "badge": "Brendinq", "stats": [{"icon": "/uploads/services/1779449581480-749589697.svg", "label": "Təəssüratlar", "value": "2.3M"}, {"icon": "/uploads/services/1779449788569-405085.svg", "label": "Musteri", "value": "3456"}, {"icon": "/uploads/services/1779449703072-455726153.svg", "label": "Klikler", "value": "+98%"}, {"icon": "", "label": "Təəssüratlar", "value": "435"}], "title": "<p>Sizi Trend Edəcək<br>Marketinq Agentliyi</p>", "heroImage": "/uploads/services/1779445010012-761967815.webp", "quoteText": "<p>Trenders bizneslərə öz&nbsp;brendlərini&nbsp;yaratmaqda, məhsul və ya xidmətlərini effektiv şəkildə satmaqda kömək etmək üzrə ixtisaslaşaraq xidmət göstərən&nbsp;marketinq agentliyidir.</p>", "bottomImage": "/uploads/services/1779444544100-24289104.webp", "descriptions": ["<p>Müasir rəqabətli iş dünyasında&nbsp;brendinq&nbsp;hər hansı uğurlu marketinq strategiyasının mühüm aspektinə çevrilib. Güclü brend biznesə özünü rəqiblərindən fərqləndirməyə, müştəriləri arasında etibar və inam yaratmağa və istehlakçıların şüurunda qalıcı təəssürat yaratmağa kömək edə bilər.<br><br>Məhz buna görə də getdikcə daha çox şirkət Bakıda, Azərbaycanda yerləşən yerli agentlik olan Trenders kimi marketinq agentliklərinin təqdim etdiyi brendinq xidmətlərinə müraciət edir.&nbsp;Trendersin&nbsp;fərqini bilmək üçün isə xidmətimizi bizdən eşidin.</p>", ""], "heroImageAlt": "hero", "bottomImageAlt": "hero"}, {"type": "content", "items": [{"badge": "Brending", "image": "/uploads/services/1779444689474-699279136.webp", "quote": "<p>Agentliyimizin brend strategiyası xidmətlərinə bazar araşdırması, rəqabət təhlili,&nbsp;brend memarlığı&nbsp;və&nbsp;brend qaydaları&nbsp;daxildir.</p>", "title": "<p>Brend<br>Strategİyası:</p>", "number": "01", "subText": "<p>Trenders&nbsp;brend strategiyası,&nbsp;brend identifikasiyası,&nbsp;brend mesajlaşması,&nbsp;brendin pozisiyası&nbsp;və&nbsp;brendin idarə edilməsi&nbsp;də daxil olmaqla geniş çeşiddə brendinq xidmətləri təklif edir. Xidmətlərimiz daxilində brendinq xidmətimizdən yararlanan şirkətlər üçün hazırladığımız&nbsp;dizayn&nbsp;və&nbsp;loqoları&nbsp;da görə bilərsiniz</p>", "imageAlt": "yansekil", "quoteImage": "/uploads/services/1779444661592-218916494.webp", "descriptions": ["<p>Bazar araşdırması brend strategiyasının inkişafının vacib komponentidir. Trenders müştərilərə hədəf auditoriyasını, ehtiyaclarını və üstünlüklərini daha yaxşı başa düşməyə kömək etmək üçün geniş bazar araşdırması aparır.<br><br>Bu tədqiqat əsas bazar tendensiyalarını, müştəri fikirlərini və brend strategiyasının inkişafına təsir edə biləcək rəqabət mühitini müəyyən etməyə kömək edir. Rəqabət təhlili müştərilərə rəqiblərini tanımağa və bazarda fərqlənmək imkanlarını müəyyən etməyə kömək edir.</p>", ""]}]}, {"type": "quote", "badge": "Brending", "title": "<p>Brend<br>Strategİyası:</p>", "number": "03", "quoteText": "<p>Brend memarlığı&nbsp;brend adları,&nbsp;loqolar&nbsp;və&nbsp;sloganlar&nbsp;kimi brend elementlərinin aydın iyerarxiyasının inkişaf etdirilməsi prosesidir</p>", "quoteImage": "/uploads/services/1779444921436-208989452.webp", "descriptions": ["<p>‍Brend menecmenti markanın şəxsiyyətini və reputasiyasını zamanla saxlamaq və gücləndirmək üçün davam edən prosesdir. Bu, brend qavrayışının monitorinqini, brend aktivlərinin idarə olunmasını və bütün brend təmas nöqtələrində ardıcıllığın təmin edilməsini əhatə edir. Trendlər müştərilərə brendlərinin zamanla güclü və aktual qalmasını təmin edən hərtərəfli brend idarəetmə strategiyaları hazırlamağa kömək edir. Agentliyimizin brend idarəçiliyi xidmətlərinə brend auditləri, brend monitorinqi və brend aktivlərinin idarə edilməsi daxildir.<br><br>Brend auditləri, brendin dəyərlərinə və mesajlaşmalarına uyğun olduğundan əmin olmaq üçün brendin bütün aspektlərinin nəzərdən keçirilməsini əhatə edir.&nbsp;Brend monitorinqi potensial problemləri və ya imkanları müəyyən etmək üçün müxtəlif kanallar üzrə brend haqqında qeydləri və müştəri reaksiyalarını izləməyi əhatə edir.<br><br>Brend auditləri, brendin dəyərlərinə və mesajlaşmalarına uyğun olduğundan əmin olmaq üçün brendin bütün aspektlərinin nəzərdən keçirilməsini əhatə edir.&nbsp;Brend monitorinqi potensial problemləri və ya imkanları müəyyən etmək üçün müxtəlif kanallar üzrə brend haqqında qeydləri və müştəri reaksiyalarını izləməyi əhatə edir.</p>", "", ""], "quoteImageAlt": "sitat"}, {"type": "overlay", "badge": "Overlay", "image": "/uploads/services/1779444840814-63146425.webp", "title": "<p>Brend Kimliyi:</p>", "imageAlt": "overlay", "descriptions": ["<p>Brend identifikasiyası brendin vizual və emosional ifadəsidir. Bura müştərilərin marka ilə əlaqələndirdiyi bütün vizual elementlər, məsələn, loqolar, rəng sxemləri, tipoqrafiya və təsvirlər daxildir. Trendlər müştərilərə öz brendlərinin mahiyyətini əks etdirən, onları rəqiblərindən fərqləndirən, unikal və yaddaqalan brend şəxsiyyətlərini inkişaf etdirməyə kömək edir.&nbsp;Bizim brend identifikasiyası&nbsp;xidmətlərimizə&nbsp;loqo dizaynı,&nbsp;vizual brend dizaynı&nbsp;və&nbsp;brend stilistikası&nbsp;daxildir.<br>‍<br>Loqo dizaynı brendi təmsil edən fərqli vizual simvolun yaradılması prosesidir. Trenders-in dizayn komandası yaddaqalan,özünəməxsus və brend hekayəsinə uyğun loqolar hazırlamaq üçün müştərilərlə sıx əməkdaşlıq edir. Vizual brend dizaynına brendin şəxsiyyətini və dəyərlərini çatdıran hərtərəfli vizual elementlərin hazırlanması daxildir.&nbsp;</p>", ""]}]	2026-05-22 10:15:31.161	2026-06-04 05:33:01.528
\.


--
-- TOC entry 5438 (class 0 OID 16626)
-- Dependencies: 227
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials (id, image, "order", "sectionId", "createdAt", "updatedAt", "altText", company, quote, name, role) FROM stdin;
8	/uploads/testimonials/1781010906255-756460078.webp	0	19	2026-06-09 13:15:06.284	2026-06-10 06:54:07.822	testt	{"az": "Mazda"}	{"az": "Layihəmizə etibarlı tərəfdaş kimi real dəyər qatırlar."}	{"az": "Asur cabiyev"}	{"az": "Chief Marketing Officer @ Group Motors LTD | Strategic management, Logistics Management"}
\.


--
-- TOC entry 5436 (class 0 OID 16611)
-- Dependencies: 225
-- Data for Name: testimonials_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials_sections (id, "createdAt", "updatedAt", title, description) FROM stdin;
19	2026-06-09 13:13:24.938	2026-06-10 06:54:09.872	{"az": "Müştəri Rəyləri"}	{"az": "Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq “Young Lions” proqramının Azərbaycan üzrə Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynə az", "en": "Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq “Young Lions” proqramının Azərbaycan üzrə Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynə en", "ru": "Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynəlxalq “Young Lions” proqramının Azərbaycan üzrə Young Lions Azerbaijan 30 yaşadək yaradıcı, media və marketinq mütəxəssisləri üçün nəzərdə tutulmuş beynə ru"}
\.


--
-- TOC entry 5446 (class 0 OID 17434)
-- Dependencies: 235
-- Data for Name: vacancy_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vacancy_settings (id, email, "emailHref", phone, "phoneHref", "createdAt", "updatedAt", "backLabel", "applyTitle", "aboutRoleLabel", "skillsLabel", "responsibleLabel", "requirementsLabel", location, "emailLabel", "phoneLabel", "locationLabel", "formCvLabel", "formCvPlaceholder", "formEmailLabel", "formEmailPlaceholder", "formMessageLabel", "formMessagePlaceholder", "formNameLabel", "formNamePlaceholder", "formPhoneLabel", "formPhonePlaceholder", "formSubmitLabel") FROM stdin;
1	trenders@gmail.com		+994 50 876 67 67		2026-05-20 07:59:35.719	2026-06-10 10:29:12.185	{"az": "Vakansiyalar"}	{"az": "Aplly now"}	{"az": "About the role az", "en": "About the role en", "ru": "About the role ru"}	{"az": "skills"}	{"az": "responsible"}	{"az": "requirement"}	{"az": "Baki,Azerbaijan"}	{"az": "Email Adres"}	{"az": "Phone"}	{"az": "Location"}	{"az": "CV yüklə*"}	{"az": "pdf, png, jpg"}	{"az": "Email"}	{"az": " Your email*"}	{"az": "Message"}	{"az": "Your message"}	{"az": "Name"}	{"az": "Your name"}	{"az": " Your email*"}	{"az": "Your phone*"}	{"az": "Göndə"}
\.


--
-- TOC entry 5486 (class 0 OID 38281)
-- Dependencies: 275
-- Data for Name: vacancy_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vacancy_submissions (id, name, email, phone, message, "cvUrl", "vacancyId", "vacancyTitle", "createdAt") FROM stdin;
1	Aitaj Chodarli	aitaj.c@omnuvex.net	+994 50 000 00 00	Hi !	/uploads/cv/1780989613636-425037083.pdf	6	Senior Marketing	2026-06-09 07:20:13.65
2	Ajdar Kalbiyev	aitaj.c@omnuvex.net	+994 50 000 00 00	\N	/uploads/cv/1780990277712-712790725.pdf	6	Senior Marketing	2026-06-09 07:31:17.736
3	Orxan Hesenov	aitaj.c@gmail.com	+994 50 988 23 43	poiujytgrewdefrtyjukijhgbfds	/uploads/cv/1780990591593-506754865.pdf	6	Senior Marketing	2026-06-09 07:36:31.61
4	Test Testov	aitaj.c@gmail.com	9876543	plokijuhygtfrdesxdcfvgbhnjk	/uploads/cv/1780990848261-296224472.pdf	6	Senior Marketing	2026-06-09 07:40:48.267
5	poiuytrewsdfghjkl	oiujygtrfde@gmail.com	98765	plokijuhygtfrdesxdcfvgbhnjm	/uploads/cv/1780992026842-968135170.pdf	6	Senior Marketing	2026-06-09 08:00:26.868
6	ttttttttttttttt	frrrrrrrrrrr@gmail.com	444	tttttttttttttt	/uploads/cv/1780992308462-460891200.pdf	6	Senior Marketing	2026-06-09 08:05:08.485
7	qqqqqqqqq	aaaaaaaaaa@gmail.com	11111111111	qqqqqqqqqqqqqq	/uploads/cv/1780992677875-385421456.pdf	6	Senior Marketing	2026-06-09 08:11:17.881
8	qqqqqqwwwwwwww	2wwwwwwwwwwwww@gmail.com	22222222222222	wwwwwwwwwwwwww	/uploads/cv/1780992696690-997651825.pdf	6	Senior Marketing	2026-06-09 08:11:36.696
9	error	error@gmail.com	987654345	errorerrorerror error	/uploads/cv/1781010978281-20579948.pdf	8	SMM	2026-06-09 13:16:18.301
\.


--
-- TOC entry 5520 (class 0 OID 0)
-- Dependencies: 228
-- Name: VacancyCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."VacancyCategory_id_seq"', 7, true);


--
-- TOC entry 5521 (class 0 OID 0)
-- Dependencies: 232
-- Name: VacancyPageHeader_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."VacancyPageHeader_id_seq"', 1, true);


--
-- TOC entry 5522 (class 0 OID 0)
-- Dependencies: 230
-- Name: Vacancy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Vacancy_id_seq"', 8, true);


--
-- TOC entry 5523 (class 0 OID 0)
-- Dependencies: 252
-- Name: about_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.about_settings_id_seq', 1, true);


--
-- TOC entry 5524 (class 0 OID 0)
-- Dependencies: 244
-- Name: blog_authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_authors_id_seq', 7, true);


--
-- TOC entry 5525 (class 0 OID 0)
-- Dependencies: 246
-- Name: blog_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_categories_id_seq', 9, true);


--
-- TOC entry 5526 (class 0 OID 0)
-- Dependencies: 250
-- Name: blog_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_settings_id_seq', 1, true);


--
-- TOC entry 5527 (class 0 OID 0)
-- Dependencies: 248
-- Name: blogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blogs_id_seq', 16, true);


--
-- TOC entry 5528 (class 0 OID 0)
-- Dependencies: 268
-- Name: contact_budget_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_budget_options_id_seq', 2, true);


--
-- TOC entry 5529 (class 0 OID 0)
-- Dependencies: 264
-- Name: contact_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_settings_id_seq', 1, true);


--
-- TOC entry 5530 (class 0 OID 0)
-- Dependencies: 266
-- Name: contact_social_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_social_links_id_seq', 1, true);


--
-- TOC entry 5531 (class 0 OID 0)
-- Dependencies: 272
-- Name: contact_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_submissions_id_seq', 24, true);


--
-- TOC entry 5532 (class 0 OID 0)
-- Dependencies: 270
-- Name: contact_timeline_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_timeline_options_id_seq', 2, true);


--
-- TOC entry 5533 (class 0 OID 0)
-- Dependencies: 222
-- Name: faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faqs_id_seq', 6, true);


--
-- TOC entry 5534 (class 0 OID 0)
-- Dependencies: 260
-- Name: footer_nav_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.footer_nav_links_id_seq', 8, true);


--
-- TOC entry 5535 (class 0 OID 0)
-- Dependencies: 258
-- Name: footer_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.footer_settings_id_seq', 1, true);


--
-- TOC entry 5536 (class 0 OID 0)
-- Dependencies: 262
-- Name: footer_social_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.footer_social_links_id_seq', 3, true);


--
-- TOC entry 5537 (class 0 OID 0)
-- Dependencies: 256
-- Name: nav_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nav_links_id_seq', 6, true);


--
-- TOC entry 5538 (class 0 OID 0)
-- Dependencies: 254
-- Name: navbar_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.navbar_settings_id_seq', 1, true);


--
-- TOC entry 5539 (class 0 OID 0)
-- Dependencies: 238
-- Name: partner_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_sections_id_seq', 1, true);


--
-- TOC entry 5540 (class 0 OID 0)
-- Dependencies: 240
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partners_id_seq', 8, true);


--
-- TOC entry 5541 (class 0 OID 0)
-- Dependencies: 236
-- Name: portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolios_id_seq', 12, true);


--
-- TOC entry 5542 (class 0 OID 0)
-- Dependencies: 220
-- Name: product_owners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_owners_id_seq', 1, true);


--
-- TOC entry 5543 (class 0 OID 0)
-- Dependencies: 242
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 3, true);


--
-- TOC entry 5544 (class 0 OID 0)
-- Dependencies: 226
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 8, true);


--
-- TOC entry 5545 (class 0 OID 0)
-- Dependencies: 224
-- Name: testimonials_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.testimonials_sections_id_seq', 19, true);


--
-- TOC entry 5546 (class 0 OID 0)
-- Dependencies: 234
-- Name: vacancy_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vacancy_settings_id_seq', 1, true);


--
-- TOC entry 5547 (class 0 OID 0)
-- Dependencies: 274
-- Name: vacancy_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vacancy_submissions_id_seq', 9, true);


--
-- TOC entry 5219 (class 2606 OID 16820)
-- Name: VacancyCategory VacancyCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VacancyCategory"
    ADD CONSTRAINT "VacancyCategory_pkey" PRIMARY KEY (id);


--
-- TOC entry 5224 (class 2606 OID 16855)
-- Name: VacancyPageHeader VacancyPageHeader_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VacancyPageHeader"
    ADD CONSTRAINT "VacancyPageHeader_pkey" PRIMARY KEY (id);


--
-- TOC entry 5221 (class 2606 OID 16841)
-- Name: Vacancy Vacancy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vacancy"
    ADD CONSTRAINT "Vacancy_pkey" PRIMARY KEY (id);


--
-- TOC entry 5208 (class 2606 OID 16400)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5249 (class 2606 OID 33562)
-- Name: about_settings about_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.about_settings
    ADD CONSTRAINT about_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5238 (class 2606 OID 25192)
-- Name: blog_authors blog_authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_authors
    ADD CONSTRAINT blog_authors_pkey PRIMARY KEY (id);


--
-- TOC entry 5241 (class 2606 OID 25209)
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5247 (class 2606 OID 26096)
-- Name: blog_settings blog_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_settings
    ADD CONSTRAINT blog_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5244 (class 2606 OID 25245)
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- TOC entry 5265 (class 2606 OID 36801)
-- Name: contact_budget_options contact_budget_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_budget_options
    ADD CONSTRAINT contact_budget_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5261 (class 2606 OID 36771)
-- Name: contact_settings contact_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_settings
    ADD CONSTRAINT contact_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5263 (class 2606 OID 36787)
-- Name: contact_social_links contact_social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_social_links
    ADD CONSTRAINT contact_social_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5269 (class 2606 OID 36834)
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5267 (class 2606 OID 36815)
-- Name: contact_timeline_options contact_timeline_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_timeline_options
    ADD CONSTRAINT contact_timeline_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5213 (class 2606 OID 16467)
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- TOC entry 5257 (class 2606 OID 35549)
-- Name: footer_nav_links footer_nav_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_nav_links
    ADD CONSTRAINT footer_nav_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5255 (class 2606 OID 35527)
-- Name: footer_settings footer_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_settings
    ADD CONSTRAINT footer_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5259 (class 2606 OID 35568)
-- Name: footer_social_links footer_social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_social_links
    ADD CONSTRAINT footer_social_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5253 (class 2606 OID 34479)
-- Name: nav_links nav_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nav_links
    ADD CONSTRAINT nav_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5251 (class 2606 OID 34457)
-- Name: navbar_settings navbar_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.navbar_settings
    ADD CONSTRAINT navbar_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5231 (class 2606 OID 20917)
-- Name: partner_sections partner_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_sections
    ADD CONSTRAINT partner_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5233 (class 2606 OID 20939)
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- TOC entry 5228 (class 2606 OID 18253)
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- TOC entry 5211 (class 2606 OID 16415)
-- Name: product_owners product_owners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_owners
    ADD CONSTRAINT product_owners_pkey PRIMARY KEY (id);


--
-- TOC entry 5235 (class 2606 OID 22045)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 5217 (class 2606 OID 16645)
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 2606 OID 16624)
-- Name: testimonials_sections testimonials_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials_sections
    ADD CONSTRAINT testimonials_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5226 (class 2606 OID 17473)
-- Name: vacancy_settings vacancy_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancy_settings
    ADD CONSTRAINT vacancy_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5271 (class 2606 OID 38295)
-- Name: vacancy_submissions vacancy_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacancy_submissions
    ADD CONSTRAINT vacancy_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5222 (class 1259 OID 19582)
-- Name: Vacancy_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Vacancy_slug_key" ON public."Vacancy" USING btree (slug);


--
-- TOC entry 5239 (class 1259 OID 28549)
-- Name: blog_authors_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_authors_slug_key ON public.blog_authors USING btree (slug);


--
-- TOC entry 5242 (class 1259 OID 25246)
-- Name: blog_categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_categories_slug_key ON public.blog_categories USING btree (slug);


--
-- TOC entry 5245 (class 1259 OID 25247)
-- Name: blogs_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blogs_slug_key ON public.blogs USING btree (slug);


--
-- TOC entry 5229 (class 1259 OID 18254)
-- Name: portfolios_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX portfolios_slug_key ON public.portfolios USING btree (slug);


--
-- TOC entry 5209 (class 1259 OID 16416)
-- Name: product_owners_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_owners_email_key ON public.product_owners USING btree (email);


--
-- TOC entry 5236 (class 1259 OID 22046)
-- Name: services_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX services_slug_key ON public.services USING btree (slug);


--
-- TOC entry 5273 (class 2606 OID 16856)
-- Name: Vacancy Vacancy_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vacancy"
    ADD CONSTRAINT "Vacancy_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."VacancyCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5275 (class 2606 OID 25248)
-- Name: blogs blogs_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT "blogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.blog_authors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5276 (class 2606 OID 25253)
-- Name: blogs blogs_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT "blogs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.blog_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5281 (class 2606 OID 36840)
-- Name: contact_budget_options contact_budget_options_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_budget_options
    ADD CONSTRAINT "contact_budget_options_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public.contact_settings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5280 (class 2606 OID 36835)
-- Name: contact_social_links contact_social_links_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_social_links
    ADD CONSTRAINT "contact_social_links_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public.contact_settings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5282 (class 2606 OID 36845)
-- Name: contact_timeline_options contact_timeline_options_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_timeline_options
    ADD CONSTRAINT "contact_timeline_options_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public.contact_settings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5278 (class 2606 OID 35569)
-- Name: footer_nav_links footer_nav_links_footerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_nav_links
    ADD CONSTRAINT "footer_nav_links_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES public.footer_settings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5279 (class 2606 OID 35574)
-- Name: footer_social_links footer_social_links_footerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footer_social_links
    ADD CONSTRAINT "footer_social_links_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES public.footer_settings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5277 (class 2606 OID 34480)
-- Name: nav_links nav_links_navbarId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nav_links
    ADD CONSTRAINT "nav_links_navbarId_fkey" FOREIGN KEY ("navbarId") REFERENCES public.navbar_settings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5274 (class 2606 OID 20940)
-- Name: partners partners_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT "partners_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public.partner_sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5272 (class 2606 OID 16646)
-- Name: testimonials testimonials_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT "testimonials_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public.testimonials_sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-06-10 16:20:09

--
-- PostgreSQL database dump complete
--

\unrestrict aBJxvapYZeEqs5WTNclGKWDcyZvcf1N3bpNbAFhUhTaN9wXzeoucS7XFgEOjXom

