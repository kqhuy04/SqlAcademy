ALTER TABLE refresh_tokens
RENAME COLUMN token_hash TO token;

ALTER TABLE refresh_tokens
ADD CONSTRAINT uq_refresh_tokens_token UNIQUE (token);