/**
 * Regras de priorização do MVP Prioriza.
 * Este arquivo não depende de React para poder ser testado e reutilizado.
 */

/** @typedef {'Cliente'|'Suporte'|'Comercial'|'Produto'} Origem */
/** @typedef {'Solicitação recebida'|'Em análise técnica'|'Em desenvolvimento'|'Concluída'} StatusDemanda */
/** @typedef {'Crítica'|'Alta'|'Média'|'Baixa'} Prioridade */

/**
 * @typedef {Object} Criterios
 * @property {number} gravidade
 * @property {number} impacto_cliente
 * @property {number} clientes_afetados
 * @property {number} urgencia_sla
 * @property {number} impacto_financeiro
 * @property {number} risco_operacional
 * @property {number} prazo
 * @property {number} esforco
 */

/**
 * @typedef {Object} EventoTimeline
 * @property {StatusDemanda} status
 * @property {string} data Data ISO da alteração.
 */

/**
 * @typedef {Object} DecisaoManual
 * @property {boolean} ativa
 * @property {Prioridade|null} prioridade
 * @property {string} motivo
 * @property {string|null} data
 */

/**
 * @typedef {Object} Demanda
 * @property {string} id Código no formato DEM-001.
 * @property {string} titulo
 * @property {string} descricao
 * @property {string} solicitante
 * @property {Origem} origem
 * @property {StatusDemanda} status Status do fluxo, não da prioridade.
 * @property {EventoTimeline[]} timeline
 * @property {Criterios} criterios
 * @property {string[]} gatilhos_criticos
 * @property {boolean} isCritica
 * @property {number} pontuacao
 * @property {Prioridade} prioridade_sugerida
 * @property {DecisaoManual} decisao_manual
 * @property {string} criada_em
 */

export const STATUS_VALIDOS = ['Solicitação recebida', 'Em análise técnica', 'Em desenvolvimento', 'Concluída'];
export const ORIGENS_VALIDAS = ['Cliente', 'Suporte', 'Comercial', 'Produto'];
export const PRIORIDADES = ['Crítica', 'Alta', 'Média', 'Baixa'];

export const PESOS = Object.freeze({
  gravidade: 25,
  impacto_cliente: 15,
  clientes_afetados: 15,
  urgencia_sla: 15,
  impacto_financeiro: 10,
  risco_operacional: 10,
  prazo: 7,
  esforco: 3
});

export const GATILHOS_CRITICOS = Object.freeze([
  'Sistema parado',
  'Risco de segurança',
  'Perda de dados'
]);

export const ROTULOS_CRITERIOS = Object.freeze({
  gravidade: 'Gravidade',
  impacto_cliente: 'Impacto no cliente',
  clientes_afetados: 'Clientes afetados',
  urgencia_sla: 'Urgência / SLA',
  impacto_financeiro: 'Impacto financeiro',
  risco_operacional: 'Risco operacional',
  prazo: 'Prazo formal',
  esforco: 'Esforço estimado'
});

const ORDEM_PRIORIDADE = Object.freeze({ Crítica: 4, Alta: 3, Média: 2, Baixa: 1 });

/**
 * Uma demanda só entra no ranking após a triagem interna registrar as oito notas.
 * @param {unknown} criterios
 * @returns {boolean}
 */
export function possuiCriteriosAvaliados(criterios) {
  return Object.keys(PESOS).every(criterio => {
    const nota = Number(criterios?.[criterio]);
    return Number.isInteger(nota) && nota >= 1 && nota <= 5;
  });
}

/**
 * Confirma que todos os critérios possuem uma nota inteira de 1 a 5.
 * @param {Criterios} criterios
 * @returns {Criterios}
 * @throws {RangeError} Quando uma nota é inválida.
 */
export function validarCriterios(criterios) {
  for (const criterio of Object.keys(PESOS)) {
    const nota = Number(criterios?.[criterio]);
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      throw new RangeError(`O critério "${criterio}" deve ter uma nota inteira entre 1 e 5.`);
    }
  }

  return criterios;
}

