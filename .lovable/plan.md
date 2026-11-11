# Investigação: "Exposed personal & sensitive data" (1 Warning)

## Resultado
O aviso não é genérico: o scanner o marcou como **vulnerabilidade confirmada** (`verificationConfirmed: true`, controle `LOV.INFO.SENSITIVE_LOG_REDACTION.V1`). Mas ele foi gerado **antes** da correção já feita, e o registro da varredura está desatualizado (`up_to_date: false`, varredura de 17:36 UTC, varredura completa não finalizada).

## Evidências do finding
- **Entrada:** `src/lib/email-client.ts`, linhas 12-13 — função de servidor `enviarEmail` (POST), sem verificação de login (`authoredAccessMode: public`). Qualquer pessoa podia chamá-la com um e-mail válido e qualquer conteúdo no campo `data`.
- **Operação/impacto citado:** `src/lib/email-stub.server.ts`, linha 23 — o código antigo era `console.log("[EMAIL STUB] ...", JSON.stringify(payload, null, 2))`, gravando destinatário, assunto e todo o `data` (incluindo senhas geradas de administrador, enviadas por `novaAcademia.tsx` linha 56 e `listaAcademias.tsx` linha 42) nos logs do servidor.
- **Não envolve banco de dados:** nenhuma tabela, coluna, política de acesso, grant ou view é citada. As outras verificações (banco, dependências, app) estão sem findings.

## Estado atual do código (verificado agora)
- A linha 23 hoje registra só a mensagem fixa `"[EMAIL STUB] (Resend nao configurado)"`; o conteúdo não é mais gravado. A causa citada **já foi eliminada**.
- Outros logs do projeto (`start.ts`, `server.ts`, `__root.tsx`, arquivos gerados de integração) registram apenas erros, não conteúdos de formulário.

## Risco residual (fora do alerta)
- `enviarEmail` continua aberta a qualquer pessoa. Hoje não faz nada (stub), então o impacto é nulo. Quando um provedor real de e-mail for ligado, ela viraria um envio aberto (spam e mensagens falsas em nome da academia). Isso é outro problema, não o deste alerta.
- Logs antigos gravados antes da correção podem ainda conter os dados; não há como apagá-los por aqui.

## Correção mínima proposta
1. Nenhuma mudança de código para este alerta: rodar nova varredura completa e, se o finding não reaparecer, marcá-lo como corrigido.
2. Opcional, só com sua autorização: exigir login de super admin em `enviarEmail` antes de ativar um provedor de e-mail real.
3. Recomendação: trocar a senha dos administradores criados ou redefinidos antes da correção, porque essas senhas podem estar nos logs antigos.
