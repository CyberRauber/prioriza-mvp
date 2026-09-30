import React from 'react';
import {
  calcularImportanciaEisenhower,
  calcularUrgenciaEisenhower,
  definirQuadranteEisenhower,
  obterPrioridadeFinal
} from '../core/priorizacao.js';

const quadrantes = [
  { id: 'fazer', ordem: '1', titulo: 'Fazer primeiro', descricao: 'Importante e urgente', classe: 'quadrant-fazer' },
  { id: 'planejar', ordem: '2', titulo: 'Planejar', descricao: 'Importante, mas não urgente', classe: 'quadrant-planejar' },
  { id: 'delegar', ordem: '3', titulo: 'Delegar ou avaliar', descricao: 'Urgente, mas menos importante', classe: 'quadrant-delegar' },
  { id: 'avaliar', ordem: '4', titulo: 'Avaliar depois', descricao: 'Nem urgente nem importante', classe: 'quadrant-avaliar' }
];

const prioridadeClasse = { Crítica: 'badge-critica', Alta: 'badge-alta', Média: 'badge-media', Baixa: 'badge-baixa' };

/** @param {{ demandas: import('../core/priorizacao.js').Demanda[] }} props */
export default function MatrizEisenhower({ demandas }) {
  const demandasAvaliadas = demandas.filter(demanda => !demanda.triagem_pendente);
  const porQuadrante = demandasAvaliadas.reduce((grupos, demanda) => {
    grupos[definirQuadranteEisenhower(demanda)].push(demanda);
    return grupos;
  }, { fazer: [], planejar: [], delegar: [], avaliar: [] });

  return <section className="matrix-page">
    <header className="page-header">
      <div><p className="eyebrow">Visualização da prioridade</p><h1>Matriz de Eisenhower</h1><p>Organize as demandas por urgência e importância, sem substituir a pontuação detalhada.</p></div>
    </header>

    <section className="matrix-help"><span>↕ Importância: gravidade, impacto e risco</span><span>↔ Urgência: SLA e prazo</span><span>● Demandas críticas ficam em “Fazer primeiro”</span></section>

    <div className="matrix-grid">
      {quadrantes.map(quadrante => <section className={`matrix-quadrant ${quadrante.classe}`} key={quadrante.id}>
        <header><span className="quadrant-number">{quadrante.ordem}</span><div><h2>{quadrante.titulo}</h2><p>{quadrante.descricao}</p></div><strong>{porQuadrante[quadrante.id].length}</strong></header>
        <div className="matrix-cards">
          {porQuadrante[quadrante.id].map(demanda => {
            const prioridade = obterPrioridadeFinal(demanda);
            return <article className="matrix-demand-card" key={demanda.id}>
              <div><span className="matrix-id">{demanda.id}</span><Badge className={prioridadeClasse[prioridade]}>{prioridade}</Badge></div>
              <h3>{demanda.titulo}</h3>
              <p>Importância {calcularImportanciaEisenhower(demanda)} · Urgência {calcularUrgenciaEisenhower(demanda)}</p>
            </article>;
          })}
          {porQuadrante[quadrante.id].length === 0 && <p className="matrix-empty">Nenhuma demanda neste quadrante.</p>}
        </div>
      </section>)}
    </div>
  </section>;
}

function Badge({ children, className }) {
  return <span className={`badge ${className}`}>{children}</span>;
}
