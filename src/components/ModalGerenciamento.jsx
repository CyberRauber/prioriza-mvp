import React, { useEffect, useState } from 'react';
import { PRIORIDADES, STATUS_VALIDOS } from '../core/priorizacao.js';

const prioridadeClasse = { Crítica: 'badge-critica', Alta: 'badge-alta', Média: 'badge-media', Baixa: 'badge-baixa' };

/**
 * Modal para atualizar o andamento e registrar uma decisão humana sobre a prioridade.
 * A persistência é mantida no hook useDemandas, recebido por meio de onSave.
 * @param {{ demanda: import('../core/priorizacao.js').Demanda, onClose: () => void, onSave: (dados: object) => void }} props
 */
export default function ModalGerenciamento({ demanda, onClose, onSave }) {
  const [status, setStatus] = useState(demanda.status);
  const [usarDecisaoManual, setUsarDecisaoManual] = useState(demanda.decisao_manual?.ativa || false);
  const [prioridade, setPrioridade] = useState(demanda.decisao_manual?.prioridade || demanda.prioridade_sugerida);
  const [motivo, setMotivo] = useState(demanda.decisao_manual?.motivo || '');
  const [mensagemCliente, setMensagemCliente] = useState(demanda.mensagem_cliente?.texto || '');
  const [proximaAtualizacao, setProximaAtualizacao] = useState(demanda.proxima_atualizacao || '');
  const [responsavel, setResponsavel] = useState(demanda.decisao_manual?.responsavel || 'Gestão interna');
  const [erro, setErro] = useState('');

  useEffect(() => {
    setStatus(demanda.status);
    setUsarDecisaoManual(demanda.decisao_manual?.ativa || false);
    setPrioridade(demanda.decisao_manual?.prioridade || demanda.prioridade_sugerida);
    setMotivo(demanda.decisao_manual?.motivo || '');
    setMensagemCliente(demanda.mensagem_cliente?.texto || '');
    setProximaAtualizacao(demanda.proxima_atualizacao || '');
    setResponsavel(demanda.decisao_manual?.responsavel || 'Gestão interna');
    setErro('');
  }, [demanda]);

  function salvar(event) {
    event.preventDefault();
    setErro('');

    if (usarDecisaoManual && !motivo.trim()) {
      setErro('Informe a justificativa para alterar a prioridade sugerida.');
      return;
    }

    onSave({
      status,
      decisaoManual: { ativa: usarDecisaoManual, prioridade, motivo: motivo.trim() },
      mensagemCliente: mensagemCliente.trim(),
      proximaAtualizacao,
      responsavel: responsavel.trim()
    });
  }

  return <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
    <section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={event => event.stopPropagation()}>
      <header className="modal-header">
        <div><span className="demand-id">{demanda.id}</span><h2 id="modal-title">{demanda.titulo}</h2></div>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar modal">×</button>
      </header>

      <form onSubmit={salvar}>
        <div className="modal-priority-summary"><span>Prioridade sugerida pelo sistema</span><Badge className={prioridadeClasse[demanda.prioridade_sugerida]}>{demanda.prioridade_sugerida}</Badge><small>{demanda.pontuacao} pontos</small></div>

        <section className="modal-section">
          <label className="field">Status atual<select value={status} onChange={event => setStatus(event.target.value)}>{STATUS_VALIDOS.map(item => <option key={item}>{item}</option>)}</select></label>
          <p className="field-help">Ao mudar o status, uma nova etapa será registrada automaticamente na linha do tempo.</p>
        </section>

        <section className="modal-section client-message-section">
          <div className="section-title"><h3>Resposta ao cliente</h3><p>Esta mensagem ficará visível apenas na consulta por código da solicitação.</p></div>
          <label className="field">Mensagem da equipe<textarea value={mensagemCliente} onChange={event => setMensagemCliente(event.target.value)} placeholder="Ex.: Recebemos sua solicitação e ela está em análise técnica pela equipe responsável." maxLength="500" rows="4" /></label>
          <label className="field">Próxima atualização prevista<input type="date" value={proximaAtualizacao} onChange={event => setProximaAtualizacao(event.target.value)} /></label>
        </section>

        <section className="modal-section manual-section">
          <label className="manual-toggle">
            <input type="checkbox" checked={usarDecisaoManual} onChange={event => setUsarDecisaoManual(event.target.checked)} disabled={demanda.isCritica} />
            <span className="toggle-control" aria-hidden="true"></span>
            <span><strong>Alterar prioridade manualmente</strong><small>A decisão humana ficará registrada com a justificativa.</small></span>
          </label>

          {demanda.isCritica && <p className="critical-lock">Esta demanda é crítica por uma regra de segurança ou indisponibilidade e permanece no topo do ranking.</p>}

          {usarDecisaoManual && !demanda.isCritica && <div className="manual-fields">
            <label className="field">Nova prioridade<select value={prioridade} onChange={event => setPrioridade(event.target.value)}>{PRIORIDADES.map(item => <option key={item}>{item}</option>)}</select></label>
            <label className="field">Responsável pela decisão<input value={responsavel} onChange={event => setResponsavel(event.target.value)} maxLength="80" required /></label>
            <label className="field">Justificativa da mudança<textarea value={motivo} onChange={event => setMotivo(event.target.value)} placeholder="Ex.: Existe compromisso comercial documentado para esta semana." maxLength="400" rows="4" required /></label>
          </div>}
        </section>

        <InternalHistory demanda={demanda} />

        {erro && <p className="form-error" role="alert">{erro}</p>}
        <footer className="modal-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit">Salvar alterações</button></footer>
      </form>
    </section>
  </div>;
}

function Badge({ children, className }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

function InternalHistory({ demanda }) {
  const eventos = (demanda.timeline || []).filter(evento => ['ia', 'triagem', 'decisao_manual', 'decisao_manual_removida'].includes(evento.tipo));
  if (!eventos.length) return null;
  return <section className="modal-section internal-history"><div className="section-title"><h3>Histórico interno</h3><p>Registro de sugestões, avaliações e intervenções humanas. Não aparece para o cliente.</p></div><ol>
    {eventos.map((evento, indice) => <li key={`${evento.tipo}-${evento.data}-${indice}`}><strong>{rotuloEvento(evento)}</strong><span>{descricaoEvento(evento)}</span><small>{formatarDataHora(evento.data)}</small></li>)}
  </ol></section>;
}

function rotuloEvento(evento) {
  return { ia: `Sugestão por ${evento.fonte || 'IA'}`, triagem: 'Triagem técnica registrada', decisao_manual: 'Prioridade alterada manualmente', decisao_manual_removida: 'Decisão manual removida' }[evento.tipo];
}

function descricaoEvento(evento) {
  if (evento.tipo === 'ia') return evento.justificativa || 'Notas sugeridas automaticamente.';
  if (evento.tipo === 'triagem') return 'Notas e critérios técnicos foram registrados para o motor de prioridade.';
  if (evento.tipo === 'decisao_manual') return `${evento.responsavel || 'Gestão interna'} definiu prioridade ${evento.prioridade}. Motivo: ${evento.motivo}`;
  return 'A prioridade voltou a seguir a recomendação do motor.';
}

function formatarDataHora(data) {
  return data ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data)) : 'Data não informada';
}
