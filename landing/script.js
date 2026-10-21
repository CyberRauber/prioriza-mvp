const botaoMenu = document.querySelector(".menu-botao");
const menu = document.querySelector(".menu");
const linksMenu = document.querySelectorAll(".menu a");

if (botaoMenu && menu) {
  botaoMenu.addEventListener("click", function () {
    menu.classList.toggle("aberto");
    const menuAberto = menu.classList.contains("aberto");
    botaoMenu.setAttribute("aria-expanded", String(menuAberto));
    botaoMenu.setAttribute("aria-label", menuAberto ? "Fechar menu" : "Abrir menu");
  });
  linksMenu.forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("aberto");
      botaoMenu.setAttribute("aria-expanded", "false");
      botaoMenu.setAttribute("aria-label", "Abrir menu");
    });
  });
}

const quadrantes = {
  fazer: {
    label: "QUADRANTE 01", titulo: "Fazer primeiro",
    texto: "Tarefas importantes que também exigem atenção imediata. Dê prioridade, combine quem vai cuidar e acompanhe até resolver.",
    exemplo: "Corrigir uma falha que impede clientes de usar uma função essencial.",
    dica: "O que acontece se isso não for resolvido hoje?"
  },
  planejar: {
    label: "QUADRANTE 02", titulo: "Planejar",
    texto: "Atividades importantes para os objetivos, mas que não precisam ser resolvidas agora. Reserve tempo no calendário para evitar que virem urgências.",
    exemplo: "Planejar uma melhoria de segurança ou uma etapa importante do produto.",
    dica: "Qual é o melhor momento para trabalhar nisso sem virar uma emergência?"
  },
  delegar: {
    label: "QUADRANTE 03", titulo: "Delegar ou simplificar",
    texto: "Tarefas com prazo curto, mas com menor contribuição para os objetivos principais. Quando fizer sentido, delegue, automatize ou reduza o escopo.",
    exemplo: "Responder a uma dúvida simples que outra pessoa da equipe pode resolver com rapidez.",
    dica: "Precisa mesmo ser você a fazer isso agora?"
  },
  eliminar: {
    label: "QUADRANTE 04", titulo: "Reconsiderar",
    texto: "Atividades que não são importantes e também não são urgentes podem ser adiadas, reduzidas ou removidas para abrir espaço ao que importa.",
    exemplo: "Uma reunião sem objetivo definido ou uma tarefa que não contribui para a entrega.",
    dica: "O que realmente se perde se essa atividade não acontecer?"
  }
};

document.querySelectorAll("[data-quadrante]").forEach(function (botao) {
  botao.addEventListener("click", function () {
    const chave = botao.dataset.quadrante;
    const dados = quadrantes[chave];
    if (!dados) return;
    document.querySelectorAll("[data-quadrante]").forEach(function (item) {
      const ativo = item === botao;
      item.classList.toggle("ativo", ativo);
      item.setAttribute("aria-pressed", String(ativo));
    });
    document.querySelector("#exp-label").textContent = dados.label;
    document.querySelector("#exp-titulo").textContent = dados.titulo;
    document.querySelector("#exp-texto").textContent = dados.texto;
    document.querySelector("#exp-exemplo").textContent = dados.exemplo;
    document.querySelector("#exp-dica").textContent = dados.dica;
  });
});

const conteudoModal = {
  cliente: {
    titulo: "Acompanhamento transparente",
    texto: "Quem solicita registra a demanda e recebe um código para consultar seu andamento. Isso ajuda a acompanhar as atualizações sem depender de mensagens soltas ou precisar perguntar toda hora."
  },
  equipe: {
    titulo: "Priorização com contexto",
    texto: "A equipe compara impacto, urgência e outras informações relevantes. A matriz ajuda a organizar a conversa; a decisão final considera o contexto e a avaliação das pessoas responsáveis."
  },
  fila: {
    titulo: "Uma fila compartilhada",
    texto: "Com as solicitações reunidas, fica mais fácil discutir a ordem de atendimento, alinhar expectativas e comunicar os próximos passos com mais clareza."
  }
};

const modal = document.querySelector("#modal-info");
document.querySelectorAll("[data-modal]").forEach(function (botao) {
  botao.addEventListener("click", function () {
    const dados = conteudoModal[botao.dataset.modal];
    if (!dados || !modal) return;
    document.querySelector("#modal-titulo").textContent = dados.titulo;
    document.querySelector("#modal-texto").textContent = dados.texto;
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
  });
});

function fecharModal() {
  if (!modal) return;
  if (typeof modal.close === "function") modal.close();
  else modal.removeAttribute("open");
}
document.querySelector(".modal-fechar")?.addEventListener("click", fecharModal);
document.querySelector(".modal-ok")?.addEventListener("click", fecharModal);
modal?.addEventListener("click", function (evento) {
  if (evento.target === modal) fecharModal();
});
