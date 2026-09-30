import React, { useState } from 'react';
import { GATILHOS_CRITICOS } from '../core/priorizacao.js';
import { sugerirNotasComIA } from '../core/sugestaoIA.js';

const criteriosIniciais = {
  gravidade: 3, impacto_cliente: 3, clientes_afetados: 3, urgencia_sla: 3,
  impacto_financeiro: 3, risco_operacional: 3, prazo: 3, esforco: 3
};

const criterios = [
  ['gravidade', 'Gravidade'], ['impacto_cliente', 'Impacto no cliente'], ['clientes_afetados', 'Clientes afetados'], ['urgencia_sla', 'Urgência / SLA'],
  ['impacto_financeiro', 'Impacto financeiro'], ['risco_operacional', 'Risco operacional'], ['prazo', 'Prazo formal'], ['esforco', 'Esforço estimado']
];

export default function ModalTriagem({ demanda, demandasAtivas, onClose, onSave }) {
  const [notas, setNotas] = useState(criteriosIniciais);
  const [gatilhos, setGatilhos] = useState([]);
  const [vinculadaA, setVinculadaA] = useState('');
  const [iaSugestao, setIaSugestao] = useState(null);
  const [iaCarregando, setIaCarregando] = useState(false);
  const [iaErro, setIaErro] = useState('');

  function alterarGatilho(gatilho) {
    setGatilhos(atuais => atuais.includes(gatilho) ? atuais.filter(item => item !== gatilho) : [...atuais, gatilho]);
  }

  function salvar(event) {
    event.preventDefault();
    onSave({ criterios: notas, gatilhos, vinculadaA, iaSugestao });
  }

  async function sugerirComIA() {
    setIaCarregando(true);
    setIaErro('');
    try {
      const sugestao = await sugerirNotasComIA(demanda.titulo, demanda.descricao);
      const registro = { ...sugestao, data: new Date().toISOString() };
      setNotas(registro.notas);
      setIaSugestao(registro);
    } catch (error) {
      setIaErro(error.message || 'Não foi possível gerar a sugestão da IA.');
    } finally {
      setIaCarregando(false);
    }
  }

  return <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
    <section className="management-modal triage-modal" role="dialog" aria-modal="true" aria-labelledby="triagem-title" onMouseDown={event => event.stopPropagation()}>
      <header className="modal-header"><div><span className="demand-id">{demanda.id}</span><h2 id="triagem-title">Avaliar demanda</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label="Fechar modal">×</button></header>
      <form onSubmit={salvar}>
        <section className="triage-request"><strong>{demanda.titulo}</strong><p>{demanda.descricao || 'Sem descrição informada.'}</p></section>
        <section className="modal-section"><div className="section-title triage-title-row"><div><h2>Avaliação técnica</h2><p>Defina as notas de 1 a 5 com base nas evidências disponíveis.</p></div><button className="ia-suggest-button" type="button" onClick={sugerirComIA} disabled={iaCarregando}>{iaCarregando ? 'Analisando...' : '✦ Sugerir notas (IA)'}</button></div>{iaSugestao && <div className="ia-suggestion"><strong>{iaSugestao.fonte} preencheu uma sugestão</strong><span>{iaSugestao.justificativa}</span><small>Revise os controles antes de concluir a triagem.</small></div>}{iaErro && <p className="form-error" role="alert">{iaErro}</p>}<div className="criteria-grid">
          {criterios.map(([id, titulo]) => <label className="criterion-control" key={id}><span className="criterion-heading"><span>{titulo}</span><output>{notas[id]}/5</output></span><input type="range" min="1" max="5" value={notas[id]} onChange={event => setNotas(atuais => ({ ...atuais, [id]: Number(event.target.value) }))} /><span className="criterion-labels"><span>1 · Baixo</span><span>5 · Alto</span></span></label>)}
        </div></section>
        <section className="modal-section"><div className="section-title"><h2>Regra crítica</h2><p>Use somente em indisponibilidade, segurança ou perda de dados.</p></div><div className="critical-options">
          {GATILHOS_CRITICOS.map(gatilho => <label className={`critical-option ${gatilhos.includes(gatilho) ? 'selected' : ''}`} key={gatilho}><input type="checkbox" checked={gatilhos.includes(gatilho)} onChange={() => alterarGatilho(gatilho)} /><span>{gatilho}</span></label>)}
        </div></section>
        <section className="modal-section"><label className="field">Demanda relacionada <select value={vinculadaA} onChange={event => setVinculadaA(event.target.value)}><option value="">Nenhuma</option>{demandasAtivas.map(item => <option key={item.id} value={item.id}>{item.id} - {item.titulo}</option>)}</select></label><p className="field-help">O vínculo é apenas uma sugestão visual para a equipe. Nenhuma demanda é unida automaticamente.</p></section>
        <footer className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button">Concluir triagem</button></footer>
      </form>
    </section>
  </div>;
}
