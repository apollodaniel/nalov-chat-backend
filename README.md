# app-chat-backend


### Estructure

#### Tabela usuarios
- id TEXT PRIMARY KEY NOT NULL
- username TEXT NOT NULL UNIQUE
- name TEXT NOT NULL
- password TEXT NOT NULL

#### Messages
- id TEXT PRIMARY KEY NOT NULL
- content TEXT NOT NULL
- date BIGINT NOT NULL
- sender_id TEXT
- receiver_id TEXT

#### auth
- token TEXT PRIMARY KEY NOT NULL
- user_id TEXT
