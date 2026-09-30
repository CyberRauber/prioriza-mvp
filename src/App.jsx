import React, { useMemo, useState } from 'react';
import logoPrioriza from './assets/logo-prioriza.png';
import Acompanhamento from './components/Acompanhamento.jsx';
import { ehGanhoRapido, obterPrioridadeFinal, temRiscoDeSla } from './core/priorizacao.js';
import { dadosDemonstracao as dadosDemo } from './data/dadosDemonstracao.js';
import MatrizEisenhower from './components/MatrizEisenhower.jsx';
import ModalGerenciamento from './components/ModalGerenciamento.jsx';
import ModalTriagem from './components/ModalTriagem.jsx';
import NovaDemanda from './components/NovaDemanda.jsx';
import { useDemandas } from './hooks/useDemandas.js';

const menuPortal = [
  { id: 'nova-demanda', label: 'Nova solicitação', icon: '+' },
  { id: 'acompanhamento', label: 'Acompanhar solicitação', icon: '◷' }
];
const menuInterno = [{ id: 'painel', label: 'Painel', icon: '▦' }, { id: 'matriz', label: 'Matriz', icon: '⊞' }];

const etapas = [
  ['1', 'Solicitação'], ['2', 'Triagem'], ['3', 'Priorização'], ['4', 'Desenvolvimento'], ['5', 'Retorno ao cliente']
];

const prioridadeClasse = { Crítica: 'badge-critica', Alta: 'badge-alta', Média: 'badge-media', Baixa: 'badge-baixa' };
const statusClasse = { 'Solicitação recebida': 'status-recebido', 'Em análise técnica': 'status-analise', 'Em desenvolvimento': 'status-desenvolvimento', Concluída: 'status-resolvido' };

