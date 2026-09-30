import React, { useMemo, useState } from 'react';

const ETAPAS = [
  'Solicitação recebida',
  'Em análise técnica',
  'Em desenvolvimento',
  'Concluída'
];

const TEXTO_CLIENTE = {
  'Solicitação recebida': {
    titulo: 'Recebemos sua solicitação',
    mensagem: 'Ela foi registrada e será encaminhada para a avaliação técnica da equipe.',
    proximo: 'A equipe analisará as informações enviadas e atualizará a situação quando houver um próximo passo.'
  },
  'Em análise técnica': {
    titulo: 'Sua solicitação está em análise técnica',
    mensagem: 'A equipe está avaliando o impacto e a melhor forma de atender a sua necessidade.',
    proximo: 'Após a análise, a equipe definirá o próximo encaminhamento e manterá esta solicitação registrada.'
  },
  'Em desenvolvimento': {
    titulo: 'A equipe iniciou o desenvolvimento',
    mensagem: 'Sua solicitação está sendo trabalhada pela equipe responsável.',
    proximo: 'Quando a entrega estiver pronta, esta página será atualizada como concluída.'
  },
  Concluída: {
    titulo: 'Sua solicitação foi concluída',
    mensagem: 'A equipe finalizou o atendimento desta solicitação.',
    proximo: 'Caso seja necessário complementar alguma informação, informe este código ao entrar em contato com a empresa.'
  }
};

function formatarStatus(status) {
  return status === 'Solicitação recebida' ? 'Solicitação recebida' : status;
}

function indiceDaEtapa(status) {
  const indice = ETAPAS.indexOf(status);
  return indice === -1 ? 0 : indice;
}

function formatarData(data) {
  if (!data) return null;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(`${data}T12:00:00`));
}

/** Visão externa: nunca revela prioridade, pontuação ou critérios internos. */
export default function Acompanhamento({ demandas }) {
  const [codigo, setCodigo] = useState('');
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const demanda = useMemo(() => {
    const id = codigo.trim().toUpperCase();
    return demandas.find(item => item.id.toUpperCase() === id) || null;
  }, [codigo, demandas]);

  const status = demanda?.status || 'Solicitação recebida';
  const comunicacao = TEXTO_CLIENTE[status] || TEXTO_CLIENTE['Solicitação recebida'];
  const etapaAtual = indiceDaEtapa(status);
  const mensagemEquipe = demanda?.mensagem_cliente?.texto;
  const proximaAtualizacao = formatarData(demanda?.proxima_atualizacao);

  function consultar(event) {
    event.preventDefault();
    setBuscaRealizada(true);
  }

  return <section className="tracking-page">
    <header className="tracking-header">
      <p className="eyebrow">Portal do cliente</p>
      <h1>Acompanhe sua solicitação</h1>
      <p>Consulte a situação usando o código recebido no registro.</p>
    </header>

    <form className="tracking-search" onSubmit={consultar}>
      <label htmlFor="codigo-demanda">Código da solicitação</label>
      <div>
        <input id="codigo-demanda" value={codigo} onChange={event => setCodigo(event.target.value)} placeholder="Ex.: DEM-001" autoCapitalize="characters" />
        <button className="primary-button" type="submit">Consultar</button>
      </div>
    </form>

    {buscaRealizada && !demanda && <p className="tracking-empty">Não encontramos uma solicitação com este código. Confira o código e tente novamente.</p>}

    {buscaRealizada && demanda && <article className="tracking-card client-tracking-card">
      <header className="tracking-card-header">
        <div><span className="demand-id">{demanda.id}</span><h2>{demanda.titulo}</h2></div>
        <span className="client-status">{formatarStatus(status)}</span>
      </header>
      <div className="tracking-content">
        <div className="tracking-details">
          <p className="eyebrow">Situação atual</p>
          <h3>{comunicacao.titulo}</h3>
          <p>{comunicacao.mensagem}</p>
          {mensagemEquipe && <div className="team-message"><strong>Mensagem da equipe</strong><span>{mensagemEquipe}</span></div>}
          <div className="next-step"><strong>Próximo passo</strong><span>{comunicacao.proximo}</span></div>
          {proximaAtualizacao && <p className="next-update">Nova atualização prevista até <b>{proximaAtualizacao}</b>.</p>}
          <p className="client-code-note">Guarde o código <b>{demanda.id}</b>. Ele ajuda a equipe a localizar sua solicitação caso você precise entrar em contato.</p>
        </div>
        <section className="timeline-section" aria-label="Etapas da solicitação">
          <p className="eyebrow">Etapas</p>
          <ol className="vertical-timeline client-timeline">
            {ETAPAS.map((etapa, indice) => <li key={etapa} className={indice < etapaAtual ? 'done' : indice === etapaAtual ? 'current' : ''}>
              <span className="timeline-point">{indice < etapaAtual ? '✓' : indice + 1}</span>
              <strong>{etapa}</strong>
            </li>)}
          </ol>
        </section>
      </div>
    </article>}
  </section>;
}