/**
 * Retorna apenas gatilhos críticos reconhecidos pelo MVP.
 * A interface deve alimentar este campo por checkbox, não por interpretação de texto livre.
 * @param {string[]} gatilhos
 * @returns {string[]}
 */
export function normalizarGatilhosCriticos(gatilhos = []) {
  return [...new Set(gatilhos.filter(gatilho => GATILHOS_CRITICOS.includes(gatilho)))];
}

/**
 * Calcula a pontuação de 0 a 100. Esforço é invertido: esforço menor recebe mais pontos.
 * @param {Criterios} criterios
 * @returns {number}
 */
export function calcularPontuacao(criterios) {
  validarCriterios(criterios);

  const pontos = Object.entries(PESOS).reduce((total, [criterio, peso]) => {
    const nota = criterio === 'esforco' ? 6 - criterios[criterio] : criterios[criterio];
    return total + (nota / 5) * peso;
  }, 0);

  return Number(pontos.toFixed(2));
}

/**
 * @param {number} pontuacao
 * @param {boolean} isCritica
 * @returns {Prioridade}
 */
export function classificarPrioridade(pontuacao, isCritica = false) {
  if (isCritica) return 'Crítica';
  if (pontuacao >= 75) return 'Alta';
  if (pontuacao >= 45) return 'Média';
  return 'Baixa';
}

/**
 * Recalcula os campos derivados da demanda após criação ou edição.
 * @param {Omit<Demanda, 'isCritica'|'pontuacao'|'prioridade_sugerida'>} demanda
 * @returns {Demanda}
 */
export function aplicarMotorDePrioridade(demanda) {
  const gatilhos_criticos = normalizarGatilhosCriticos(demanda.gatilhos_criticos);
  const criteriosAvaliados = possuiCriteriosAvaliados(demanda.criterios);

  if (!criteriosAvaliados) {
    return {
      ...demanda,
      criterios: demanda.criterios || {},
      gatilhos_criticos,
      isCritica: false,
      pontuacao: null,
      prioridade_sugerida: null,
      triagem_pendente: true
    };
  }

  const isCritica = gatilhos_criticos.length > 0;
  const pontuacao = isCritica ? 100 : calcularPontuacao(demanda.criterios);

  return {
    ...demanda,
    gatilhos_criticos,
    isCritica,
    pontuacao,
    prioridade_sugerida: classificarPrioridade(pontuacao, isCritica),
    triagem_pendente: false
  };
}

/**
 * Retorna a prioridade que será exibida. Uma demanda crítica nunca pode ser rebaixada manualmente.
 * @param {Demanda} demanda
 * @returns {Prioridade}
 */
export function obterPrioridadeFinal(demanda) {
  if (demanda.triagem_pendente || !possuiCriteriosAvaliados(demanda.criterios)) return null;
  if (demanda.isCritica) return 'Crítica';
  if (demanda.decisao_manual?.ativa && PRIORIDADES.includes(demanda.decisao_manual.prioridade)) {
    return demanda.decisao_manual.prioridade;
  }
  return demanda.prioridade_sugerida;
}

/**
 * Ordena demandas por prioridade final, depois por pontuação e, por último, por data de criação.
 * @param {Demanda[]} demandas
 * @returns {Demanda[]}
 */
export function ordenarDemandas(demandas) {
  return [...demandas].sort((a, b) => {
    const prioridadeA = obterPrioridadeFinal(a);
    const prioridadeB = obterPrioridadeFinal(b);
    const porPrioridade = (ORDEM_PRIORIDADE[prioridadeB] || 0) - (ORDEM_PRIORIDADE[prioridadeA] || 0);
    if (porPrioridade !== 0) return porPrioridade;
    if ((b.pontuacao || 0) !== (a.pontuacao || 0)) return (b.pontuacao || 0) - (a.pontuacao || 0);
    return new Date(a.criada_em) - new Date(b.criada_em);
  });
}

