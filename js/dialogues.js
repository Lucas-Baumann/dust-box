/* DUST BOX — Diálogos vivos e escolhas dos NPCs (100% i18n) */
(function(global){
"use strict";

function getPool(npcId, S){
  const t = (k, v) => global.DustI18n ? global.DustI18n.t(k, v) : k;

  if(npcId === 'rat'){
    const list = [];
    if((S.ngPlus || 0) >= 1){
      list.push({ key: 'dlg.rat.ng0', vars: { n: S.ngPlus }, text: t('dlg.rat.ng0', { n: S.ngPlus }) });
      list.push({ key: 'dlg.rat.ng1', text: t('dlg.rat.ng1') });
    }
    list.push(
      { key: 'dlg.rat.0', text: t('dlg.rat.0') },
      {
        id: 'rat_filosofia',
        key: 'dlg.rat.filo',
        text: t('dlg.rat.filo'),
        choices: [
          { labelKey: 'dlg.rat.filo.c0', replyKey: 'dlg.rat.filo.r0', label: t('dlg.rat.filo.c0'), reply: t('dlg.rat.filo.r0'), rewardDust: 50 },
          { labelKey: 'dlg.rat.filo.c1', replyKey: 'dlg.rat.filo.r1', label: t('dlg.rat.filo.c1'), reply: t('dlg.rat.filo.r1'), rewardDust: 120 }
        ]
      }
    );
    if(S.unlocks.outOfRoom){
      list.push({
        id: 'rat_portao',
        key: 'dlg.rat.portao',
        text: t('dlg.rat.portao'),
        choices: [
          { labelKey: 'dlg.rat.portao.c0', replyKey: 'dlg.rat.portao.r0', label: t('dlg.rat.portao.c0'), reply: t('dlg.rat.portao.r0') },
          { labelKey: 'dlg.rat.portao.c1', replyKey: 'dlg.rat.portao.r1', label: t('dlg.rat.portao.c1'), reply: t('dlg.rat.portao.r1') }
        ]
      });
    }
    if(S.unlocks.hasCompendium) list.push({ key: 'dlg.rat.comp', text: t('dlg.rat.comp') });
    if(S.achievements.includes('mofo')) list.push({ key: 'dlg.rat.mofo', text: t('dlg.rat.mofo') });
    if((S.accelerators.cat || 0) >= 3 && !S.secrets.includes('caramelo')) list.push({ key: 'dlg.rat.cat', text: t('dlg.rat.cat') });
    return list;
  }

  if(npcId === 'moth'){
    const list = [];
    if((S.ngPlus || 0) >= 1) list.push({ key: 'dlg.moth.ng0', text: t('dlg.moth.ng0') });
    list.push(
      {
        id: 'moth_gosto',
        key: 'dlg.moth.gosto',
        text: t('dlg.moth.gosto'),
        choices: [
          { labelKey: 'dlg.moth.gosto.c0', replyKey: 'dlg.moth.gosto.r0', label: t('dlg.moth.gosto.c0'), reply: t('dlg.moth.gosto.r0') },
          { labelKey: 'dlg.moth.gosto.c1', replyKey: 'dlg.moth.gosto.r1', label: t('dlg.moth.gosto.c1'), reply: t('dlg.moth.gosto.r1'), rewardDust: 150 }
        ]
      },
      { key: 'dlg.moth.0', text: t('dlg.moth.0') },
      { key: 'dlg.moth.1', text: t('dlg.moth.1') }
    );
    if(S.unlocks.hasMap) list.push({ key: 'dlg.moth.map', text: t('dlg.moth.map') });
    if(S.inventory.armor === 'mascara_antipoeira') list.push({ key: 'dlg.moth.mask', text: t('dlg.moth.mask') });
    if(S.achievements.includes('baratao')) list.push({ key: 'dlg.moth.boss', text: t('dlg.moth.boss') });
    return list;
  }

  if(npcId === 'termite'){
    const list = [
      {
        id: 'termite_moveis',
        key: 'dlg.termite.mov',
        text: t('dlg.termite.mov'),
        choices: [
          { labelKey: 'dlg.termite.mov.c0', replyKey: 'dlg.termite.mov.r0', label: t('dlg.termite.mov.c0'), reply: t('dlg.termite.mov.r0'), rewardDust: 250 },
          { labelKey: 'dlg.termite.mov.c1', replyKey: 'dlg.termite.mov.r1', label: t('dlg.termite.mov.c1'), reply: t('dlg.termite.mov.r1'), rewardDust: 150 }
        ]
      },
      { key: 'dlg.termite.0', text: t('dlg.termite.0') }
    ];
    if(S.inventory.weapon === 'rodo_combate') list.push({ key: 'dlg.termite.rodo', text: t('dlg.termite.rodo') });
    if(['cabo_hdmi','aspirador_entupido','vassoura_eletrica','ponteiro_12h'].includes(S.inventory.weapon)) list.push({ key: 'dlg.termite.high', text: t('dlg.termite.high') });
    return list;
  }

  if(npcId === 'spider'){
    const list = [
      {
        id: 'spider_moda',
        key: 'dlg.spider.moda',
        text: t('dlg.spider.moda'),
        choices: [
          { labelKey: 'dlg.spider.moda.c0', replyKey: 'dlg.spider.moda.r0', label: t('dlg.spider.moda.c0'), reply: t('dlg.spider.moda.r0'), rewardDust: 300 },
          { labelKey: 'dlg.spider.moda.c1', replyKey: 'dlg.spider.moda.r1', label: t('dlg.spider.moda.c1'), reply: t('dlg.spider.moda.r1') }
        ]
      },
      { key: 'dlg.spider.0', text: t('dlg.spider.0') }
    ];
    if(S.inventory.bag === 'mala_sotao' || S.inventory.bag === 'bau_sem_fundo') list.push({ key: 'dlg.spider.bag', text: t('dlg.spider.bag') });
    return list;
  }

  if(npcId === 'beetle'){
    const list = [
      {
        id: 'beetle_alquimia',
        key: 'dlg.beetle.alq',
        text: t('dlg.beetle.alq'),
        choices: [
          { labelKey: 'dlg.beetle.alq.c0', replyKey: 'dlg.beetle.alq.r0', label: t('dlg.beetle.alq.c0'), reply: t('dlg.beetle.alq.r0'), rewardDust: 400 },
          { labelKey: 'dlg.beetle.alq.c1', replyKey: 'dlg.beetle.alq.r1', label: t('dlg.beetle.alq.c1'), reply: t('dlg.beetle.alq.r1'), rewardDust: 400 }
        ]
      },
      { key: 'dlg.beetle.0', text: t('dlg.beetle.0') }
    ];
    if(S.key.fragments > 0 && !S.key.complete) list.push({ key: 'dlg.beetle.frags', vars: { n: S.key.fragments }, text: t('dlg.beetle.frags', { n: S.key.fragments }) });
    if(S.key.complete) list.push({ key: 'dlg.beetle.done', text: t('dlg.beetle.done') });
    return list;
  }

  if(npcId === 'remote'){
    return [
      {
        id: 'remote_pilha',
        key: 'dlg.remote.pilha',
        text: t('dlg.remote.pilha'),
        choices: [
          { labelKey: 'dlg.remote.pilha.c0', replyKey: 'dlg.remote.pilha.r0', label: t('dlg.remote.pilha.c0'), reply: t('dlg.remote.pilha.r0'), rewardSocks: 1 },
          { labelKey: 'dlg.remote.pilha.c1', replyKey: 'dlg.remote.pilha.r1', label: t('dlg.remote.pilha.c1'), reply: t('dlg.remote.pilha.r1'), rewardSocks: 1 }
        ]
      },
      { key: 'dlg.remote.0', text: t('dlg.remote.0') },
      { key: 'dlg.remote.1', text: t('dlg.remote.1') }
    ];
  }

  if(npcId === 'guitar'){
    return [
      {
        id: 'guitar_corda',
        key: 'dlg.guitar.corda',
        text: t('dlg.guitar.corda'),
        choices: [
          { labelKey: 'dlg.guitar.corda.c0', replyKey: 'dlg.guitar.corda.r0', label: t('dlg.guitar.corda.c0'), reply: t('dlg.guitar.corda.r0'), rewardSocks: 1 },
          { labelKey: 'dlg.guitar.corda.c1', replyKey: 'dlg.guitar.corda.r1', label: t('dlg.guitar.corda.c1'), reply: t('dlg.guitar.corda.r1'), rewardSocks: 1 }
        ]
      },
      { key: 'dlg.guitar.0', text: t('dlg.guitar.0') },
      { key: 'dlg.guitar.1', text: t('dlg.guitar.1') }
    ];
  }

  return [{ text: '"..."' }];
}

global.DustDialogues = { getPool };
})(window);
