/* DUST BOX — English Catalog (items, gear, skills, secrets, achievements, zones, monsters) */
(function(global){
"use strict";

global.DustI18n.register('en', {
  // Accelerators
  'acc.window.name': 'Half-Open Window', 'acc.window.desc': 'Lets street breeze drift in carrying dust.',
  'acc.cat.name': 'Lazy Cat', 'acc.cat.desc': 'Cleans nothing and sheds fur twice a day.',
  'acc.carpet.name': '1980s Carpet', 'acc.carpet.desc': 'Traps grime from four different decades.',
  'acc.fan.name': 'Wobbly Fan', 'acc.fan.desc': 'Spins slowly and scatters dust everywhere.',
  'acc.pillow.name': 'Forgotten Cushion', 'acc.pillow.desc': 'Holds crumbs from 2019 and rusty pennies.',
  'acc.box16.name': '2016 Moving Box', 'acc.box16.desc': 'Never unpacked since the last move.',
  'acc.dvds.name': 'Bootleg DVD Shelf', 'acc.dvds.desc': '3-in-1 collections coated in gray nostalgia.',

  // Relics
  'rel.meia_sorte.name': 'Lucky Sock', 'rel.meia_sorte.effect': '+45% global D/s', 'rel.meia_sorte.desc': 'Never found its match, yet brings dusty fortune.',
  'rel.controle_univ.name': 'Universal Remote', 'rel.controle_univ.effect': '+35% global ATK', 'rel.controle_univ.desc': 'Cannot turn on the TV, yet boosts your combat morale.',
  'rel.moeda_1998.name': '1998 Coin', 'rel.moeda_1998.effect': '+75% global D/s', 'rel.moeda_1998.desc': 'Found in the deepest abyss of the couch.',

  // Weapons
  'wep.vassoura_quebrada.name': 'Broken Broom', 'wep.vassoura_quebrada.passive': 'None', 'wep.vassoura_quebrada.desc': '+2 ATK. Breaks more than it sweeps.', 'wep.vassoura_quebrada.hint': 'Sold where someone snacks on dust in the castle center.',
  'wep.espanador_pena.name': 'Feather Duster', 'wep.espanador_pena.passive': '15% Crit (1.5x dmg)', 'wep.espanador_pena.desc': '+8 ATK. Ancestral pigeon feather.', 'wep.espanador_pena.hint': 'Forged where wood creaks to the east.',
  'wep.rodo_combate.name': 'Combat Squeegee', 'wep.rodo_combate.passive': '20% Knockback (skips counter)', 'wep.rodo_combate.desc': '+25 ATK. Classic janitor weapon.', 'wep.rodo_combate.hint': 'Forged in the East Wing after the Duster.',
  'wep.cabo_hdmi.name': '5-Meter HDMI Cable', 'wep.cabo_hdmi.passive': '25% Double Lash (+50% dmg)', 'wep.cabo_hdmi.desc': '+55 ATK. Tangled since 2014, deadly when whipped.', 'wep.cabo_hdmi.hint': 'A cable relic forged in the East Wing.',
  'wep.aspirador_entupido.name': 'Clogged Handheld Vacuum', 'wep.aspirador_entupido.passive': 'Drains 10% dmg as HP', 'wep.aspirador_entupido.desc': '+110 ATK. Louder than it sucks, yet commands respect.', 'wep.aspirador_entupido.hint': 'The pinnacle of the East Wing forge.',
  'wep.vassoura_eletrica.name': 'Cordless Electric Broom', 'wep.vassoura_eletrica.passive': '30% Static Bolt (+80% dmg)', 'wep.vassoura_eletrica.desc': '+220 ATK. Battery lasts 4 minutes, zaps everything.', 'wep.vassoura_eletrica.hint': 'Found beyond the Main Gate among old promises.',
  'wep.ponteiro_12h.name': '12 O\'Clock Hand', 'wep.ponteiro_12h.passive': '35% High Noon (2x dmg + 5% HP drain)', 'wep.ponteiro_12h.desc': '+360 ATK. The golden blade that restarts the clock.', 'wep.ponteiro_12h.hint': 'Forged inside the Stopped Clock Tower.',

  // Armors
  'arm.roupa_mofada.name': 'Moldy Clothes', 'arm.roupa_mofada.desc': 'Smells like a closed closet.', 'arm.roupa_mofada.hint': 'You woke up wearing this.',
  'arm.casaco_pano_mofado.name': 'Moldy Cloth Coat', 'arm.casaco_pano_mofado.desc': '+30 max HP. Warm and questionable.', 'arm.casaco_pano_mofado.hint': 'Stitched from fine threads to the west.',
  'arm.mascara_antipoeira.name': 'Anti-Dust Mask', 'arm.mascara_antipoeira.desc': '+60 max HP. Breathe in style.', 'arm.mascara_antipoeira.hint': 'Found in the West Wing atelier.',
  'arm.capa_teia.name': 'Reinforced Web Cloak', 'arm.capa_teia.desc': '260 max HP. Light as silk, sticky as guilt.', 'arm.capa_teia.hint': 'Advanced arachnid haute couture.',
  'arm.armadura_papelao.name': '1994 Cardboard Armor', 'arm.armadura_papelao.desc': '400 max HP. CRT TV box reinforced with duct tape.', 'arm.armadura_papelao.hint': 'Ultimate defense of the West Wing.',
  'arm.cobertor_pesado.name': 'Heavy Microfiber Blanket', 'arm.cobertor_pesado.desc': '650 max HP. Impossible to leave on a Sunday.', 'arm.cobertor_pesado.hint': 'Found beyond the Main Gate.',
  'arm.manto_tempo.name': 'Cloak of Stopped Time', 'arm.manto_tempo.desc': '950 max HP. Woven from forgotten minutes.', 'arm.manto_tempo.hint': 'Found inside the Stopped Clock Tower.',

  // Bags
  'bag.bolso_furado.name': 'Torn Pocket', 'bag.bolso_furado.desc': 'Holds little, leaks half.', 'bag.bolso_furado.hint': 'Standard issue.',
  'bag.saco_teia.name': 'Web Sack', 'bag.saco_teia.desc': 'Base 5,000 (+ min 2h of D/s). Spider silk weave.', 'bag.saco_teia.hint': 'Woven in the West Wing.',
  'bag.saco_compactado.name': 'Compacted Sack', 'bag.saco_compactado.desc': 'Base 25,000 (+ min 2h of D/s). Vacuum-pressed dust.', 'bag.saco_compactado.hint': 'Textile upgrade in the West Wing.',
  'bag.mala_sotao.name': 'Attic Suitcase', 'bag.mala_sotao.desc': 'Base 150k (+ min 2h of D/s). Full of memories.', 'bag.mala_sotao.hint': 'Heavy luggage from the West Wing.',
  'bag.bau_sem_fundo.name': 'Bottomless Chest', 'bag.bau_sem_fundo.desc': 'Base 1M (+ min 2h of D/s). Holds a century of idleness.', 'bag.bau_sem_fundo.hint': 'The largest container in the atelier.',

  // Tools
  'tool.pa_lixo.name': 'Dustpan', 'tool.pa_lixo.effect': '+20% dust from combat', 'tool.pa_lixo.desc': 'Scoops up every crumb dropped by monsters.', 'tool.pa_lixo.hint': 'For sale in the heart of the castle.',
  'tool.luva_borracha.name': 'Yellow Rubber Glove', 'tool.luva_borracha.effect': '-15% damage taken', 'tool.luva_borracha.desc': 'Household armor against existential threats.', 'tool.luva_borracha.hint': 'Accessory in the West Wing atelier.',
  'tool.flanela_microfibra.name': 'Microfiber Cloth', 'tool.flanela_microfibra.effect': '2x HP regen out of combat', 'tool.flanela_microfibra.desc': 'Gentle care between expeditions.', 'tool.flanela_microfibra.hint': 'Kept in the East Wing workshop.',
  'tool.fita_isolante.name': 'Electrical Tape', 'tool.fita_isolante.effect': 'Survive 1 fatal blow at 1 HP per run', 'tool.fita_isolante.desc': 'Fixes literally anything in the universe.', 'tool.fita_isolante.hint': 'Found among cushions beyond the Gate.',
  'tool.ima_geladeira.name': 'Fridge Magnet', 'tool.ima_geladeira.effect': '+25% dust & extra Sock chance in combat', 'tool.ima_geladeira.desc': 'From a pizzeria that closed in 2013, still attracts everything.', 'tool.ima_geladeira.hint': 'Forgotten in the Attic of Promises.',

  // Potions
  'pot.cha_poeira.name': 'Dust Tea', 'pot.cha_poeira.effect': 'Heals 50% HP in combat', 'pot.cha_poeira.desc': 'Warm, gray, and surprisingly soothing.',
  'pot.tonico_cafeina.name': 'Moldy Caffeine Tonic', 'pot.tonico_cafeina.effect': '+50% ATK for 15s', 'pot.tonico_cafeina.desc': 'Distilled in the Cellar. Makes your @ vibrate.',
  'pot.cafe_meia.name': 'Sock-Filtered Coffee', 'pot.cafe_meia.effect': 'Heals 100% HP + resets Q/W/E cooldowns', 'pot.cafe_meia.desc': 'Strong enough to wake even the frozen clock.',

  // Skills
  'sk.sweep.name': 'Heavy Sweep', 'sk.sweep.desc': 'Heavy strike dealing 2.2x ATK.', 'sk.sweep.hint': 'Unlocked with your first weapon.',
  'sk.cloud.name': 'Dust Cloud', 'sk.cloud.desc': 'Blinds enemy (-50% dmg for 3 turns).', 'sk.cloud.hint': 'Unlocked with ancestral feathers.',
  'sk.sneeze.name': 'Sonic Sneeze', 'sk.sneeze.desc': 'Knocks enemy back, deals 1.2x ATK & stuns.', 'sk.sneeze.hint': 'Unlocked with the classic janitor weapon.',

  // Items
  'itm.mapa_castelo.name': 'Castle Map',
  'itm.lanterna.name': 'Flashlight (leaking batteries)',
  'itm.pedra_peso.name': 'Heavy Stone',
  'itm.compendio.name': 'Dust Compendium',
  'itm.grande_chave.name': 'Great Gate Key',

  // Secrets
  'sec.cursor_inquieto.name': 'Restless Cursor', 'sec.cursor_inquieto.bonusText': '+20% D/s', 'sec.cursor_inquieto.desc': 'You poked the blinking title cursor until dust fell out.', 'sec.cursor_inquieto.hint': 'Something is blinking at the very top of the page...',
  'sec.estatua_viva.name': 'Living Statue', 'sec.estatua_viva.bonusText': '+25% D/s', 'sec.estatua_viva.desc': 'Did not click anything for 60 seconds. Peak idleness.', 'sec.estatua_viva.hint': 'Sometimes doing absolutely nothing is the answer.',
  'sec.caramelo.name': 'Caramel Stray Dog', 'sec.caramelo.bonusText': '+25% D/s', 'sec.caramelo.desc': 'A Brazilian caramel dog wandered in after so many cats.', 'sec.caramelo.hint': 'Too many cats attract unexpected visitors in the Room...',
  'sec.pano_vo.name': 'Grandma\'s Dish Towel', 'sec.pano_vo.bonusText': '+20% bag capacity', 'sec.pano_vo.desc': 'Sacred stitching discovered in the Spider\'s words.', 'sec.pano_vo.hint': 'Read carefully what the tailor says...',
  'sec.chinelo_havaiana.name': 'Flip-Flop Strike', 'sec.chinelo_havaiana.bonusText': '+25% dmg vs insects', 'sec.chinelo_havaiana.desc': 'Legendary anti-roach weapon awakened in combat.', 'sec.chinelo_havaiana.hint': 'Some bugs in the Corridors deserve a few extra clicks.',
  'sec.cafe_ontem.name': 'Yesterday\'s Coffee', 'sec.cafe_ontem.bonusText': '+15% attack speed', 'sec.cafe_ontem.desc': 'Bitter, cold, and effective. Termite approved.', 'sec.cafe_ontem.hint': 'With light in hand, get closer to the woodworker.',
  'sec.grao_dourado.name': 'Shimmer Watcher', 'sec.grao_dourado.bonusText': '+20% D/s', 'sec.grao_dourado.desc': 'Caught a glowing dust mote floating across the screen.', 'sec.grao_dourado.hint': 'Keep your eyes open: something sparkles occasionally.',
  'sec.tapa_controle.name': 'Remote Slap', 'sec.tapa_controle.bonusText': '+25% D/s', 'sec.tapa_controle.desc': 'Slapped the side of the Remote and it worked. Classic engineering.', 'sec.tapa_controle.hint': 'What does everyone do when remote batteries die?',
  'sec.acorde_desafinado.name': 'Out-of-Tune Chord', 'sec.acorde_desafinado.bonusText': '+25% ATK', 'sec.acorde_desafinado.desc': 'Played the first 3 seconds of a rock epic and stopped.', 'sec.acorde_desafinado.hint': 'Someone in the Attic misses having their strings strummed...',
  'sec.maldicao_do_3.name': 'Curse of the 3', 'sec.maldicao_do_3.bonusText': '+20% D/s', 'sec.maldicao_do_3.desc': 'Kept clicking the Candy Box hoping for a #3 — alongside Half-Life and Portal.', 'sec.maldicao_do_3.hint': 'Some famous boxes never got a third installment...',
  'sec.determinacao.name': 'Dusty Determination', 'sec.determinacao.bonusText': '+35% D/s & +30% ATK', 'sec.determinacao.desc': 'Despite everything, it is still you... in New Game+. The Rat remembers.', 'sec.determinacao.hint': 'Only those who spun the clock and returned know this déjà vu.',

  // Achievements
  'ach.chave.name': 'Keysmith of Hygiene', 'ach.chave.desc': 'Fused the Great Gate Key.',
  'ach.fuga.name': 'Fresh Air (Allegedly)', 'ach.fuga.desc': 'Opened the Main Gate.',
  'ach.eletricista.name': 'Ruin Electrician', 'ach.eletricista.desc': 'Lit up the Dark Chamber.',
  'ach.cofre.name': 'Safecracker', 'ach.cofre.desc': 'Cracked the Old Safe combination.',
  'ach.dieta.name': 'Empty Candy Box', 'ach.dieta.desc': 'Searched the easter egg and found 1 Magic Dust.',
  'ach.vento.name': 'Gone With the Wind', 'ach.vento.desc': 'Entered the Wind Tunnel without the Heavy Stone.',
  'ach.mofo.name': 'Royal Mold Slayer', 'ach.mofo.desc': 'Defeated KING MOLD.',
  'ach.baratao.name': 'Kitchen Panic', 'ach.baratao.desc': 'Defeated the ARMORED ROACH.',
  'ach.ancestral.name': 'Lord of Allergies', 'ach.ancestral.desc': 'Defeated the ANCESTRAL MITE LORD.',
  'ach.rei_meias.name': 'Match Finally Found', 'ach.rei_meias.desc': 'Defeated the KING OF LONELY SOCKS.',
  'ach.roteador.name': 'Unplugged & Plugged Back In', 'ach.roteador.desc': 'Defeated the NO-SIGNAL ROUTER.',
  'ach.exterminador.name': 'Grime Exterminator', 'ach.exterminador.desc': '10 kills in expeditions.',
  'ach.bibliotecario.name': 'Dust Reader', 'ach.bibliotecario.desc': 'Found the Compendium on the Old Bookshelf.',
  'ach.tagarela.name': 'Castle Chatterbox', 'ach.tagarela.desc': 'Talked to all 5 Castle inhabitants.',
  'ach.desvao.name': 'Beyond the Gate', 'ach.desvao.desc': 'Entered the Backspace of the World.',
  'ach.cabos.name': 'Master Untangler', 'ach.cabos.desc': 'Sorted the Tangled Cable Drawer.',
  'ach.radio.name': 'Memory Tuner', 'ach.radio.desc': 'Caught the secret broadcast on the Old Radio.',
  'ach.labirinto.name': 'Dark Cartographer', 'ach.labirinto.desc': 'Found the treasure in the Lost Sock Maze.',
  'ach.promessa.name': 'Monday Arrived', 'ach.promessa.desc': 'Defeated the MONDAY PROMISE.',
  'ach.colecionador.name': 'Sock Collector', 'ach.colecionador.desc': 'Collected all 3 Under-the-Couch Relics.',
  'ach.senhor_tempo.name': 'The Clock Ticks Again', 'ach.senhor_tempo.desc': 'Defeated THE GREAT DELAY atop the Tower.',
  'ach.final_aspirador.name': 'Cosmic Cleanup', 'ach.final_aspirador.desc': 'Turned on the Great Vacuum and returned home.',
  'ach.final_trono.name': 'Monarch of Idleness', 'ach.final_trono.desc': 'Claimed the Throne of Dust and preserved Dust Box.',

  // Zones
  'zone.0.name': 'Stage 1: Dusty Corridors', 'zone.0.short': 'Stage 1', 'zone.0.desc': 'The first corridors of the castle.',
  'zone.1.name': 'Stage 2: Forgotten Storage', 'zone.1.short': 'Stage 2', 'zone.1.desc': 'Where old boxes gain a will of their own.',
  'zone.2.name': 'Stage 3: Ancient Dust Attic', 'zone.2.short': 'Stage 3', 'zone.2.desc': 'Geological layers of postponed chores.',
  'zone.3.name': 'Stage 4: Cushion Abyss', 'zone.3.short': 'Cushions', 'zone.3.desc': 'The dark depths between couch cushions.',
  'zone.4.name': 'Stage 5: 2005 Electronics Graveyard', 'zone.4.short': 'Electronics', 'zone.4.desc': 'Tech relics that refuse to power on.',
  'zone.5.name': 'Stage 6: Attic of Promises', 'zone.5.short': 'Promises', 'zone.5.desc': 'January goals that became coat hangers.',
  'zone.6.name': 'Stage 7: Stopped Clock Tower', 'zone.6.short': 'Final Tower', 'zone.6.desc': 'The final climb to the clock frozen at 11:59.',

  // Monsters
  'mon.acaro.name': 'Wise Mite', 'mon.acaro.desc': 'Tiny, nearsighted, and full of certainty.',
  'mon.bola.name': 'Rolling Dust Bunny', 'mon.bola.desc': 'Rolling through corners since last month.',
  'mon.barata.name': 'Dizzy Roach', 'mon.barata.desc': 'Has no idea where it is going, yet goes fast.',
  'mon.traca_selv.name': 'Wild Moth', 'mon.traca_selv.desc': 'Distant cousin of the merchant. Less polite.',
  'mon.rei_mofo.name': 'KING MOLD', 'mon.rei_mofo.desc': 'Damp sovereign of the corridors. Releases royal spores.',
  'mon.traca_bib.name': 'Library Moth', 'mon.traca_bib.desc': 'Ate three encyclopedias and now corrects your grammar.',
  'mon.meia_raivosa.name': 'Angry Lonely Sock', 'mon.meia_raivosa.desc': 'Lost its match in the laundry and blames you.',
  'mon.ratoeira.name': 'Rusty Mousetrap', 'mon.ratoeira.desc': 'Creaks before snapping. The Rat avoids this wing.',
  'mon.baratao.name': 'ARMORED ROACH', 'mon.baratao.desc': 'Heavy shell, part-time flyer, immune to fear.',
  'mon.cabo_vivo.name': 'Living Tangled Cable', 'mon.cabo_vivo.desc': 'A knot of chargers nobody dares to untangle.',
  'mon.esporo_fant.name': 'Ghost Spore', 'mon.esporo_fant.desc': 'Floats silently waiting for someone to inhale.',
  'mon.aspirador_pos.name': 'Possessed Vacuum', 'mon.aspirador_pos.desc': 'Broke in 2008 and returned for vengeance.',
  'mon.lorde_acaro.name': 'ANCESTRAL MITE LORD', 'mon.lorde_acaro.desc': 'The invisible patriarch of every forgotten mattress.',
  'mon.moeda_ox.name': 'Oxidized Penny', 'mon.moeda_ox.desc': 'Nobody accepts it as change, yet it bites.',
  'mon.migalha.name': 'Petrified Crumb', 'mon.migalha.desc': 'Hard as concrete since the 2014 World Cup.',
  'mon.mola_solta.name': 'Treacherous Spring', 'mon.mola_solta.desc': 'Springs up right when you try to relax.',
  'mon.rei_meias.name': 'KING OF LONELY SOCKS', 'mon.rei_meias.desc': 'Stitched from 14 orphan socks of different washes.',
  'mon.cd_riscado.name': 'Scratched CD', 'mon.cd_riscado.desc': 'Held 180 MP3s from 2005. Skips on track 3.',
  'mon.mouse_bola.name': 'Furious Ball Mouse', 'mon.mouse_bola.desc': 'Its trackball jammed with grime and it blames you.',
  'mon.impressora.name': 'Out-of-Cyan Printer', 'mon.impressora.desc': 'Refuses to print black text because yellow is low.',
  'mon.roteador.name': 'NO-SIGNAL ROUTER', 'mon.roteador.desc': 'Red light blinking forever. Rebooting only angers it.',
  'mon.halter_2kg.name': 'Rusty 2kg Dumbbell', 'mon.halter_2kg.desc': 'Bought with hype, used as a doorstop.',
  'mon.livro_auto.name': 'Sealed Self-Help Book', 'mon.livro_auto.desc': '"Wake Up at 5 AM" — still in shrink wrap.',
  'mon.bike_cabide.name': 'Coat-Rack Exercise Bike', 'mon.bike_cabide.desc': 'Balances 4 jackets and 2 backpacks heroically.',
  'mon.promessa_seg.name': 'MONDAY PROMISE', 'mon.promessa_seg.desc': 'The supreme entity of everything postponed to Monday.',
  'mon.pendulo.name': 'Rusty Pendulum', 'mon.pendulo.desc': 'Swinging for decades guarding the tower stairs.',
  'mon.relogio_1159.name': 'STOPPED CLOCK — 11:59', 'mon.relogio_1159.desc': 'Form I of the Time Guardian. Refuses to strike noon.',
  'mon.grande_adiamento.name': 'THE GREAT DELAY — 12:00', 'mon.grande_adiamento.desc': 'Final Form. The sum of all the world put off.'
});
})(window);