function Sidebar({ activeScreen, onChangeScreen, onLoadDemo }) {
  return <aside className="sidebar">
    <div className="brand"><img className="brand-logo" src={logoPrioriza} alt="Logo Prioriza" /><span>Prioriza</span></div>
    <nav aria-label="Navegação principal">
      <p className="profile-simulation" title="Modo de demonstração: Simulando autenticação de perfis diferentes">Modo de demonstração</p>
      <p className="nav-section-label">Portal do cliente</p>
      {menuPortal.map(item => <button key={item.id} className={`nav-item ${activeScreen === item.id ? 'active' : ''}`} onClick={() => onChangeScreen(item.id)} aria-current={activeScreen === item.id ? 'page' : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
      <p className="nav-section-label">Gestão interna</p>
      {menuInterno.map(item => <button key={item.id} className={`nav-item ${activeScreen === item.id ? 'active' : ''}`} onClick={() => onChangeScreen(item.id)} aria-current={activeScreen === item.id ? 'page' : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
    </nav>
    <button className="pitch-data-button" type="button" title="Ferramenta exclusiva para o pitch" onClick={() => {
      if (window.confirm('Carregar os 6 dados de demonstração? As demandas atuais deste navegador serão substituídas.')) onLoadDemo();
    }}><span aria-hidden="true">↻</span> Carregar Dados de Demonstração</button>
    <div className="sidebar-footer"><span className="team-avatar">ED</span><div><strong>Equipe Dev</strong><small>Desenvolvimento</small></div></div>
  </aside>;
}

function Badge({ children, className }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

function MetricCard({ label, value, kind }) {
  return <article className="metric-card"><div><span>{label}</span><strong>{value}</strong></div><div className={`metric-icon ${kind}`}>{kind === 'total' ? '▦' : kind === 'analise' ? '⌕' : kind === 'dev' ? '⌘' : '✓'}</div></article>;
}

function Flow({ compact = false }) {
  return <section className={`flow-card ${compact ? 'flow-compact' : ''}`} aria-label="Como funciona">
    {!compact && <p className="eyebrow">Como funciona</p>}
    <div className="flow-steps">
      {etapas.map(([number, label], index) => <div className="flow-item" key={label}>
        <span className={`flow-icon flow-${index + 1}`}>{number}</span><span>{label}</span>{index < etapas.length - 1 && <i aria-hidden="true">›</i>}
      </div>)}
    </div>
  </section>;
}

function Dashboard({ demandas, onNewDemand, onManage, onEvaluate }) {
  const [busca, setBusca] = useState('');
  const [origem, setOrigem] = useState('Todas');
  const [status, setStatus] = useState('Todos');

  const demandasFiltradas = useMemo(() => demandas.filter(demanda => {
    const texto = `${demanda.titulo} ${demanda.solicitante}`.toLocaleLowerCase('pt-BR');
    return texto.includes(busca.toLocaleLowerCase('pt-BR')) && (origem === 'Todas' || demanda.origem === origem) && (status === 'Todos' || demanda.status === status);
  }), [demandas, busca, origem, status]);

  const metricas = {
    total: demandas.length,
    analise: demandas.filter(demanda => demanda.status === 'Em análise técnica').length,
    dev: demandas.filter(demanda => demanda.status === 'Em desenvolvimento').length,
    resolvidas: demandas.filter(demanda => demanda.status === 'Concluída').length
  };

  return <section className="dashboard">
    <header className="page-header">
      <div><p className="eyebrow">Visão geral</p><h1>Painel</h1><p>Compare demandas e priorize com critérios claros.</p></div>
      <button className="primary-button" onClick={onNewDemand}><span>+</span> Nova solicitação</button>
    </header>

    <Flow compact />

    <section className="metrics-grid" aria-label="Resumo das demandas">
      <MetricCard label="Total de demandas" value={metricas.total} kind="total" />
      <MetricCard label="Em análise" value={metricas.analise} kind="analise" />
      <MetricCard label="Em desenvolvimento" value={metricas.dev} kind="dev" />
      <MetricCard label="Resolvidas" value={metricas.resolvidas} kind="resolvidas" />
    </section>

    <section className="table-card">
      <div className="filters">
        <label className="search-field"><span aria-hidden="true">⌕</span><input value={busca} onChange={event => setBusca(event.target.value)} placeholder="Buscar por título ou solicitante" aria-label="Buscar por título ou solicitante" /></label>
        <label><span>Origem</span><select value={origem} onChange={event => setOrigem(event.target.value)}><option>Todas</option><option>Cliente</option><option>Suporte</option><option>Comercial</option><option>Produto</option></select></label>
        <label><span>Status</span><select value={status} onChange={event => setStatus(event.target.value)}><option>Todos</option><option>Solicitação recebida</option><option>Em análise técnica</option><option>Em desenvolvimento</option><option>Concluída</option></select></label>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>ID</th><th>Título</th><th>Origem</th><th>Prioridade</th><th>Status</th><th className="right">Pontos</th><th></th></tr></thead>
          <tbody>
            {demandasFiltradas.map(demanda => {
              const prioridade = obterPrioridadeFinal(demanda);
              return <tr key={demanda.id} className={demanda.triagem_pendente ? 'pending-triage-row' : ''}><td className="demand-id">{demanda.id}</td><td><strong>{demanda.titulo}{demanda.triagem_pendente && <span className="triage-pending">Aguardando triagem</span>}{ehGanhoRapido(demanda) && <span className="quick-win">⚡ Ganho Rápido</span>}{demanda.vinculada_a && <span className="linked-demand" title={`Relacionada à ${demanda.vinculada_a}`}>↗ {demanda.vinculada_a}</span>}{temRiscoDeSla(demanda) && <SlaRiskBadge />}</strong><small>{demanda.solicitante || 'Solicitação externa'}</small></td><td><Badge className="badge-origem">{demanda.origem}</Badge></td><td>{demanda.triagem_pendente ? <Badge className="badge-pendente">Pendente</Badge> : <span className="priority-cell"><Badge className={prioridadeClasse[prioridade]}>{prioridade}</Badge>{demanda.decisao_manual?.ativa && <span className="manual-priority-icon" title="Prioridade alterada manualmente" aria-label="Prioridade alterada manualmente">✦</span>}</span>}</td><td><Badge className={statusClasse[demanda.status]}>{demanda.status}</Badge></td><td className="right score-cell">{demanda.triagem_pendente ? '—' : demanda.pontuacao}</td><td className="action-cell"><button className="table-action" type="button" onClick={() => demanda.triagem_pendente ? onEvaluate(demanda) : onManage(demanda)}>{demanda.triagem_pendente ? 'Avaliar demanda' : 'Gerenciar'}</button></td></tr>;
            })}
          </tbody>
        </table>
        {demandasFiltradas.length === 0 && <p className="empty-state">Nenhuma demanda encontrada para esses filtros.</p>}
      </div>
    </section>
  </section>;
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState('painel');
  const [demandaGerenciada, setDemandaGerenciada] = useState(null);
  const [demandaEmTriagem, setDemandaEmTriagem] = useState(null);
  const { demandasOrdenadas, adicionarDemanda, atualizarStatus, avaliarDemanda, registrarDecisaoManual, removerDecisaoManual, atualizarComunicacaoCliente, carregarDadosDemo } = useDemandas(dadosDemo);

  function loadDemoData() {
    carregarDadosDemo(dadosDemo);
    setDemandaGerenciada(null);
    setDemandaEmTriagem(null);
    setActiveScreen('painel');
  }

  function salvarTriagem({ criterios, gatilhos, vinculadaA, iaSugestao }) {
    if (!demandaEmTriagem) return;
    avaliarDemanda(demandaEmTriagem.id, criterios, gatilhos, vinculadaA, iaSugestao);
    setDemandaEmTriagem(null);
  }

  function salvarGerenciamento({ status, decisaoManual, mensagemCliente, proximaAtualizacao, responsavel }) {
    if (!demandaGerenciada) return;

    if (status !== demandaGerenciada.status) atualizarStatus(demandaGerenciada.id, status);
    if (decisaoManual.ativa) {
      registrarDecisaoManual(demandaGerenciada.id, decisaoManual.prioridade, decisaoManual.motivo, responsavel);
    } else if (demandaGerenciada.decisao_manual?.ativa) {
      removerDecisaoManual(demandaGerenciada.id);
    }
    if (
      mensagemCliente !== (demandaGerenciada.mensagem_cliente?.texto || '') ||
      proximaAtualizacao !== (demandaGerenciada.proxima_atualizacao || '')
    ) {
      atualizarComunicacaoCliente(demandaGerenciada.id, mensagemCliente, proximaAtualizacao);
    }
    setDemandaGerenciada(null);
  }

  const telas = {
    painel: <Dashboard demandas={demandasOrdenadas} onNewDemand={() => setActiveScreen('nova-demanda')} onManage={setDemandaGerenciada} onEvaluate={setDemandaEmTriagem} />,
    'nova-demanda': <NovaDemanda addDemanda={adicionarDemanda} onTrack={() => setActiveScreen('acompanhamento')} />,
    acompanhamento: <Acompanhamento demandas={demandasOrdenadas} />,
    matriz: <MatrizEisenhower demandas={demandasOrdenadas} />
  };

  return <div className="app-shell"><Sidebar activeScreen={activeScreen} onChangeScreen={setActiveScreen} onLoadDemo={loadDemoData} /><main className="main-content">{telas[activeScreen]}</main>{demandaEmTriagem && <ModalTriagem demanda={demandaEmTriagem} demandasAtivas={demandasOrdenadas.filter(item => item.id !== demandaEmTriagem.id && item.status !== 'Concluída')} onClose={() => setDemandaEmTriagem(null)} onSave={salvarTriagem} />}{demandaGerenciada && <ModalGerenciamento demanda={demandaGerenciada} onClose={() => setDemandaGerenciada(null)} onSave={salvarGerenciamento} />}</div>;
}

function SlaRiskBadge() {
  return <span className="sla-risk" title="Urgência ou prazo altos: risco de SLA" aria-label="Risco de SLA">Risco de SLA</span>;
}
