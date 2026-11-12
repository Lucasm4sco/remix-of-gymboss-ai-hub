# Plano: remediar os 3 alertas do sharp

## Diagnóstico (somente leitura)

Árvore atual no bun.lock. É a mesma para os 3 alertas: librsvg, libvips e libheif.

```text
package.json -> @cloudflare/vite-plugin 1.33.1
  ├─ miniflare 4.20260421.0 (exige sharp ^0.34.5) -> sharp 0.34.5
  └─ wrangler 4.84.1 -> miniflare 4.20260421.0 (mesma instância)
```

- Não há outro caminho até o sharp. O app não importa sharp.
- O miniflare só carrega sharp de forma tardia (`await import("sharp")`), na simulação local do recurso de imagens da Cloudflare. O `wrangler.jsonc` não declara esse recurso, então o sharp não roda no site publicado nem na compilação. Na prática, o risco fica no preview local.
- Versões que corrigem: 0.35.0 resolve o alerta do libvips, 0.35.4 o do libheif e 0.35.5 o do librsvg. A menor versão que fecha os 3 é a **0.35.5**.
- Atualizar o plugin não resolve: o mais recente (1.69.0) usa miniflare 5 beta com sharp 0.35.2, ainda afetado pelo librsvg, e arrasta uma troca grande de wrangler e workerd.
- Plataforma: sharp 0.35.5 pede Node >=20.9 (o sandbox tem 22.23) e traz binários nativos novos de @img/* (linux-x64 e linuxmusl-x64 já existem aqui).
- **Divergência encontrada:** o package-lock.json resolveu @cloudflare/vite-plugin 1.38.0, miniflare 4.20260521.0 e wrangler 4.94.0, enquanto o bun.lock tem 1.33.1 / 4.20260421.0 / 4.84.1. A sincronização anterior ficou incompleta nesses pacotes e precisa ser corrigida junto.

## Recomendação

1. Adicionar ao bloco `overrides` existente: `"sharp": "0.35.5"`. Os outros overrides não mudam.
2. Fixar `@cloudflare/vite-plugin` em `1.33.1` (versão exata). Assim os dois lockfiles resolvem o mesmo grafo.
3. Gerar de novo o bun.lock e depois o package-lock.json (`npm install --package-lock-only --ignore-scripts --legacy-peer-deps`). Em seguida, comparar as versões de vite-plugin, miniflare, wrangler, sharp e @img/* nos dois arquivos.

Risco: o miniflare declara `^0.34.5` e o override ignora essa faixa. A troca de 0.34 para 0.35 pode mudar a API, mas só afeta a simulação local de imagens, que este projeto não usa.

## Validações

- Rodar de novo a verificação de dependências: esperado 0 alertas do sharp.
- Confirmar que as versões são iguais no bun.lock e no package-lock.json.
- Compilação (vite build) e `bun test` (os 8 testes existentes).
- Abrir o preview local (`/`, `/entrar`) e conferir que o servidor reiniciou sem erro no log.
- `node -e "import('sharp').then(s=>console.log(s.default.versions))"` para confirmar que o binário nativo carrega.

Se algo falhar, remover o override do sharp e manter os 3 alertas como risco aceito, por ser só de desenvolvimento.
