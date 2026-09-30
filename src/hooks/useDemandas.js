import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ORIGENS_VALIDAS,
  PRIORIDADES,
  STATUS_VALIDOS,
  aplicarMotorDePrioridade,
  ordenarDemandas
} from '../core/priorizacao.js';

const CHAVE_DEMANDAS = 'prioriza-demandas-v2';
const CHAVE_SEQUENCIA = 'prioriza-ultima-sequencia-v2';
const STATUS_LEGADOS = Object.freeze({
  Recebido: 'Solicitação recebida',
  'Em análise': 'Em análise técnica',
  Resolvido: 'Concluída'
});

function normalizarStatus(status) {
  return STATUS_LEGADOS[status] || status || 'Solicitação recebida';
}

function normalizarDemandaPersistida(demanda) {
  const status = normalizarStatus(demanda.status);
  const timeline = Array.isArray(demanda.timeline) && demanda.timeline.length
    ? demanda.timeline.map(evento => ({
        ...evento,
        tipo: evento.tipo || 'status',
        status: evento.status ? normalizarStatus(evento.status) : undefined
      }))
    : [{ tipo: 'criacao', status, data: demanda.criada_em || new Date().toISOString(), detalhes: 'Solicitação criada.' }];

  const possuiCriacao = timeline.some(evento => evento.tipo === 'criacao');
  if (!possuiCriacao) {
    timeline.unshift({ tipo: 'criacao', status: 'Solicitação recebida', data: demanda.criada_em || timeline[0]?.data || new Date().toISOString(), detalhes: 'Solicitação criada.' });
  }

  return aplicarMotorDePrioridade({
    ...demanda,
    status,
    timeline,
    mensagem_cliente: {
      texto: demanda.mensagem_cliente?.texto || '',
      atualizada_em: demanda.mensagem_cliente?.atualizada_em || null
    },
    proxima_atualizacao: demanda.proxima_atualizacao || null
  });
}

/** @param {unknown} valor @returns {number} */
function lerSequencia(valor) {
  const sequencia = Number(valor);
  return Number.isInteger(sequencia) && sequencia >= 0 ? sequencia : 0;
}

/** @param {number} numero @returns {string} */
function criarId(numero) {
  return `DEM-${String(numero).padStart(3, '0')}`;
}

/** @param {{ id: string }[]} demandas @returns {number} */
function maiorSequenciaDasDemandas(demandas) {
  return demandas.reduce((maior, demanda) => {
    const resultado = /^DEM-(\d+)$/.exec(demanda.id);
    return resultado ? Math.max(maior, Number(resultado[1])) : maior;
  }, 0);
}

/**
 * @param {string} valor
 * @param {string[]} permitidos
 * @param {string} nome
 */
function exigirValorValido(valor, permitidos, nome) {
  if (!permitidos.includes(valor)) {
    throw new Error(`${nome} inválido: ${valor}`);
  }
}

/**
 * Cria uma demanda com os campos padrão e os dados derivados do motor.
 * @param {Object} dados
 * @param {string} dados.id
 * @param {string} dados.titulo
 * @param {string} [dados.descricao]
 * @param {string} [dados.solicitante]
 * @param {import('../core/priorizacao.js').Origem} dados.origem
 * @param {import('../core/priorizacao.js').StatusDemanda} [dados.status]
 * @param {import('../core/priorizacao.js').Criterios} [dados.criterios]
 * @param {string[]} [dados.gatilhos_criticos]
 * @param {string} [dados.criada_em]
 */
export function montarDemanda(dados) {
  if (!dados.titulo?.trim()) throw new Error('Título é obrigatório.');
  exigirValorValido(dados.origem, ORIGENS_VALIDAS, 'Origem');

  const status = dados.status || 'Solicitação recebida';
  exigirValorValido(status, STATUS_VALIDOS, 'Status');

  const criada_em = dados.criada_em || new Date().toISOString();
  return aplicarMotorDePrioridade({
    id: dados.id,
    titulo: dados.titulo.trim(),
    descricao: dados.descricao?.trim() || '',
    solicitante: dados.solicitante?.trim() || '',
    origem: dados.origem,
    status,
    timeline: [{ tipo: 'criacao', status, data: criada_em, detalhes: 'Solicitação criada.' }],
    criterios: dados.criterios || {},
    gatilhos_criticos: dados.gatilhos_criticos || [],
    decisao_manual: { ativa: false, prioridade: null, motivo: '', data: null },
    ia_sugestao: null,
    mensagem_cliente: { texto: '', atualizada_em: null },
    proxima_atualizacao: null,
    vinculada_a: dados.vinculada_a || null,
    criada_em
  });
}

/**
 * Estado e persistência local das demandas. Não realiza chamadas externas.
 * @param {import('../core/priorizacao.js').Demanda[]} [demandasIniciais]
 */