/**
 * Calcula o eixo de importância da Matriz de Eisenhower.
 * Gravidade, impactos e risco são ponderados pelos mesmos pesos do motor principal.
 * @param {Demanda} demanda
 * @returns {number}
 */
export function calcularImportanciaEisenhower(demanda) {
  if (!possuiCriteriosAvaliados(demanda.criterios)) return null;
  if (demanda.isCritica) return 5;
  const criterios = demanda.criterios;
  validarCriterios(criterios);

  const chaves = ['gravidade', 'impacto_cliente', 'clientes_afetados', 'impacto_financeiro', 'risco_operacional'];
  const pesoTotal = chaves.reduce((total, chave) => total + PESOS[chave], 0);
  const media = chaves.reduce((total, chave) => total + criterios[chave] * PESOS[chave], 0) / pesoTotal;
  return Number(media.toFixed(1));
}

/**
 * Calcula o eixo de urgência da Matriz de Eisenhower.
 * @param {Demanda} demanda
 * @returns {number}
 */
export function calcularUrgenciaEisenhower(demanda) {
  if (!possuiCriteriosAvaliados(demanda.criterios)) return null;
  if (demanda.isCritica) return 5;
  const criterios = demanda.criterios;
  validarCriterios(criterios);

  const media = (criterios.urgencia_sla * PESOS.urgencia_sla + criterios.prazo * PESOS.prazo) / (PESOS.urgencia_sla + PESOS.prazo);
  return Number(media.toFixed(1));
}

/**
 * @param {Demanda} demanda
 * @returns {'fazer'|'planejar'|'delegar'|'avaliar'}
 */
export function definirQuadranteEisenhower(demanda) {
  if (!possuiCriteriosAvaliados(demanda.criterios)) return null;
  if (demanda.isCritica) return 'fazer';
  const importante = calcularImportanciaEisenhower(demanda) >= 3;
  const urgente = calcularUrgenciaEisenhower(demanda) >= 3;

  if (importante && urgente) return 'fazer';
  if (importante) return 'planejar';
  if (urgente) return 'delegar';
  return 'avaliar';
}

/**
 * Mostra os critérios com maior contribuição para a pontuação, para tornar a decisão auditável.
 * @param {Demanda} demanda
 * @param {number} [limite]
 */
export function obterCriteriosMaisInfluentes(demanda, limite = 3) {
  if (!possuiCriteriosAvaliados(demanda.criterios)) return [];
  validarCriterios(demanda.criterios);
  return Object.entries(PESOS)
    .map(([criterio, peso]) => {
      const nota = criterio === 'esforco' ? 6 - demanda.criterios[criterio] : demanda.criterios[criterio];
      return { criterio, rotulo: ROTULOS_CRITERIOS[criterio], nota: demanda.criterios[criterio], pontos: Number(((nota / 5) * peso).toFixed(2)) };
    })
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, limite);
}

/**
 * @param {Demanda} demanda
 * @returns {string}
 */
export function gerarJustificativaPrioridade(demanda) {
  if (!possuiCriteriosAvaliados(demanda.criterios)) return 'A solicitação ainda aguarda avaliação técnica.';
  if (demanda.isCritica) {
    return `Demanda crítica devido a: ${demanda.gatilhos_criticos.join(', ')}.`;
  }
  return `Maior influência: ${obterCriteriosMaisInfluentes(demanda).map(item => item.rotulo).join(', ')}.`;
}

/**
 * Indica risco de atraso no SLA a partir das notas de urgência ou prazo.
 * @param {Demanda} demanda
 * @returns {boolean}
 */
export function temRiscoDeSla(demanda) {
  return possuiCriteriosAvaliados(demanda.criterios)
    && (demanda.criterios.urgencia_sla >= 4 || demanda.criterios.prazo >= 4);
}

/** @param {Demanda} demanda */
export function ehGanhoRapido(demanda) {
  return possuiCriteriosAvaliados(demanda.criterios) && demanda.criterios.esforco === 1;
}
