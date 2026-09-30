import { aplicarMotorDePrioridade } from '../core/priorizacao.js';

const decisaoVazia = { ativa: false, prioridade: null, motivo: '', responsavel: null, data: null };

/** Cenário fixo, exclusivo para demonstrar o fluxo completo durante o pitch. */
export const dadosDemonstracao = [
  {
    id: 'DEM-001', titulo: 'Sistema fora do ar para clientes', descricao: 'A plataforma não carrega e impede o acesso dos clientes.', solicitante: 'Central de suporte', origem: 'Suporte', status: 'Em desenvolvimento', criada_em: '2026-09-10T08:00:00.000Z',
    criterios: { gravidade: 5, impacto_cliente: 5, clientes_afetados: 5, urgencia_sla: 5, impacto_financeiro: 4, risco_operacional: 5, prazo: 5, esforco: 3 }, gatilhos_criticos: ['Sistema parado'], decisao_manual: decisaoVazia,
    timeline: [{ tipo: 'criacao', status: 'Solicitação recebida', data: '2026-09-10T08:00:00.000Z', detalhes: 'Solicitação criada.' }, { tipo: 'status', status: 'Em análise técnica', data: '2026-09-10T08:05:00.000Z' }, { tipo: 'triagem', data: '2026-09-10T08:08:00.000Z' }, { tipo: 'status', status: 'Em desenvolvimento', data: '2026-09-10T08:15:00.000Z' }]
  },
  {
    id: 'DEM-002', titulo: 'Relatório para renovação do cliente principal', descricao: 'O cliente precisa do relatório antes da reunião de renovação.', solicitante: 'Time Comercial', origem: 'Comercial', status: 'Em análise técnica', criada_em: '2026-09-10T08:30:00.000Z',
    criterios: { gravidade: 3, impacto_cliente: 4, clientes_afetados: 3, urgencia_sla: 2, impacto_financeiro: 4, risco_operacional: 3, prazo: 2, esforco: 3 }, gatilhos_criticos: [],
    decisao_manual: { ativa: true, prioridade: 'Alta', motivo: 'O cliente principal pode cancelar o contrato sem esse relatório.', responsavel: 'Gestão comercial', data: '2026-09-10T08:45:00.000Z' },
    ia_sugestao: { fonte: 'Gemini', notas: { gravidade: 3, impacto_cliente: 4, clientes_afetados: 3, urgencia_sla: 2, impacto_financeiro: 4, risco_operacional: 3, prazo: 2, esforco: 3 }, justificativa: 'A solicitação tem impacto financeiro e no relacionamento comercial.', data: '2026-09-10T08:38:00.000Z' },
    timeline: [{ tipo: 'criacao', status: 'Solicitação recebida', data: '2026-09-10T08:30:00.000Z', detalhes: 'Solicitação criada.' }, { tipo: 'ia', fonte: 'Gemini', data: '2026-09-10T08:38:00.000Z', justificativa: 'A solicitação tem impacto financeiro e no relacionamento comercial.' }, { tipo: 'status', status: 'Em análise técnica', data: '2026-09-10T08:40:00.000Z' }, { tipo: 'triagem', data: '2026-09-10T08:42:00.000Z' }, { tipo: 'decisao_manual', prioridade: 'Alta', motivo: 'O cliente principal pode cancelar o contrato sem esse relatório.', responsavel: 'Gestão comercial', data: '2026-09-10T08:45:00.000Z' }]
  },
  {
    id: 'DEM-003', titulo: 'Lentidão no relatório de vendas', descricao: 'A geração do relatório está mais lenta que o esperado.', solicitante: 'João Silva', origem: 'Comercial', status: 'Em análise técnica', criada_em: '2026-09-09T10:00:00.000Z',
    criterios: { gravidade: 3, impacto_cliente: 4, clientes_afetados: 3, urgencia_sla: 3, impacto_financeiro: 3, risco_operacional: 2, prazo: 3, esforco: 3 }, gatilhos_criticos: [], decisao_manual: decisaoVazia,
    timeline: [{ tipo: 'criacao', status: 'Solicitação recebida', data: '2026-09-09T10:00:00.000Z', detalhes: 'Solicitação criada.' }, { tipo: 'status', status: 'Em análise técnica', data: '2026-09-10T08:10:00.000Z' }, { tipo: 'triagem', data: '2026-09-10T08:18:00.000Z' }]
  },
  {
    id: 'DEM-004', titulo: 'Melhoria no filtro de clientes', descricao: 'Pedido para encontrar clientes com mais rapidez.', solicitante: 'Bruno Lima', origem: 'Produto', status: 'Em desenvolvimento', criada_em: '2026-09-08T11:00:00.000Z',
    criterios: { gravidade: 3, impacto_cliente: 3, clientes_afetados: 4, urgencia_sla: 3, impacto_financeiro: 3, risco_operacional: 3, prazo: 2, esforco: 2 }, gatilhos_criticos: [], decisao_manual: decisaoVazia,
    timeline: [{ tipo: 'criacao', status: 'Solicitação recebida', data: '2026-09-08T11:00:00.000Z', detalhes: 'Solicitação criada.' }, { tipo: 'status', status: 'Em análise técnica', data: '2026-09-09T11:00:00.000Z' }, { tipo: 'triagem', data: '2026-09-09T11:10:00.000Z' }, { tipo: 'status', status: 'Em desenvolvimento', data: '2026-09-10T08:00:00.000Z' }]
  },
  {
    id: 'DEM-005', titulo: 'Ajuste de cor no botão de cadastro', descricao: 'Pedido visual simples, sem impacto no funcionamento.', solicitante: 'Equipe de Produto', origem: 'Produto', status: 'Solicitação recebida', criada_em: '2026-09-10T09:00:00.000Z',
    criterios: { gravidade: 1, impacto_cliente: 1, clientes_afetados: 1, urgencia_sla: 1, impacto_financeiro: 1, risco_operacional: 1, prazo: 1, esforco: 1 }, gatilhos_criticos: [], decisao_manual: decisaoVazia,
    timeline: [{ tipo: 'criacao', status: 'Solicitação recebida', data: '2026-09-10T09:00:00.000Z', detalhes: 'Solicitação criada.' }, { tipo: 'triagem', data: '2026-09-10T09:05:00.000Z' }]
  },
  {
    id: 'DEM-006', titulo: 'Exportar dados em CSV', descricao: 'Cliente solicitou uma opção de exportação na tela de relatórios.', solicitante: 'Mariana Costa', origem: 'Cliente', status: 'Solicitação recebida', criada_em: '2026-09-10T09:20:00.000Z',
    criterios: {}, gatilhos_criticos: [], decisao_manual: decisaoVazia,
    timeline: [{ tipo: 'criacao', status: 'Solicitação recebida', data: '2026-09-10T09:20:00.000Z', detalhes: 'Solicitação criada.' }]
  }
].map(item => aplicarMotorDePrioridade({ ...item, decisao_manual: { ...item.decisao_manual } }));
