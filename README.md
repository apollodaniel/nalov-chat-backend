# app-chat-backend


### Todo
 - Handle expired auth token errors
 - Adicionar cripografia no envio e recebimento de informações


### Estructure

#### Tabela usuarios
- id TEXT PRIMARY KEY NOT NULL
- username TEXT NOT NULL UNIQUE
- name TEXT NOT NULL
- password TEXT NOT NULL
- profile_picture TEXT NOT NULL

#### Messages
- id TEXT PRIMARY KEY NOT NULL
- content TEXT NOT NULL
- date BIGINT NOT NULL
- sender_id TEXT
- receiver_id TEXT
- attachment TEXT NOT NULL REFERES TO




#### auth
- token TEXT PRIMARY KEY NOT NULL
- user_id TEXT
