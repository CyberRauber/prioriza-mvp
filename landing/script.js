const botaoMenu = document.querySelector(".menu-botao");
const menu = document.querySelector(".menu");
const linksMenu = document.querySelectorAll(".menu a");

botaoMenu.addEventListener("click", function () {
  menu.classList.toggle("aberto");

  const menuAberto = menu.classList.contains("aberto");
  botaoMenu.setAttribute("aria-expanded", menuAberto);
  botaoMenu.setAttribute("aria-label", menuAberto ? "Fechar menu" : "Abrir menu");
});

linksMenu.forEach(function (link) {
  link.addEventListener("click", function () {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
  });
});