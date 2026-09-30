import React, { useState } from 'react';

/** Portal externo: o cliente registra somente o necessário. */
export default function NovaDemanda({ addDemanda, onTrack }) {
  const [dados, setDados] = useState({ titulo: '', descricao: '', origem: 'Cliente' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(null);

  function alterar(event) {
    const { name, value } = event.target;
    setDados(atuais => ({ ...atuais, [name]: value }));
  }

  function enviar(event) {
    event.preventDefault();
    setErro('');
    try {
      const demanda = addDemanda(dados);
      setSucesso(demanda.id);
      setDados({ titulo: '', descricao: '', origem: 'Cliente' });
    } catch (error) {
      setErro(error.message || 'Não foi possível registrar a solicitação.');
    }
  }

  return <section className="new-demand-page">
    <header className="page-header form-page-header">
      <div><p className="eyebrow">Portal do cliente</p><h1>Nova solicitação</h1><p>Conte brevemente o que aconteceu. A equipe responsável fará a avaliação técnica.</p></div>
    </header>

    <form className="demand-form" onSubmit={enviar}>
      <section className="form-section">
        <div className="section-title"><h2>Sobre sua solicitação</h2><p>São apenas três informações para começar.</p></div>
        <div className="basic-grid">
          <label className="field field-wide">Título <span aria-hidden="true">*</span><input name="titulo" value={dados.titulo} onChange={alterar} placeholder="Ex.: Não consigo acessar o relatório" maxLength="80" required /></label>
          <label className="field field-wide">Descrição <textarea name="descricao" value={dados.descricao} onChange={alterar} placeholder="Explique o que está acontecendo e, se possível, quando começou..." maxLength="500" rows="5" /></label>
          <label className="field">Origem <select name="origem" value={dados.origem} onChange={alterar}><option>Cliente</option><option>Suporte</option><option>Comercial</option><option>Produto</option></select></label>
        </div>
      </section>

      {sucesso && <div className="request-success" role="status"><strong>Solicitação registrada com sucesso.</strong><span>O código da sua solicitação é <b>{sucesso}</b>. A equipe responsável fará a avaliação técnica.</span><button className="secondary-button" type="button" onClick={onTrack}>Acompanhar solicitação</button></div>}
      {erro && <p className="form-error" role="alert">{erro}</p>}
      <aside className="lgpd-notice" role="note"><strong>Cuide das suas informações</strong><span>Para sua segurança, não inclua senhas, chaves de acesso, dados financeiros ou informações sensíveis de clientes no relato da sua solicitação.</span></aside>
      <div className="form-actions"><button className="primary-button" type="submit">Enviar solicitação</button></div>
    </form>
  </section>;
}
