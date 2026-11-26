/* DUST BOX — Diálogos vivos e escolhas dos NPCs */
(function(global){
"use strict";

function getPool(npcId, S){
  if(npcId === 'rat'){
    const list = [
      {
        text: '"Você já percebeu que quanto mais a gente evita uma tarefa, mais ela ganha personalidade própria?"'
      },
      {
        id: 'rat_filosofia',
        text: '"Vou te contar um segredo: eu não sou formado em filosofia. Caí aqui junto com um livro do Nietzsche que ninguém passou do capítulo 2. E você, termina os livros que compra?"',
        choices: [
          {
            label: 'Claro que termino todos',
            reply: '"Aha! O cheiro de mentira fresca é mais forte que o mofo. Toma um pouco de poeira pela coragem."',
            rewardDust: 50
          },
          {
            label: 'Nem o prefácio, sendo sincero',
            reply: '"Honestidade rara neste castelo. Você tem futuro aqui no Dust Box — toma essa poeira de respeito."',
            rewardDust: 120
          }
        ]
      }
    ];
    if(S.unlocks.outOfRoom){
      list.push({
        id: 'rat_portao',
        text: '"Dizem que além do Portão Principal não existe só ar puro... existe o Desvão do Mundo: fundos de sofá, gavetas de cabos e uma torre onde o relógio parou."',
        choices: [
          {
            label: 'Um relógio parado?',
            reply: '"É. Quando as pessoas param de terminar o que começam, o tempo para lá em cima e vira poeira aqui embaixo."'
          },
          {
            label: 'Prefiro continuar no quarto',
            reply: '"Sábia escolha de quem já abraçou o sedentarismo cósmico."'
          }
        ]
      });
    }
    if(S.unlocks.hasCompendium){
      list.push({ text: '"Achou o Compêndio na estante? Aquele livro estava esperando alguém curioso desde 1998."' });
    }
    if(S.achievements.includes('mofo')){
      list.push({ text: '"Você derrubou o REI MOFO! O castelo inteiro espirrou em homenagem a você."' });
    }
    if((S.accelerators.cat || 0) >= 3 && !S.secrets.includes('caramelo')){
      list.push({ text: '"Com tantos gatos aqui, ouvi um latido lá fora... se me cutucar mais de perto eu te mostro."' });
    }
    return list;
  }

  if(npcId === 'moth'){
    const list = [
      {
        id: 'moth_gosto',
        text: '"Todo mundo pergunta por que eu como poeira. Tem gosto de domingo às 18h, boleto esquecido e café esfriando na mesa."',
        choices: [
          {
            label: 'Parece meio triste...',
            reply: '"Triste é pagar caro em boleto! Aqui pelo menos é crocante."'
          },
          {
            label: 'Me vê uma pitada aí',
            reply: '"Haha, gostei da ousadia! Toma um punhado por conta da casa."',
            rewardDust: 150
          }
        ]
      },
      {
        text: '"Ninguém construiu este castelo. Ele foi se montando sozinho com cada tarefa adiada para segunda-feira."'
      },
      {
        text: '"Já comi um trabalho salvo como trabalho_final_v3_AGORA_VAI.doc e um boleto de academia só visitada em janeiro. Uma iguaria."'
      }
    ];
    if(S.unlocks.hasMap){
      list.push({ text: '"Gostou do mapa? Desenhei de memória enquanto comia uma cortina antiga."' });
    }
    if(S.inventory.armor === 'mascara_antipoeira'){
      list.push({ text: '"Essa Máscara Anti-Poeira ficou chique em você. Quase não parece que acordou no chão."' });
    }
    if(S.achievements.includes('baratao')){
      list.push({ text: '"Você enfrentou o BARATÃO BLINDADO?! Eu teria voado pro teto na hora!"' });
    }
    return list;
  }

  if(npcId === 'termite'){
    const list = [
      {
        id: 'termite_moveis',
        text: '"Cada arma minha nasce de um móvel esquecido que caiu no Dust Box. Adivinha de onde veio a madeira mais resistente?"',
        choices: [
          {
            label: 'Guarda-roupa da casa da avó',
            reply: '"Acertou na mosca! Madeira maciça de 1972 não quebra nem com martelo. Toma uma sobra de poeira fina."',
            rewardDust: 250
          },
          {
            label: 'Cadeira de escritório rangente',
            reply: '"Essa aí só serve pra fazer barulho às 3 da manhã! Mas gostei do palpite — leva esse troco de serragem."',
            rewardDust: 150
          }
        ]
      },
      {
        text: '"Martelar poeira com serragem é arte. Se alguém chamar de gambiarra, eu chamo de design brasileiro."'
      }
    ];
    if(S.inventory.weapon === 'rodo_combate'){
      list.push({ text: '"O Rodo de Combate! Com esse peso, até o chão pensa duas vezes antes de sujar."' });
    }
    if(S.inventory.weapon === 'cabo_hdmi' || S.inventory.weapon === 'aspirador_entupido'){
      list.push({ text: '"Você está empunhando tecnologia ancestral de gaveta. O castelo inteiro está tremendo."' });
    }
    return list;
  }

  if(npcId === 'spider'){
    const list = [
      {
        id: 'spider_moda',
        text: '"Muita gente estranha minha coleção Outono/Inverno 1987. Mas diga com sinceridade: o que acha do meu estilo?"',
        choices: [
          {
            label: 'A moda sempre volta, tá incrível',
            reply: '"Finalmente alguém com bom gosto neste castelo! Toma uns fios de poeira nobre de brinde."',
            rewardDust: 300
          },
          {
            label: 'Meio mofado, mas quentinho',
            reply: '"Mofo é apenas o perfume natural do tempo! Você ainda vai me agradecer nos corredores."'
          }
        ]
      },
      {
        text: '"Oito patas e ainda assim falta braço quando alguém resolve encomendar saco gigante de última hora."'
      }
    ];
    if(S.inventory.bag === 'mala_sotao' || S.inventory.bag === 'bau_sem_fundo'){
      list.push({ text: '"Com esse recipiente enorme, você já pode sumir por 12 horas sem desperdiçar um único grão."' });
    }
    return list;
  }

  if(npcId === 'beetle'){
    const list = [
      {
        id: 'beetle_alquimia',
        text: '"Todo visitante faz a mesma cara quando vê 10.000 poeiras virarem 1 Poeira Mágica. Quer saber como funciona o processo?"',
        choices: [
          {
            label: 'Sim, me explique a alquimia',
            reply: '"Pressão, paciência... e um pouco de digestão estratégica. Toma 400 poeiras pela curiosidade científica."',
            rewardDust: 400
          },
          {
            label: 'Melhor não saber mesmo',
            reply: '"Decisão extremamente madura. Alguns mistérios brilham mais no escuro. Toma 400 poeiras pelo bom senso."',
            rewardDust: 400
          }
        ]
      },
      {
        text: '"Rolo bolas de poeira há séculos. Sísifo teria inveja da minha constância."'
      }
    ];
    if(S.key.fragments > 0 && !S.key.complete){
      list.push({ text: `"Já estamos com ${S.key.fragments}/3 fragmentos. Quando os três se juntarem, o Portão finalmente vai ceder."` });
    }
    if(S.key.complete){
      list.push({ text: '"A Grande Chave está pronta nas suas mãos. Quando abrir aquele Portão, não esqueça de quem rolou poeira com você."' });
    }
    return list;
  }

  if(npcId === 'remote'){
    return [
      {
        id: 'remote_pilha',
        text: '"Fui jogado aqui em 2017 porque minha tampa de pilha sumiu. Você já tentou bater na lateral de um controle pra ver se ele volta a funcionar?"',
        choices: [
          {
            label: 'Sempre funciona!',
            reply: '"Engenharia de impacto brasileira! Toma 1 Meia Solitária que achei aqui entre as almofadas."',
            rewardSocks: 1
          },
          {
            label: 'Eu troco a pilha direito',
            reply: '"Que mentira elegante. Mas respeito a postura — leva essa Meia Solitária mesmo assim."',
            rewardSocks: 1
          }
        ]
      },
      {
        text: '"Tudo que escorrega entre as almofadas do sofá termina aqui. Já vi 43 moedas, 12 tampas de caneta e uma fatia seca de pizza."'
      },
      {
        text: '"Outro dia caiu aqui um perfil inteiro do Orkut cheio de depoimentos \'não aceita\', um CD do Nero e uma conta do MSN com status Ocupado desde 2011."'
      }
    ];
  }

  if(npcId === 'guitar'){
    return [
      {
        id: 'guitar_corda',
        text: '"Me compraram em janeiro com a promessa de aprender Legião Urbana até o Carnaval. A corda Mi estourou no dia 4 e nunca mais me tocaram."',
        choices: [
          {
            label: 'Eu também tenho um violão assim',
            reply: '"Somos todos sobreviventes de janeiro! Toma 1 Meia Solitária pela solidariedade musical."',
            rewardSocks: 1
          },
          {
            label: 'Pelo menos você virou decoração',
            reply: '"Decoração empoeirada de alto valor emocional! Toma 1 Meia Solitária por me fazer rir."',
            rewardSocks: 1
          }
        ]
      },
      {
        text: '"Lá no fundo deste sótão vive a Promessa de Segunda-Feira. Se você derrotar ela nos Corredores, dizem que ela guarda uma engrenagem da Torre."'
      },
      {
        text: '"Na prateleira do fundo tem um pé-de-cabra enferrujado, uma arma de portais sem bateria e uma caixa de doces — todos esperando o número 3 que nunca chegou."'
      }
    ];
  }

  return [{ text: '"..."' }];
}

global.DustDialogues = { getPool };
})(window);
