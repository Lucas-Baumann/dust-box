/* DUST BOX — Engine de Internacionalização (pt/en/es) + Balão de Tradução no Hover */
(function(global){
"use strict";

const VANILLA_LANGS = ['pt', 'en', 'es'];
const LANG_NAMES = { pt: 'pt', en: 'en', es: 'es' };
const packs = {};
const communityMeta = []; // [{ code, name, author, file }]
const communityCache = {}; // code -> dict

let curLang = 'pt';
let hoverLang = 'off'; // 'off' | 'pt' | 'en' | 'es' | community code
let bubbleEl = null;

function register(code, dict){
  packs[code] = dict || {};
}

function interpolate(str, vars){
  if(!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

function rawLookup(langCode, key){
  if(packs[langCode] && key in packs[langCode]) return packs[langCode][key];
  if(communityCache[langCode] && key in communityCache[langCode]) return communityCache[langCode][key];
  return null;
}

function t(key, vars, fallback){
  const v = rawLookup(curLang, key);
  if(v !== null) return interpolate(v, vars);
  const pt = rawLookup('pt', key);
  if(pt !== null) return interpolate(pt, vars);
  return fallback !== undefined ? interpolate(fallback, vars) : key;
}

function th(key, vars){
  if(!hoverLang || hoverLang === 'off' || hoverLang === curLang) return null;
  const v = rawLookup(hoverLang, key);
  if(v === null) return null;
  return interpolate(v, vars);
}

function escAttr(s){
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function trAttr(key, vars){
  const hv = th(key, vars);
  return hv ? ` data-tr="${escAttr(hv)}"` : '';
}

function tx(key, vars, fallback){
  const main = t(key, vars, fallback);
  const hv = th(key, vars);
  if(!hv) return escHtml(main);
  return `<span class="i18n-t" data-tr="${escAttr(hv)}">${escHtml(main)}</span>`;
}

function setLang(code){
  if(VANILLA_LANGS.includes(code)) curLang = code;
}
function getLang(){ return curLang; }

function getHoverOptions(){
  const opts = [{ code: 'off', label: 'off' }];
  VANILLA_LANGS.forEach(c => opts.push({ code: c, label: LANG_NAMES[c] || c }));
  communityMeta.forEach(m => opts.push({ code: m.code, label: `${m.code} (com.)` }));
  return opts;
}

function setHoverLang(code, onReady){
  hoverLang = code || 'off';
  if(hoverLang !== 'off' && !packs[hoverLang] && !communityCache[hoverLang]){
    const meta = communityMeta.find(m => m.code === hoverLang);
    if(meta && typeof fetch === 'function'){
      fetch(`lang/community/${meta.file}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if(d && typeof d === 'object') communityCache[meta.code] = d;
          if(onReady) onReady();
        })
        .catch(() => {});
      return;
    }
  }
  if(onReady) onReady();
}
function getHoverLang(){ return hoverLang; }

function getHoverLabel(){
  const opt = getHoverOptions().find(o => o.code === hoverLang);
  return opt ? opt.label : 'off';
}

function loadCommunityIndex(onLoaded){
  if(typeof fetch !== 'function') return;
  fetch('lang/community/index.json')
    .then(r => r.ok ? r.json() : null)
    .then(list => {
      if(Array.isArray(list)){
        communityMeta.length = 0;
        list.forEach(item => {
          if(item && item.code && item.file) communityMeta.push(item);
        });
        if(onLoaded) onLoaded();
      }
    })
    .catch(() => {});
}

function applyStatic(){
  if(typeof document === 'undefined' || !document.querySelectorAll) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if(!key) return;
    el.textContent = t(key);
    const hv = th(key);
    if(hv) el.setAttribute('data-tr', hv);
    else el.removeAttribute('data-tr');
  });
}

function initHoverBubble(){
  if(typeof document === 'undefined' || !document.body) return;
  if(!bubbleEl){
    bubbleEl = document.getElementById('tr-bubble');
    if(!bubbleEl){
      bubbleEl = document.createElement('div');
      bubbleEl.id = 'tr-bubble';
      bubbleEl.className = 'tr-bubble hidden';
      if(document.body.appendChild) document.body.appendChild(bubbleEl);
    }
  }

  let activeTarget = null;
  function showFor(target){
    if(!bubbleEl || hoverLang === 'off') return;
    const text = target.getAttribute('data-tr');
    if(!text) return;
    activeTarget = target;
    bubbleEl.textContent = text;
    bubbleEl.classList.remove('hidden');
    if(typeof target.getBoundingClientRect === 'function' && typeof bubbleEl.getBoundingClientRect === 'function'){
      const rect = target.getBoundingClientRect();
      const bRect = bubbleEl.getBoundingClientRect();
      const vw = global.innerWidth || 800;
      let left = rect.left + (rect.width / 2) - (bRect.width / 2);
      left = Math.max(8, Math.min(vw - bRect.width - 8, left));
      let top = rect.top - bRect.height - 10;
      if(top < 8) top = rect.bottom + 10;
      bubbleEl.style.left = Math.round(left) + 'px';
      bubbleEl.style.top = Math.round(top) + 'px';
    }
  }
  function hide(){
    activeTarget = null;
    if(bubbleEl) bubbleEl.classList.add('hidden');
  }

  document.addEventListener('mouseover', (e) => {
    if(hoverLang === 'off') return;
    const el = e.target && e.target.closest ? e.target.closest('[data-tr]') : null;
    if(el) showFor(el);
    else if(activeTarget) hide();
  });
  document.addEventListener('mouseout', (e) => {
    if(!activeTarget) return;
    const rel = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('[data-tr]') : null;
    if(rel !== activeTarget) hide();
  });
  document.addEventListener('scroll', hide, true);
}

global.DustI18n = {
  VANILLA_LANGS,
  register, t, th, tx, trAttr,
  setLang, getLang,
  setHoverLang, getHoverLang, getHoverOptions, getHoverLabel,
  loadCommunityIndex, applyStatic, initHoverBubble,
  getPack: (code) => packs[code] || communityCache[code] || {}
};
})(window);
