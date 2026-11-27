/* DUST BOX — Catálogo en Español (objetos, equipo, habilidades, secretos, logros, zonas, monstruos) */
(function(global){
"use strict";

global.DustI18n.register('es', {
  // Aceleradores
  'acc.window.name': 'Ventana Entreabierta', 'acc.window.desc': 'Deja entrar la brisa de la calle cargada de polvo.',
  'acc.cat.name': 'Gato Perezoso', 'acc.cat.desc': 'No limpia nada y suelta pelo dos veces al día.',
  'acc.carpet.name': 'Alfombra de 1980', 'acc.carpet.desc': 'Retiene suciedad de cuatro décadas distintas.',
  'acc.fan.name': 'Ventilador Chueco', 'acc.fan.desc': 'Gira lento y esparce el polvo por todas partes.',
  'acc.pillow.name': 'Cojín Olvidado', 'acc.pillow.desc': 'Guarda migajas de 2019 y monedas oxidadas.',
  'acc.box16.name': 'Caja de Mudanza 2016', 'acc.box16.desc': 'Nunca se abrió desde la última mudanza.',
  'acc.dvds.name': 'Estante de DVDs Piratas', 'acc.dvds.desc': 'Compilados 3 en 1 cubiertos de nostalgia gris.',

  // Reliquias
  'rel.meia_sorte.name': 'Media de la Suerte', 'rel.meia_sorte.effect': '+45% P/s global', 'rel.meia_sorte.desc': 'Nunca halló su par, pero trae fortuna polvorienta.',
  'rel.controle_univ.name': 'Control Universal', 'rel.controle_univ.effect': '+35% ATK global', 'rel.controle_univ.desc': 'No enciende la TV, pero sube tu moral en combate.',
  'rel.moeda_1998.name': 'Moneda de 1998', 'rel.moeda_1998.effect': '+75% P/s global', 'rel.moeda_1998.desc': 'Hallada en lo más profundo del sofá.',

  // Armas
  'wep.vassoura_quebrada.name': 'Escoba Rota', 'wep.vassoura_quebrada.passive': 'Ninguna', 'wep.vassoura_quebrada.desc': '+2 ATK. Rompe más de lo que barre.', 'wep.vassoura_quebrada.hint': 'Vendida donde alguien come polvo en el centro.',
  'wep.espanador_pena.name': 'Plumero de Plumas', 'wep.espanador_pena.passive': '15% Crítico (1.5x daño)', 'wep.espanador_pena.desc': '+8 ATK. Pluma de paloma ancestral.', 'wep.espanador_pena.hint': 'Forjado donde cruje la madera al este.',
  'wep.rodo_combate.name': 'Haragán de Combate', 'wep.rodo_combate.passive': '20% Empujón (anula contraataque)', 'wep.rodo_combate.desc': '+25 ATK. El arma clásica del conserje.', 'wep.rodo_combate.hint': 'Forjado en el Ala Este tras el Plumero.',
  'wep.cabo_hdmi.name': 'Cable HDMI de 5 Metros', 'wep.cabo_hdmi.passive': '25% Látigo Doble (+50% daño)', 'wep.cabo_hdmi.desc': '+55 ATK. Enredado desde 2014, letal al desenrollar.', 'wep.cabo_hdmi.hint': 'Reliquia de cables forjada en el Ala Este.',
  'wep.aspirador_entupido.name': 'Aspiradora Portátil Tapada', 'wep.aspirador_entupido.passive': 'Drena 10% del daño como HP', 'wep.aspirador_entupido.desc': '+110 ATK. Hace más ruido que succión, pero impone respeto.', 'wep.aspirador_entupido.hint': 'La cima de la forja del Ala Este.',
  'wep.vassoura_eletrica.name': 'Escoba Eléctrica Sin Cable', 'wep.vassoura_eletrica.passive': '30% Rayo Estático (+80% daño)', 'wep.vassoura_eletrica.desc': '+220 ATK. Batería de 4 minutos, electriza todo.', 'wep.vassoura_eletrica.hint': 'Hallada más allá del Portón entre promesas viejas.',
  'wep.ponteiro_12h.name': 'Aguja de las 12h', 'wep.ponteiro_12h.passive': '35% Mediodía (2x daño + 5% HP)', 'wep.ponteiro_12h.desc': '+360 ATK. La hoja dorada que reinicia el reloj.', 'wep.ponteiro_12h.hint': 'Forjada dentro de la Torre del Reloj Detenido.',

  // Armaduras
  'arm.roupa_mofada.name': 'Ropa Mohosa', 'arm.roupa_mofada.desc': 'Huele a armario cerrado.', 'arm.roupa_mofada.hint': 'Despertaste con esto puesto.',
  'arm.casaco_pano_mofado.name': 'Abrigo de Tela Mohosa', 'arm.casaco_pano_mofado.desc': '+30 HP máx. Calentito y cuestionable.', 'arm.casaco_pano_mofado.hint': 'Cosido con hilos finos al oeste.',
  'arm.mascara_antipoeira.name': 'Máscara Antipolvo', 'arm.mascara_antipoeira.desc': '+60 HP máx. Respira con estilo.', 'arm.mascara_antipoeira.hint': 'Hallada en el taller del Ala Oeste.',
  'arm.capa_teia.name': 'Capa de Telaraña Reforzada', 'arm.capa_teia.desc': '260 HP máx. Ligera como seda, pegajosa como culpa.', 'arm.capa_teia.hint': 'Alta costura arácnida avanzada.',
  'arm.armadura_papelao.name': 'Armadura de Cartón 1994', 'arm.armadura_papelao.desc': '400 HP máx. Caja de TV de tubo con cinta adhesiva.', 'arm.armadura_papelao.hint': 'Defensa definitiva del Ala Oeste.',
  'arm.cobertor_pesado.name': 'Cobija Pesada de Microfibra', 'arm.cobertor_pesado.desc': '650 HP máx. Imposible salir de ella un domingo.', 'arm.cobertor_pesado.hint': 'Hallada más allá del Portón Principal.',
  'arm.manto_tempo.name': 'Manto del Tiempo Detenido', 'arm.manto_tempo.desc': '950 HP máx. Tejido con minutos olvidados.', 'arm.manto_tempo.hint': 'Hallado dentro de la Torre del Reloj Detenido.',

  // Bolsas
  'bag.bolso_furado.name': 'Bolsillo Roto', 'bag.bolso_furado.desc': 'Cabe poco y se cae la mitad.', 'bag.bolso_furado.hint': 'Viene de fábrica.',
  'bag.saco_teia.name': 'Saco de Telaraña', 'bag.saco_teia.desc': 'Base 5.000 (+ mín 2h de P/s). Tejido arácnido.', 'bag.saco_teia.hint': 'Tejido en el Ala Oeste.',
  'bag.saco_compactado.name': 'Saco Compactado', 'bag.saco_compactado.desc': 'Base 25.000 (+ mín 2h de P/s). Polvo prensado.', 'bag.saco_compactado.hint': 'Mejora textil en el Ala Oeste.',
  'bag.mala_sotao.name': 'Maleta de Ático', 'bag.mala_sotao.desc': 'Base 150k (+ mín 2h de P/s). Llena de recuerdos.', 'bag.mala_sotao.hint': 'Equipaje pesado del Ala Oeste.',
  'bag.bau_sem_fundo.name': 'Baúl Sin Fondo', 'bag.bau_sem_fundo.desc': 'Base 1M (+ mín 2h de P/s). Cabe un siglo de ocio.', 'bag.bau_sem_fundo.hint': 'El mayor recipiente del taller.',

  // Herramientas
  'tool.pa_lixo.name': 'Recogedor', 'tool.pa_lixo.effect': '+20% polvo en combates', 'tool.pa_lixo.desc': 'Recoge cada migaja dejada por los monstruos.', 'tool.pa_lixo.hint': 'En venta en el corazón del castillo.',
  'tool.luva_borracha.name': 'Guante de Goma Amarillo', 'tool.luva_borracha.effect': '-15% daño recibido', 'tool.luva_borracha.desc': 'Protección doméstica contra amenazas existenciales.', 'tool.luva_borracha.hint': 'Accesorio en el taller al oeste.',
  'tool.flanela_microfibra.name': 'Paño de Microfibra', 'tool.flanela_microfibra.effect': 'Regen HP 2x fuera de lucha', 'tool.flanela_microfibra.desc': 'Un cuidado entre expediciones.', 'tool.flanela_microfibra.hint': 'Guardado en el taller al este.',
  'tool.fita_isolante.name': 'Cinta Aislante', 'tool.fita_isolante.effect': 'Sobrevive 1 golpe fatal con 1 HP por fase', 'tool.fita_isolante.desc': 'Repara literalmente cualquier cosa del universo.', 'tool.fita_isolante.hint': 'Hallada entre cojines más allá del Portón.',
  'tool.ima_geladeira.name': 'Imán de Nevera', 'tool.ima_geladeira.effect': '+25% polvo y probabilidad extra de Medias', 'tool.ima_geladeira.desc': 'De una pizzería cerrada en 2013, aún atrae todo.', 'tool.ima_geladeira.hint': 'Olvidado en el Ático de las Promesas.',

  // Pociones
  'pot.cha_poeira.name': 'Té de Polvo', 'pot.cha_poeira.effect': 'Cura 50% HP en combate', 'pot.cha_poeira.desc': 'Caliente, gris y sorprendentemente reconfortante.',
  'pot.tonico_cafeina.name': 'Tónico de Cafeína Mohosa', 'pot.tonico_cafeina.effect': '+50% ATK por 15s', 'pot.tonico_cafeina.desc': 'Destilado en el Sótano. Hace vibrar a tu @.',
  'pot.cafe_meia.name': 'Café Colado en Media', 'pot.cafe_meia.effect': 'Cura 100% HP + reinicia cooldowns Q/W/E', 'pot.cafe_meia.desc': 'Fuerte como para despertar al reloj detenido.',

  // Habilidades
  'sk.sweep.name': 'Barrido Fuerte', 'sk.sweep.desc': 'Golpe pesado de 2.2x ATK.', 'sk.sweep.hint': 'Desbloqueada con tu primera arma.',
  'sk.cloud.name': 'Nube de Polvo', 'sk.cloud.desc': 'Ciega al enemigo (-50% daño por 3 turnos).', 'sk.cloud.hint': 'Desbloqueada con plumas ancestrales.',
  'sk.sneeze.name': 'Estornudo Sónico', 'sk.sneeze.desc': 'Empuja al enemigo, causa 1.2x ATK y aturde.', 'sk.sneeze.hint': 'Desbloqueada con el arma clásica del conserje.',

  // Objetos
  'itm.mapa_castelo.name': 'Mapa del Castillo',
  'itm.lanterna.name': 'Linterna (pilas gastadas)',
  'itm.pedra_peso.name': 'Piedra de Peso',
  'itm.compendio.name': 'Compendio del Polvo',
  'itm.grande_chave.name': 'Gran Llave del Portón',

  // Secretos
  'sec.cursor_inquieto.name': 'Cursor Inquieto', 'sec.cursor_inquieto.bonusText': '+20% P/s', 'sec.cursor_inquieto.desc': 'Picaste el cursor del título hasta que soltó polvo.', 'sec.cursor_inquieto.hint': 'Hay algo parpadeando allá arriba en la página...',
  'sec.estatua_viva.name': 'Estatua Viva', 'sec.estatua_viva.bonusText': '+25% P/s', 'sec.estatua_viva.desc': '60 segundos sin hacer clic en nada. Arte supremo del ocio.', 'sec.estatua_viva.hint': 'A veces no hacer absolutamente nada es la respuesta.',
  'sec.caramelo.name': 'Perro Callejero Caramelo', 'sec.caramelo.bonusText': '+25% P/s', 'sec.caramelo.desc': 'Un perro caramelo entró tras tantos gatos y se echó al sol.', 'sec.caramelo.hint': 'Demasiados gatos atraen visitas inesperadas en el Cuarto...',
  'sec.pano_vo.name': 'Trapo de Cocina de la Abuela', 'sec.pano_vo.bonusText': '+20% capacidad de bolsa', 'sec.pano_vo.desc': 'Costura sagrada descubierta en las palabras de la Araña.', 'sec.pano_vo.hint': 'Lee con atención lo que dice la sastra...',
  'sec.chinelo_havaiana.name': 'La Chancla', 'sec.chinelo_havaiana.bonusText': '+25% daño a insectos', 'sec.chinelo_havaiana.desc': 'Arma legendaria despertada contra cucarachas.', 'sec.chinelo_havaiana.hint': 'Algunos insectos en los Corredores merecen clics extra.',
  'sec.cafe_ontem.name': 'Café de Ayer', 'sec.cafe_ontem.bonusText': '+15% velocidad de ataque', 'sec.cafe_ontem.desc': 'Amargo, frío y efectivo. Aprobado por la Termita.', 'sec.cafe_ontem.hint': 'Con luz en mano, acércate a quien trabaja la madera.',
  'sec.grao_dourado.name': 'Observador del Brillo', 'sec.grao_dourado.bonusText': '+20% P/s', 'sec.grao_dourado.desc': 'Atrapaste una mota brillante flotando en pantalla.', 'sec.grao_dourado.hint': 'Mantén los ojos abiertos: algo brilla de vez en cuando.',
  'sec.tapa_controle.name': 'Golpe al Control', 'sec.tapa_controle.bonusText': '+25% P/s', 'sec.tapa_controle.desc': 'Golpeaste el Control de lado y funcionó. Ingeniería clásica.', 'sec.tapa_controle.hint': '¿Qué hace todo el mundo cuando falla la pila del control?',
  'sec.acorde_desafinado.name': 'Acorde Desafinado', 'sec.acorde_desafinado.bonusText': '+25% ATK', 'sec.acorde_desafinado.desc': 'Tocaste 3 segundos de un clásico del rock y paraste.', 'sec.acorde_desafinado.hint': 'Alguien en el Ático extraña que toquen sus cuerdas...',
  'sec.maldicao_do_3.name': 'La Maldición del 3', 'sec.maldicao_do_3.bonusText': '+20% P/s', 'sec.maldicao_do_3.desc': 'Insististe en la Caja de Dulces esperando un 3 — junto a Half-Life y Portal.', 'sec.maldicao_do_3.hint': 'Algunas cajas famosas jamás tuvieron tercera parte...',
  'sec.determinacao.name': 'Determinación Polvorienta', 'sec.determinacao.bonusText': '+35% P/s y +30% ATK', 'sec.determinacao.desc': 'A pesar de todo, sigues siendo tú... en Nuevo Juego+. El Ratón recuerda.', 'sec.determinacao.hint': 'Solo quien giró el reloj y volvió conoce este déjà vu.',

  // Logros
  'ach.chave.name': 'Cerrajero de la Higiene', 'ach.chave.desc': 'Fundiste la Gran Llave del Portón.',
  'ach.fuga.name': 'Aire Puro (Supuestamente)', 'ach.fuga.desc': 'Abriste el Portón Principal.',
  'ach.eletricista.name': 'Electricista de Ruinas', 'ach.eletricista.desc': 'Encendiste la Cámara Oscura.',
  'ach.cofre.name': 'Ladrón de Cajas Fuertes', 'ach.cofre.desc': 'Descifraste la Caja Fuerte Antigua.',
  'ach.dieta.name': 'Caja de Dulces Vacía', 'ach.dieta.desc': 'Revisaste el easter egg y hallaste 1 Polvo Mágico.',
  'ach.vento.name': 'Lo que el Viento se Llevó', 'ach.vento.desc': 'Entraste al Túnel del Viento sin la Piedra de Peso.',
  'ach.mofo.name': 'Asesino del Moho Real', 'ach.mofo.desc': 'Derrotaste al REY MOHO.',
  'ach.baratao.name': 'Pánico en la Cocina', 'ach.baratao.desc': 'Derrotaste a la CUCARACHA BLINDADA.',
  'ach.ancestral.name': 'Señor de la Alergia', 'ach.ancestral.desc': 'Derrotaste al SEÑOR ÁCARO ANCESTRAL.',
  'ach.rei_meias.name': 'Par Al Fin Encontrado', 'ach.rei_meias.desc': 'Derrotaste al REY DE LAS MEDIAS SIN PAR.',
  'ach.roteador.name': 'Desenchufar y Enchufar', 'ach.roteador.desc': 'Derrotaste al ROUTER SIN SEÑAL.',
  'ach.exterminador.name': 'Exterminador de Suciedad', 'ach.exterminador.desc': '10 bajas en expediciones.',
  'ach.bibliotecario.name': 'Lector de Polvo', 'ach.bibliotecario.desc': 'Encontraste el Compendio en el Estante Antiguo.',
  'ach.tagarela.name': 'Charlatán del Castillo', 'ach.tagarela.desc': 'Hablaste con los 5 habitantes del Castillo.',
  'ach.desvao.name': 'Más Allá del Portón', 'ach.desvao.desc': 'Entraste al Desván del Mundo.',
  'ach.cabos.name': 'Desenredador Profesional', 'ach.cabos.desc': 'Ordenaste el Cajón de Cables Enredados.',
  'ach.radio.name': 'Sintonizador de Memorias', 'ach.radio.desc': 'Captaste la transmisión secreta en la Radio Vieja.',
  'ach.labirinto.name': 'Cartógrafo de la Oscuridad', 'ach.labirinto.desc': 'Hallaste el tesoro del Laberinto de la Media Perdida.',
  'ach.promessa.name': 'Llegó el Lunes', 'ach.promessa.desc': 'Derrotaste a la PROMESA DEL LUNES.',
  'ach.colecionador.name': 'Coleccionista de Medias', 'ach.colecionador.desc': 'Obtuviste las 3 Reliquias del Fondo del Sofá.',
  'ach.senhor_tempo.name': 'El Reloj Volvió a Girar', 'ach.senhor_tempo.desc': 'Derrotaste AL GRAN APLAZAMIENTO en la Torre.',
  'ach.final_aspirador.name': 'Limpieza Cósmica', 'ach.final_aspirador.desc': 'Encendiste la Gran Aspiradora y volviste al mundo real.',
  'ach.final_trono.name': 'Monarca del Ocio', 'ach.final_trono.desc': 'Asumiste el Trono del Polvo y preservaste Dust Box.',

  // Zonas
  'zone.0.name': 'Fase 1: Corredores Polvorientos', 'zone.0.short': 'Fase 1', 'zone.0.desc': 'Los primeros pasillos del castillo.',
  'zone.1.name': 'Fase 2: Depósito de los Olvidados', 'zone.1.short': 'Fase 2', 'zone.1.desc': 'Donde cajas viejas cobran voluntad propia.',
  'zone.2.name': 'Fase 3: Ático del Polvo Antiguo', 'zone.2.short': 'Fase 3', 'zone.2.desc': 'Capas geológicas de tareas pospuestas.',
  'zone.3.name': 'Fase 4: Abismo de los Cojines', 'zone.3.short': 'Cojines', 'zone.3.desc': 'Las profundidades oscuras entre cojines.',
  'zone.4.name': 'Fase 5: Cementerio Electrónico 2005', 'zone.4.short': 'Electrónicos', 'zone.4.desc': 'Reliquias tecnológicas que se niegan a encender.',
  'zone.5.name': 'Fase 6: Ático de las Promesas', 'zone.5.short': 'Promesas', 'zone.5.desc': 'Metas de enero convertidas en perchero.',
  'zone.6.name': 'Fase 7: Torre del Reloj Detenido', 'zone.6.short': 'Torre Final', 'zone.6.desc': 'La subida final hacia el reloj trabado en 11:59.',

  // Monstruos
  'mon.acaro.name': 'Ácaro Sabio', 'mon.acaro.desc': 'Pequeño, miope y lleno de certezas.',
  'mon.bola.name': 'Bola de Polvo Rodante', 'mon.bola.desc': 'Rueda por las esquinas desde el mes pasado.',
  'mon.barata.name': 'Cucaracha Tonta', 'mon.barata.desc': 'No sabe a dónde va, pero va rápido.',
  'mon.traca_selv.name': 'Polilla Salvaje', 'mon.traca_selv.desc': 'Prima lejana de la mercader. Menos educada.',
  'mon.rei_mofo.name': 'REY MOHO', 'mon.rei_mofo.desc': 'Soberano húmedo de los corredores. Suelta esporas reales.',
  'mon.traca_bib.name': 'Polilla de Biblioteca', 'mon.traca_bib.desc': 'Devoró tres enciclopedias y corrige tu gramática.',
  'mon.meia_raivosa.name': 'Media Solitaria Furiosa', 'mon.meia_raivosa.desc': 'Perdió su par en la lavandería y te culpa.',
  'mon.ratoeira.name': 'Ratonera Oxidada', 'mon.ratoeira.desc': 'Chirría antes de morder. El Ratón evita este sector.',
  'mon.baratao.name': 'CUCARACHA BLINDADA', 'mon.baratao.desc': 'Caparazón duro, voladora a veces, inmune al miedo.',
  'mon.cabo_vivo.name': 'Cable Enredado Vivo', 'mon.cabo_vivo.desc': 'Un nudo de cargadores que nadie osa deshacer.',
  'mon.esporo_fant.name': 'Espora Fantasma', 'mon.esporo_fant.desc': 'Flota en silencio esperando que alguien respire hondo.',
  'mon.aspirador_pos.name': 'Aspiradora Poseída', 'mon.aspirador_pos.desc': 'Se rompió en 2008 y volvió por venganza.',
  'mon.lorde_acaro.name': 'SEÑOR ÁCARO ANCESTRAL', 'mon.lorde_acaro.desc': 'Patriarca invisible de todo colchón olvidado.',
  'mon.moeda_ox.name': 'Moneda Oxidada', 'mon.moeda_ox.desc': 'Nadie la acepta de cambio, pero muerde.',
  'mon.migalha.name': 'Migaja Petrificada', 'mon.migalha.desc': 'Dura como cemento desde el Mundial 2014.',
  'mon.mola_solta.name': 'Resorte Traicionero', 'mon.mola_solta.desc': 'Salta justo cuando intentas descansar.',
  'mon.rei_meias.name': 'REY DE LAS MEDIAS SIN PAR', 'mon.rei_meias.desc': 'Cosido con 14 medias huérfanas de distintos lavados.',
  'mon.cd_riscado.name': 'CD Rayado Cortante', 'mon.cd_riscado.desc': 'Tenía 180 MP3 de 2005. Se traba en la pista 3.',
  'mon.mouse_bola.name': 'Mouse de Bolita Furioso', 'mon.mouse_bola.desc': 'Su bolita se atascó de suciedad y te culpa.',
  'mon.impressora.name': 'Impresora Sin Cian', 'mon.impressora.desc': 'No imprime texto negro porque falta tinta amarilla.',
  'mon.roteador.name': 'ROUTER SIN SEÑAL', 'mon.roteador.desc': 'Luz roja parpadeando siempre. Reiniciarlo lo enfada más.',
  'mon.halter_2kg.name': 'Mancuerna Oxidada de 2kg', 'mon.halter_2kg.desc': 'Comprada con entusiasmo, usada para trabar la puerta.',
  'mon.livro_auto.name': 'Libro de Autoayuda Sellado', 'mon.livro_auto.desc': '"Despierta a las 5 AM" — aún en su plástico.',
  'mon.bike_cabide.name': 'Bici Estática Perchero', 'mon.bike_cabide.desc': 'Sostiene 4 abrigos y 2 mochilas con heroísmo.',
  'mon.promessa_seg.name': 'PROMESA DEL LUNES', 'mon.promessa_seg.desc': 'Entidad suprema de todo lo pospuesto para el lunes.',
  'mon.pendulo.name': 'Péndulo Oxidado', 'mon.pendulo.desc': 'Oscila desde hace décadas cuidando la escalera.',
  'mon.relogio_1159.name': 'RELOJ DETENIDO — 11:59', 'mon.relogio_1159.desc': 'Forma I del Guardián del Tiempo. Se niega a marcar las 12.',
  'mon.grande_adiamento.name': 'EL GRAN APLAZAMIENTO — 12:00', 'mon.grande_adiamento.desc': 'Forma Final. La suma de todo lo que el mundo pospuso.'
});
})(window);
