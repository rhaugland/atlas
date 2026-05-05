-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    interests TEXT[] DEFAULT '{}',
    reading_volume TEXT DEFAULT 'moderate',
    onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles
CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content_text TEXT,
    reading_time_min INTEGER,
    quality_score REAL DEFAULT 0.5,
    domain TEXT,
    published_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Concepts
CREATE TABLE public.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    difficulty TEXT DEFAULT 'intermediate',
    description TEXT
);

-- Concept relationships
CREATE TABLE public.concept_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_a UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    concept_b UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    relation_type TEXT DEFAULT 'related',
    UNIQUE(concept_a, concept_b)
);

-- Which concepts appear in which articles
CREATE TABLE public.article_concepts (
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, concept_id)
);

-- User knowledge profile
CREATE TABLE public.user_concepts (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    familiarity_score INTEGER DEFAULT 0,
    last_encountered_at TIMESTAMPTZ DEFAULT NOW(),
    reaction_count INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, concept_id)
);

-- Reading history
CREATE TABLE public.user_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    time_spent_seconds INTEGER DEFAULT 0,
    completion_pct REAL DEFAULT 0,
    read_at TIMESTAMPTZ DEFAULT NOW()
);

-- Concept reactions
CREATE TABLE public.user_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL CHECK (reaction IN ('knew_this', 'new_to_me', 'mind_blown')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, article_id, concept_id)
);

-- Indexes
CREATE INDEX idx_articles_domain ON public.articles(domain, published_at DESC);
CREATE INDEX idx_article_concepts_concept ON public.article_concepts(concept_id);
CREATE INDEX idx_user_concepts_user ON public.user_concepts(user_id, familiarity_score);
CREATE INDEX idx_user_reads_user ON public.user_reads(user_id, read_at DESC);
CREATE INDEX idx_user_reactions_user ON public.user_reactions(user_id);

-- RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users read own concepts" ON public.user_concepts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users modify own concepts" ON public.user_concepts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own reads" ON public.user_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reads" ON public.user_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own reactions" ON public.user_reactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reactions" ON public.user_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for articles and concepts
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are public" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Concepts are public" ON public.concepts FOR SELECT USING (true);
CREATE POLICY "Article concepts are public" ON public.article_concepts FOR SELECT USING (true);
CREATE POLICY "Concept relations are public" ON public.concept_relations FOR SELECT USING (true);
