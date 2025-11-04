# (Desafio) Microsserviço de Cadastro de Clientes

[![CI - Build & Test](https://github.com/SEU_USUARIO/SEU_REPOSITORIO/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU_USUARIO/SEU_REPOSITORIO/actions/workflows/ci.yml)

Este projeto é uma solução de backend robusta para o gerenciamento de clientes, construída seguindo os princípios da **Clean Architecture** e **SOLID**. O sistema foi desenvolvido em **Node.js** com **TypeScript**, utilizando **NestJS** como framework principal.

Ele foi projetado para ser resiliente, escalável e fácil de manter, fazendo uso de tecnologias modernas como **MongoDB**, **Redis** (para cache) e **RabbitMQ** (para mensageria assíncrona).

## ✨ Stack de Tecnologias

- **Framework:** NestJS (sobre Node.js + TypeScript)
- **Banco de Dados:** MongoDB (com Mongoose)
- **Cache:** Redis
- **Mensageria:** RabbitMQ
- **Containerização:** Docker & Docker Compose
- **Testes:** Jest
- **Linter/Formatter:** ESLint + Prettier

---

## ⚙️ CI/CD (Integração Contínua)

Este projeto utiliza **GitHub Actions** para automação de build e testes.

O pipeline de CI (definido em `.github/workflows/ci.yml`) é acionado em todo `push` ou `pull_request` para a branch `main` e executa as seguintes etapas:

1.  Instalação de dependências (com cache).
2.  Execução do Linter (`pnpm run lint`).
3.  Execução dos Testes Unitários (`pnpm run test`).
4.  Build da aplicação (`pnpm run build`).
5.  Build da imagem Docker (para validar o `Dockerfile`).

Isso garante que apenas código saudável e que passe em todos os testes possa ser integrado à branch principal.

---

## 🏛️ Arquitetura do Projeto

O projeto segue estritamente os princípios da **Clean Architecture** (Arquitetura Limpa), dividindo o sistema em camadas de responsabilidade com uma regra de dependência clara: **de fora para dentro**.

As camadas mais internas (Domínio) não sabem nada sobre as camadas externas (Infraestrutura).

- **`src/domain`**: O núcleo do sistema. Contém as entidades de negócio puras (ex: `Cliente`) e as interfaces (contratos) dos repositórios. Não tem dependências de frameworks.
- **`src/application`**: Orquestra o fluxo de dados. Contém os Casos de Uso (ex: `CreateClienteUseCase`) e os DTOs. Depende apenas das interfaces do Domínio.
- **`src/infrastructure`**: A camada mais externa. Contém os "detalhes" e frameworks, como:
  - **`http`**: Controllers (NestJS) que expõem a API.
  - **`database`**: Implementações concretas dos repositórios (usando Mongoose).
  - **`messaging`**: Implementação do publisher (RabbitMQ) e os consumers.
  - **`cache`**: Configuração do Redis.

Essa separação garante altíssima testabilidade e facilita a manutenção ou substituição de qualquer tecnologia (ex: trocar Mongoose por Prisma, ou RabbitMQ por Kafka) sem impactar as regras de negócio.

---

## 🚀 Como Executar (Recomendado: Docker)

Este é o método mais simples e recomendado para executar toda a stack (aplicação, banco, cache e broker) de forma isolada.

### 1. Pré-requisitos

- Docker
- Docker Compose

### 2. Configuração

Não é necessário criar um arquivo `.env`. O `docker-compose.yml` já injeta as variáveis de ambiente corretas para a comunicação entre os contêineres.

### 3. Execução

Na raiz do projeto, execute:

```bash
# O '--build' é necessário na primeira vez ou se houver mudanças no Dockerfile
docker-compose up --build
```

A API estará disponível em `http://localhost:3000`.

**Serviços Auxiliares:**

- **RabbitMQ (Management):** `http://localhost:15672` (Login: `guest` / `guest`)
- **MongoDB:** `mongodb://localhost:27017`
- **Redis:** `localhost:6379`

---

## 👨‍💻 Como Executar (Desenvolvimento Local)

Este método é ideal para desenvolvimento, pois o NestJS recarregará a aplicação a cada mudança (`start:dev`).

### 1. Pré-requisitos

- Node.js (v18+)
- pnpm (ou `npm`/`yarn`)
- Instâncias do MongoDB, Redis e RabbitMQ rodando localmente (recomendado usar o Docker para isso).

### 2. Subindo a Infraestrutura

Se você não tem o Mongo/Redis/RabbitMQ instalados localmente, suba _apenas_ eles com o Docker:

```bash
docker-compose up -d mongo redis rabbitmq
```

### 3. Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`:

```ini
# .env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/clientesdb
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URI=amqp://guest:guest@localhost:5672
```

### 4. Instalação e Execução

```bash
# Instalar dependências
pnpm install

# Rodar em modo de desenvolvimento
pnpm run start:dev
```

A API estará disponível em `http://localhost:3000`.

---

## 🧪 Como Executar os Testes

Executamos os testes unitários com o Jest. Os testes cobrem 100% da nossa camada de Domínio e Aplicação (Casos de Uso), mockando a camada de infraestrutura.

```bash
# Rodar todos os testes
pnpm run test

# Rodar testes em modo 'watch'
pnpm run test:watch

# Ver relatório de cobertura
pnpm run test:cov
```

---

## 🗺️ Endpoints da API

A URL base é `http://localhost:3000`.

### Cliente

| Método   | Rota            | Descrição                                            | Body (Exemplo)                                                                |
| :------- | :-------------- | :--------------------------------------------------- | :---------------------------------------------------------------------------- |
| `POST`   | `/clientes`     | Cadastra um novo cliente.                            | `{"nome": "Bruce Wayne", "email": "bruce@wayne.com", "telefone": "555-0100"}` |
| `GET`    | `/clientes`     | Lista todos os clientes.                             | N/A                                                                           |
| `GET`    | `/clientes/:id` | Busca um cliente por ID. (Cacheado no Redis por 60s) | N/A                                                                           |
| `PATCH`  | `/clientes/:id` | Atualiza dados de um cliente (parcial).              | `{"nome": "Bruce Wayne (Batman)"}`                                            |
| `DELETE` | `/clientes/:id` | Deleta um cliente.                                   | N/A                                                                           |
