CREATE TABLE IF NOT EXISTS disciplines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    discipline_id INTEGER NOT NULL,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(160) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_topics_discipline
        FOREIGN KEY (discipline_id)
        REFERENCES disciplines(id)
        ON DELETE CASCADE,

    CONSTRAINT topics_discipline_slug_unique
        UNIQUE (discipline_id, slug)
);

CREATE TABLE IF NOT EXISTS subtopics (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL,
    name VARCHAR(180) NOT NULL,
    slug VARCHAR(180) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_subtopics_topic
        FOREIGN KEY (topic_id)
        REFERENCES topics(id)
        ON DELETE CASCADE,

    CONSTRAINT subtopics_topic_slug_unique
        UNIQUE (topic_id, slug)
);

CREATE TABLE IF NOT EXISTS statements (
    id SERIAL PRIMARY KEY,
    subtopic_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    correct_answer BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_statements_subtopic
        FOREIGN KEY (subtopic_id)
        REFERENCES subtopics(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_topics_discipline_id
    ON topics(discipline_id);

CREATE INDEX IF NOT EXISTS idx_subtopics_topic_id
    ON subtopics(topic_id);

CREATE INDEX IF NOT EXISTS idx_statements_subtopic_id
    ON statements(subtopic_id);