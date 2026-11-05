/* Metalúrgica Imperial — interações: animação de entrada, filtro do portfólio e ampliação das fotos */
(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Título do hero: linhas reveladas após o carregamento ---------- */
  var titulo = document.querySelector('.hero h1');
  if (titulo) window.setTimeout(function () { titulo.classList.add('titulo-ativo'); }, 220);

  /* ---------- Entrada ao rolar, com atraso escalonado entre irmãos ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var grupos = document.querySelectorAll('.grade, .etapas, .orcamento__lista, .lista-linhas, .valores, .depoimentos');
  grupos.forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (filho, i) {
      filho.style.setProperty('--d', (i * 0.1).toFixed(1) + 's');
    });
  });
  // textos de apoio do cabeçalho de seção e do hero entram em sequência
  document.querySelectorAll('.hero__texto > *').forEach(function (el, i) {
    if (el.tagName === 'H1') return; // o h1 usa a revelação por linhas
    el.classList.add('reveal');
    el.style.setProperty('--d', (0.1 + i * 0.15).toFixed(2) + 's');
  });
  reveals = document.querySelectorAll('.reveal');

  function liberar(e) {
    if (e.animationName === 'entrada') e.currentTarget.classList.add('pronto');
  }
  function revelar(el) {
    el.classList.add('visivel');
    el.addEventListener('animationend', liberar, { once: true });
  }
  if ('IntersectionObserver' in window && !semMovimento) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { revelar(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visivel', 'pronto'); });
  }

  /* ---------- Luz que acompanha o mouse nos cards (só com mouse) ---------- */
  if (window.matchMedia('(hover: hover)').matches && !semMovimento) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Rodapé: abre e fecha cada coluna ao clicar no título ---------- */
  document.querySelectorAll('.rodape__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var col = btn.closest('.rodape__col');
      var aberto = col.classList.toggle('aberto');
      btn.setAttribute('aria-expanded', String(aberto));
    });
  });

  /* ---------- Filtro do portfólio ---------- */
  var filtros = document.querySelectorAll('.filtro');
  var itens = Array.prototype.slice.call(document.querySelectorAll('#galeria .item'));

  filtros.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var alvo = btn.getAttribute('data-filtro');
      filtros.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var n = 0;
      itens.forEach(function (li) {
        li.hidden = !(alvo === 'todos' || li.getAttribute('data-cat') === alvo);
        li.classList.remove('reentra');
        if (!li.hidden) {
          li.style.setProperty('--d', (Math.min(n++, 8) * 0.05).toFixed(2) + 's');
          void li.offsetWidth; // reinicia a animação
          li.classList.add('reentra');
        }
      });
    });
  });

  /* ---------- Ampliação (lightbox) ---------- */
  var box = document.getElementById('lightbox');
  if (!box || typeof box.showModal !== 'function') return;

  var midia = document.getElementById('lightbox-media');
  var legenda = document.getElementById('lightbox-legenda');
  var atual = -1;

  function visiveis() { return itens.filter(function (li) { return !li.hidden; }); }

  function mostrar(li) {
    var origem = li.querySelector('.item__media');
    midia.innerHTML = '';
    var clone = origem.firstElementChild.cloneNode(true);
    if (clone.tagName === 'IMG') { clone.removeAttribute('loading'); }
    midia.appendChild(clone);
    legenda.textContent = li.querySelector('.item__legenda').textContent;
  }

  function abrir(li) {
    atual = visiveis().indexOf(li);
    mostrar(li);
    if (!box.open) box.showModal();
  }

  function mover(passo) {
    var lista = visiveis();
    if (!lista.length) return;
    atual = (atual + passo + lista.length) % lista.length;
    mostrar(lista[atual]);
  }

  itens.forEach(function (li) {
    li.querySelector('.item__btn').addEventListener('click', function () { abrir(li); });
  });

  box.querySelector('[data-fechar]').addEventListener('click', function () { box.close(); });
  box.querySelector('[data-ant]').addEventListener('click', function () { mover(-1); });
  box.querySelector('[data-prox]').addEventListener('click', function () { mover(1); });

  // Fecha ao clicar no fundo escuro
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });

  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') mover(-1);
    if (e.key === 'ArrowRight') mover(1);
  });
})();
