const CHAVES = ['gravidade', 'impacto_cliente', 'clientes_afetados', 'urgencia_sla', 'impacto_financeiro', 'risco_operacional', 'prazo', 'esforco'];

function limparJson(texto) {
  return texto.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
}

function validarResposta(resposta) {
  const notas = {};
  for (const chave of CHAVES) {
    const nota = Number(resposta?.[chave]);
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) throw new Error('A sugestão não trouxe todas as notas esperadas.');
    notas[chave] = nota;
  }
  return { notas, justificativa: String(resposta.justificativa || 'Sugestão baseada no texto da solicitação.').slice(0, 320) };
}

function simularSugestao(titulo, descricao) {
  const texto = `${titulo} ${descricao}`.toLocaleLowerCase('pt-BR');
  const urgente = /erro|falha|parado|fora do ar|indispon|não consigo|nao consigo|urgente|bloque/.test(texto);
  const financeiro = /pagamento|checkout|venda|contrato|financeir|cancel/.test(texto);
  const risco = /segurança|seguranca|dados|vazamento|acesso/.test(texto);
  return {
    notas: {
      gravidade: urgente ? 4 : 3,
      impacto_cliente: urgente || financeiro ? 4 : 3,
      clientes_afetados: financeiro ? 4 : 3,
      urgencia_sla: urgente ? 4 : 3,
      impacto_financeiro: financeiro ? 4 : 2,
      risco_operacional: risco ? 4 : 2,
      prazo: urgente ? 4 : 3,
      esforco: 3
    },
    justificativa: 'Sugestão simulada para o pitch, baseada em palavras-chave do título e da descrição.',
    fonte: 'Simulação local'
  };
}

/** Sugere notas via Gemini quando houver chave; sem chave, mantém uma simulação local para o pitch. */
export async function sugerirNotasComIA(titulo, descricao) {
  const chave = import.meta.env.VITE_GEMINI_API_KEY;
  if (!chave) return simularSugestao(titulo, descricao);

  const prompt = `Analise esta demanda de software. Retorne APENAS JSON válido com gravidade, impacto_cliente, clientes_afetados, urgencia_sla, impacto_financeiro, risco_operacional, prazo e esforco (inteiros de 1 a 5) e justificativa (máximo 2 frases).\nTítulo: ${titulo}\nDescrição: ${descricao}`;
  const resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${chave}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } })
  });
  if (!resposta.ok) throw new Error('Não foi possível obter a sugestão da IA.');
  const corpo = await resposta.json();
  const texto = corpo?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error('A IA não retornou uma sugestão válida.');
  return { ...validarResposta(JSON.parse(limparJson(texto))), fonte: 'Gemini' };
}
