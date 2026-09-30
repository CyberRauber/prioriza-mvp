# Prioriza

MVP desenvolvido para o **2º Hackathon IFC Concórdia 2026** pela equipe **Felipe, Wesley, Enzo P. e Isabel**.

## Problema validado

Empresas de software recebem solicitações de clientes, suporte, comercial e produto. Quando não existem critérios comuns, a prioridade pode depender de pressão, percepção individual ou reuniões longas. Isso dificulta justificar decisões e pode frustrar clientes que não recebem retorno claro.

Na pesquisa do grupo, foram coletadas 22 respostas. Os critérios mais recorrentes foram gravidade, impacto no cliente, clientes afetados e urgência. Insatisfação do cliente e atrasos apareceram como consequências frequentes.

## Solução

O Prioriza organiza a decisão em duas visões:

- **Portal do cliente:** abertura simples de solicitação, código de acompanhamento, status acolhedores e mensagem da equipe.
- **Gestão interna:** triagem com oito critérios, pontuação ponderada, ranking, Matriz de Eisenhower, atualização de status e justificativa de decisões manuais.

O cálculo fica isolado da visão do cliente. Assim, a equipe trabalha com critérios objetivos sem expor pontuação, posição na fila, impacto financeiro ou regras internas.

## Diferenciais

- Motor de regras com gravidade, impacto, urgência, prazo, risco, esforço e outros critérios.
- Gatilhos críticos para sistema parado, risco de segurança e perda de dados.
- Registro de triagem, sugestão de IA e decisões manuais no histórico interno.
- Flag de **⚡ Ganho Rápido** para demandas com esforço 1.
- Alerta de **Risco de SLA** quando urgência ou prazo recebem nota 4 ou 5.
- Botão de dados demonstrativos, exclusivo para o pitch, com seis cenários prontos.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço exibido no terminal, normalmente `http://localhost:5173`.

## Site publicado

O projeto está configurado para ser publicado automaticamente pelo GitHub Pages sempre que houver alterações na branch `main`.

## Limites do MVP

Este é um MVP front-end local. As demandas são persistidas somente no `localStorage` do navegador e não há autenticação real.

Opcionalmente, uma chave `VITE_GEMINI_API_KEY` pode ser configurada para o Gemini sugerir notas durante a triagem. Essa integração roda diretamente no cliente apenas para fins de demonstração; sem a chave, o MVP apresenta uma sugestão local de IA para o roteiro do pitch.

Banco de dados compartilhado, autenticação real, permissões, integração com ferramentas de atendimento e APIs externas são os próximos passos.
