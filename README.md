# 🌿 HortaFresh — Gestão de Verduras

App de gestão completo para feirantes e distribuidores de verduras.

## Funcionalidades

- 📊 **Resumo** — lucro da semana, totais e produto destaque
- 📦 **Compras** — por caixa, com nome do fornecedor
- 💰 **Vendas** — por caixa, com nome do cliente
- 💸 **Gastos** — com categorias (frete, embalagem, funcionário…)
- 👥 **Contatos** — cadastro de fornecedores e clientes
- 📄 **Relatório Diário** — gera texto formatado para copiar no WhatsApp
- 📋 **Fechamento Semanal** — resultado completo com margem e ranking

## Deploy no Vercel (passo a passo)

### Opção 1 — Via GitHub (recomendado)

1. Crie um repositório no [github.com](https://github.com/new)
2. Faça upload desta pasta (arraste os arquivos ou use `git push`)
3. Acesse [vercel.com](https://vercel.com) → **Add New Project**
4. Importe o repositório do GitHub
5. Clique em **Deploy** — pronto! ✅

### Opção 2 — Via Vercel CLI

```bash
# Instalar o CLI do Vercel
npm install -g vercel

# Dentro desta pasta, rodar:
vercel

# Seguir as instruções no terminal
# Na primeira vez vai pedir login e confirmar as configurações
```

### Opção 3 — Deploy direto (arrastar pasta)

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Arraste esta pasta inteira para a área indicada
3. Clique em **Deploy**

## Rodar localmente

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

## Estrutura

```
hortafresh/
├── src/app/
│   ├── layout.tsx     # HTML base, meta tags, PWA
│   ├── page.tsx       # Entrada da página
│   └── App.tsx        # Todo o app (lógica + UI)
├── public/
│   └── manifest.json  # PWA manifest
├── package.json
├── next.config.js
└── README.md
```