export function useDemandas(demandasIniciais = []) {
  const [demandas, setDemandas] = useState(() => {
    try {
      const salvas = JSON.parse(localStorage.getItem(CHAVE_DEMANDAS));
      return Array.isArray(salvas) ? salvas.map(normalizarDemandaPersistida) : demandasIniciais.map(normalizarDemandaPersistida);
    } catch {
      return demandasIniciais;
    }
  });

  const sequencia = useRef(Math.max(
    lerSequencia(localStorage.getItem(CHAVE_SEQUENCIA)),
    maiorSequenciaDasDemandas(demandas)
  ));

  useEffect(() => {
    localStorage.setItem(CHAVE_DEMANDAS, JSON.stringify(demandas));
    localStorage.setItem(CHAVE_SEQUENCIA, String(sequencia.current));
  }, [demandas]);

  const adicionarDemanda = useCallback((dados) => {
    sequencia.current += 1;
    const demanda = montarDemanda({ ...dados, id: criarId(sequencia.current) });
    setDemandas(atuais => [...atuais, demanda]);
    return demanda;
  }, []);

  const atualizarStatus = useCallback((id, status) => {
    exigirValorValido(status, STATUS_VALIDOS, 'Status');
    const data = new Date().toISOString();

    setDemandas(atuais => atuais.map(demanda => {
      if (demanda.id !== id || demanda.status === status) return demanda;
      return { ...demanda, status, timeline: [...demanda.timeline, { tipo: 'status', status, data }] };
    }));
  }, []);

  /**
   * Salva a avaliação interna e libera a demanda para o ranking.
   * @param {string} id
   * @param {import('../core/priorizacao.js').Criterios} criterios
   * @param {string[]} gatilhosCriticos
   * @param {string|null} vinculadaA
   * @param {object|null} iaSugestao
   */
  const avaliarDemanda = useCallback((id, criterios, gatilhosCriticos = [], vinculadaA = null, iaSugestao = null) => {
    const data = new Date().toISOString();
    setDemandas(atuais => atuais.map(demanda => {
      if (demanda.id !== id) return demanda;

      const status = demanda.status === 'Solicitação recebida' ? 'Em análise técnica' : demanda.status;
      const timelineStatus = status === demanda.status
        ? demanda.timeline
        : [...demanda.timeline, { tipo: 'status', status, data }];
      const timelineComIa = iaSugestao
        ? [...timelineStatus, { tipo: 'ia', data: iaSugestao.data || data, notas: iaSugestao.notas, justificativa: iaSugestao.justificativa, fonte: iaSugestao.fonte || 'Gemini' }]
        : timelineStatus;
      const timeline = [...timelineComIa, { tipo: 'triagem', data, criterios, gatilhos_criticos: gatilhosCriticos, vinculada_a: vinculadaA || null }];

      return aplicarMotorDePrioridade({
        ...demanda,
        criterios,
        gatilhos_criticos: gatilhosCriticos,
        vinculada_a: vinculadaA || null,
        status,
        timeline,
        ia_sugestao: iaSugestao || demanda.ia_sugestao || null
      });
    }));
  }, []);

  const registrarDecisaoManual = useCallback((id, prioridade, motivo, responsavel = 'Gestão interna') => {
    exigirValorValido(prioridade, PRIORIDADES, 'Prioridade');
    if (!motivo?.trim()) throw new Error('Informe o motivo da decisão manual.');

    setDemandas(atuais => atuais.map(demanda => {
      if (demanda.id !== id || demanda.isCritica) return demanda;
      const data = new Date().toISOString();
      return {
        ...demanda,
        decisao_manual: { ativa: true, prioridade, motivo: motivo.trim(), responsavel: responsavel.trim() || 'Gestão interna', data },
        timeline: [...demanda.timeline, { tipo: 'decisao_manual', data, prioridade, motivo: motivo.trim(), responsavel: responsavel.trim() || 'Gestão interna' }]
      };
    }));
  }, []);

  const removerDecisaoManual = useCallback((id) => {
    setDemandas(atuais => atuais.map(demanda => demanda.id === id
      ? { ...demanda, decisao_manual: { ativa: false, prioridade: null, motivo: '', data: null }, timeline: [...demanda.timeline, { tipo: 'decisao_manual_removida', data: new Date().toISOString() }] }
      : demanda));
  }, []);

  /** Salva uma mensagem da equipe que poderá ser consultada pelo cliente. */
  const atualizarComunicacaoCliente = useCallback((id, mensagem, proximaAtualizacao) => {
    const texto = mensagem?.trim() || '';
    setDemandas(atuais => atuais.map(demanda => demanda.id === id
      ? {
          ...demanda,
          mensagem_cliente: { texto, atualizada_em: texto ? new Date().toISOString() : null },
          proxima_atualizacao: proximaAtualizacao || null
        }
      : demanda));
  }, []);

  /**
   * Substitui os dados atuais por um cenário fixo para demonstração.
   * @param {import('../core/priorizacao.js').Demanda[]} dadosDemo
   */
  const carregarDadosDemo = useCallback((dadosDemo) => {
    const dadosProcessados = dadosDemo.map(normalizarDemandaPersistida);
    sequencia.current = maiorSequenciaDasDemandas(dadosProcessados);
    setDemandas(dadosProcessados);
  }, []);

  const demandasOrdenadas = useMemo(() => ordenarDemandas(demandas), [demandas]);

  return {
    demandas,
    demandasOrdenadas,
    adicionarDemanda,
    atualizarStatus,
    avaliarDemanda,
    registrarDecisaoManual,
    removerDecisaoManual,
    atualizarComunicacaoCliente,
    carregarDadosDemo
  };
}
