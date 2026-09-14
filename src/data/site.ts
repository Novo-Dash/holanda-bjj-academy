/**
 * Dados do cliente. Tudo que ainda não veio dele fica marcado como pendência,
 * e a página imprime o marcador em vez de inventar o dado (modo prospect).
 * Trocar o valor e apagar a pendência é o único passo para publicar.
 *
 * Regra que vale para o arquivo inteiro: nome de pessoa, nota de avaliação,
 * texto de depoimento, preço e faixa de professor NÃO se preenchem com
 * placeholder plausível, porque plausível é exatamente o que ninguém confere
 * depois.
 *
 * A COPY segue o tom da página de referência que o Adryan mandou: frase curta,
 * concreta, escrita para quem nunca treinou, e sempre respondendo a pergunta
 * que a pessoa faria em voz alta. Nada de adjetivo sem função.
 */

export const site = {
  name: 'Holanda BJJ Academy',
  shortName: 'Holanda',
  established: '2026',

  city: 'Framingham',
  state: 'MA',
  stateLong: 'Massachusetts',

  /**
   * Rua e cidade vêm confirmadas do briefing.
   *
   * O CEP não vinha: o briefing diz 10702, que não é CEP de Massachusetts (é do
   * estado de Nova York). O Google geocodifica este endereço exato como
   * "47 Franklin St, Framingham, MA 01702", e é esse que a página imprime.
   *
   * CONFIRMADO: o perfil do Google da academia imprime
   * "47 Franklin St, Framingham, MA 01702, United States". O 10702 do briefing
   * era erro de digitação.
   */
  address: {
    line1: '47 Franklin Street',
    line2: 'Framingham, MA',
    zip: '01702' as string | null,
    zipPending: false,
  },

  phone: '(913) 963-3160',
  phoneHref: 'tel:+19139633160',

  /** [CONFIRMAR] e-mail de atendimento. Nulo enquanto não vem: link de
      contato quebrado no rodapé é o tipo de coisa que ninguém revisa depois. */
  email: null as string | null,

  /** [CONFIRMAR] o número tem WhatsApp? A referência oferece "fale no WhatsApp"
      ao lado do botão principal, e aqui isso só entra depois de alguém
      confirmar: botão que abre uma conversa que não existe é pior que botão
      nenhum. Preenchido (`https://wa.me/1...`), ele aparece sozinho no CTA
      final. */
  whatsapp: null as string | null,

  socials: {
    instagram: 'https://www.instagram.com/holanda.bjjacademy/',
    instagramHandle: '@holanda.bjjacademy',
    /** [CONFIRMAR] existe página no Facebook? */
    facebook: null as string | null,
  },

  /**
   * A FOTO DE FUNDO DA PRIMEIRA TELA. Entregue pelo cliente: a turma inteira
   * posada na sala, adultos e crianças de kimono.
   *
   * Ela fica atrás de um véu de tinta bem fechado, e isso é de propósito: a
   * foto não está ali para ser examinada, está para dizer "existe gente aqui, e
   * é gente de verdade" enquanto a headline continua legível. Foto de grupo
   * como imagem principal, sem véu, obrigaria o texto a fugir para um canto.
   *
   * [CONFIRMAR] há crianças identificáveis na foto. Rosto de menor em página
   * pública, e ainda por cima em anúncio pago, precisa de autorização dos
   * responsáveis — que é coisa diferente de ter sido postado no Instagram.
   */
  heroImage: {
    src: '/hero.webp',
    width: 1920,
    height: 917,
    alt: 'Alunos e professores da Holanda BJJ Academy reunidos na sala de treino, adultos e crianças de kimono',
  },

  /**
   * A foto atrás do painel da nota. Retrato vertical, luz vermelha, entregue
   * pelo cliente. Ela entra como TEXTURA e não como conteúdo — o painel continua
   * sendo o 5,0 e o número de avaliações —, então o alt fica vazio de propósito:
   * descrever "homem de kimono preto sob luz vermelha" para quem usa leitor de
   * tela não acrescenta nada à informação de que a academia tem nota 5,0.
   */
  ratingImage: {
    src: '/rating-bg.webp',
    width: 733,
    height: 1075,
  },

  /** [CONFIRMAR] a VSL vertical 9:16 do hero. Ainda vai ser gravada: roteiro no
      planejamento estratégico. O `poster` é o frame parado que aparece antes do
      play; sem ele o slot fica preto. */
  vsl: {
    src: null as string | null,
    poster: null as string | null,
  },

  /**
   * O vídeo vertical de dentro da academia, na seção da aula experimental.
   * ENTREGUE pelo cliente: 9:16, 30 segundos, aula de kids em andamento, a sala
   * cheia e os alunos com medalhas no fim.
   *
   * São dois arquivos diferentes e não um: o do hero é o professor falando com
   * a câmera (quem eu sou), este é a sala funcionando (como é lá dentro). O
   * mesmo vídeo nos dois lugares responderia uma pergunta duas vezes e a outra
   * nenhuma.
   *
   * Reencodado de 10,5 MB para 4,4 MB, com áudio (o `VideoSlot` mostra controles
   * e não toca sozinho: quem dá play quer ouvir). O pôster é o frame dos 8s, que
   * é onde a sala aparece cheia; o primeiro segundo é escuro e daria um pôster
   * preto. O original está em `raw/`, fora da pasta publicada.
   *
   * [CONFIRMAR] o vídeo mostra ROSTOS DE CRIANÇAS de perto. Uso em rede social
   * e uso no site são autorizações diferentes: confirmar com os responsáveis
   * antes de publicar.
   */
  insideVideo: {
    src: '/video/trial-class.mp4' as string | null,
    poster: '/video/trial-class-poster.webp' as string | null,
  },

  /**
   * Mapa, sem chave de API.
   *
   * NÃO é o `maps.google.com/maps?q=...&output=embed` que todo mundo copia: esse
   * endereço hoje devolve 301 com `X-Frame-Options: SAMEORIGIN`, e o navegador
   * recusa o iframe NO REDIRECIONAMENTO, antes de chegar ao destino. O sintoma é
   * uma faixa branca no lugar do mapa, sem erro visível na página.
   *
   * Este é o destino final desse redirecionamento (`/maps/embed?origin=mfe&pb=`),
   * que responde 200 e sem `X-Frame-Options`. O trecho `!1s<endereço>` é a
   * consulta; `!6i16` é o zoom.
   */
  mapsEmbedSrc:
    'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s47+Franklin+Street,+Framingham,+MA!6i16',
  mapsDirections:
    'https://www.google.com/maps/dir/?api=1&destination=47+Franklin+Street,+Framingham,+MA',

  /**
   * Nota do Google, CONFERIDA no perfil da academia: 5,0 com 35 avaliações.
   * O planejamento dizia 100, que estava errado, e é por isso que o número
   * esteve marcado como provisório até alguém abrir o perfil.
   *
   * `count` é o único campo aqui que envelhece sozinho: ele sobe a cada
   * avaliação nova. Vale reconferir de tempos em tempos, e é preferível ficar
   * DESATUALIZADO PARA BAIXO (dizer 35 quando já são 50) do que para cima.
   *
   * O JSON-LD continua SEM `aggregateRating`, e agora não é por falta de dado:
   * o Google não aceita marcação de avaliação que o próprio negócio faz sobre
   * si mesmo ("self-serving reviews") em LocalBusiness. Publicar não traria
   * estrela nenhuma na busca e é justamente o tipo de marcação que rende aviso.
   */
  rating: {
    score: '5.0',
    count: 35,
    provisional: false,
    /** [CONFIRMAR] link do perfil do Google, para o "read them on Google". */
    profileUrl: null as string | null,
  },
}

/* ── A oferta ────────────────────────────────────────────────────────────────
   Uma só, e é o eixo da campanha: a primeira aula é gratuita. Nada de preço na
   página enquanto a tabela não vier do cliente. */
export const offer = {
  label: 'Free trial class',
  /* Curta de propósito: ela é usada inteira em dois lugares (o pedido final e
     o painel do agendamento), e em ambos ela fecha um parágrafo. Cada palavra a
     mais aqui vira uma linha a mais lá. */
  note: 'No experience, no commitment, and no card asked for.',
}

/* ── Programas ───────────────────────────────────────────────────────────────
   Quatro, na ordem em que a campanha os vende: o iniciante é o público do
   anúncio, o kids é a segunda campanha, e o resto segura quem já treina.

   `audience` existe porque a referência separa os programas em duas abas ("para
   mim" e "para meu filho"). Aqui a ABA NÃO VEIO: lá são sete programas, três
   deles infantis; aqui são quatro, e a aba de kids ficaria com um cartão
   sozinho num vão de três colunas. O rótulo em cada cartão faz o mesmo trabalho
   de triagem sem quebrar a fileira. */
export type Program = {
  id: string
  name: string
  audience: 'adults' | 'kids'
  ages: string
  summary: string
  /** Três pontos por programa. NADA NA PÁGINA LÊ ISTO HOJE: eles eram os itens
      do cartão sem foto, e o cartão passou a mostrar só o nome da turma.

      Ficam porque são copy escrita e conferida, não placeholder, e porque esta
      pasta não está em controle de versão: apagar aqui é perder. Quando
      voltarem a ser usados (um acordeão de programa, um quadro comparativo), a
      lista já existe. */
  points: string[]
  /** [SUBSTITUIR] hoje é BANCO DE IMAGENS (Unsplash), não a academia.
      As quatro entraram a pedido, para o cartão parar de ser uma placa vazia, e
      são de outros tatames: nenhuma mostra a sala do 47 Franklin Street, nenhum
      aluno da casa aparece nelas.

      É por isso que o `imageAlt` descreve só o que a foto mostra e nunca diz
      "na Holanda BJJ": alt que afirma um lugar que a foto não é vira legenda
      falsa para quem usa leitor de tela. Trocar pelas fotos reais do
      @holanda.bjjacademy é a maior melhoria disponível nesta página. */
  image: string | null
  /** Descreve a FOTO, e não o programa: é o que vai no alt. */
  imageAlt: string
}

export const programs: Program[] = [
  {
    id: 'beginners',
    name: 'Beginners',
    audience: 'adults',
    ages: 'Adults, day one',
    summary:
      'A dedicated entry point for complete beginners. You learn the fundamentals in a calm, structured setting: no uniform and no experience required for your first class.',
    points: [
      'The basics taught as basics, not as warm-up',
      'Live rounds stay optional until you ask',
      'A kimono to borrow on your first class',
    ],
    image: '/programs/beginners.webp',
    imageAlt: 'Two students in white gis drilling a position on the mat',
  },
  {
    id: 'adults',
    name: 'Adults Jiu-Jitsu',
    audience: 'adults',
    ages: 'Gi, all levels',
    summary:
      'The core programme. A curriculum that starts from the very first grip and keeps challenging experienced grapplers. Technical, controlled and completely beginner-friendly.',
    points: [
      'Position before submission, every cycle',
      'Rounds with people who make you work',
      'One syllabus, taught in cycles',
    ],
    image: '/programs/adults.webp',
    imageAlt: 'Two adults rolling in the gi, one working to pass the guard',
  },
  {
    id: 'kids',
    name: 'Jiu-Jitsu Kids',
    audience: 'kids',
    /** [CONFIRMAR] a faixa etária exata. O planejamento diz 7 a 15. */
    ages: 'Ages 7 to 15',
    summary:
      'Confidence, focus and discipline, taught as habits instead of speeches. Children train with children their own size, and parents are welcome to stay and watch.',
    points: [
      'Kids train with kids their own size',
      'Discipline taught as a habit, not a speech',
      'Parents welcome to stay and watch',
    ],
    image: '/programs/kids.webp',
    imageAlt: 'Two young students in gi facing each other at the start of a round',
  },
  {
    id: 'nogi',
    name: 'No-Gi Grappling',
    audience: 'adults',
    ages: 'All levels',
    summary:
      'Grappling without the kimono: faster exchanges and wrestling-based transitions. A perfect complement to your gi training, or a starting point on its own.',
    points: [
      'Shorts and rash guard, no kimono needed',
      'The same syllabus, without the grips',
      'Beginners take this one too',
    ],
    image: '/programs/nogi.webp',
    imageAlt: 'Two athletes training no-gi, in shorts and rash guards',
  },
]

/* ── Como começar ────────────────────────────────────────────────────────────
   Três passos, do clique à confirmação. É o desenho da referência, e ele é
   melhor que o que estava aqui antes por um motivo: os três falam do que a
   PESSOA faz, e o terceiro promete uma confirmação concreta em vez de descrever
   a aula, que agora é assunto de uma seção inteira. */
export const steps = [
  {
    id: 'form',
    title: 'Fill the form',
    body: 'Click any red button on this page and tell us a little about yourself. It takes under a minute.',
  },
  {
    id: 'time',
    title: 'Pick date and time',
    body: 'Choose the class you want and pick a day and a time that works for you. Nothing is charged and nothing is signed here.',
  },
  {
    id: 'confirm',
    title: 'Get confirmation',
    body: 'You get the details in writing: the address, what to wear, what to bring and what the class looks like.',
  },
]

/* ── Por que as pessoas ficam ────────────────────────────────────────────────
   Quatro diferenciais, cada um com foto e ícone próprios. O ícone vive no dado
   e não no componente: casar texto e ícone por string lá dentro faria trocar
   uma palavra da copy apagar o ícone sem avisar ninguém. */
export type Reason = {
  id: string
  icon: 'belt' | 'door' | 'family' | 'whistle'
  title: string
  body: string
  /** [SUBSTITUIR] hoje é BANCO DE IMAGENS (Unsplash), igual aos cartões de
      programa: são de outros tatames, não da sala do 47 Franklin Street. O
      `imageAlt` descreve só o que a foto mostra e nunca diz "na Holanda BJJ". */
  image: string | null
  imageAlt: string
  /** O que precisa aparecer nesta foto. Vira o briefing do slot vazio. */
  brief: string
}

export const reasons: Reason[] = [
  {
    id: 'beginner',
    icon: 'door',
    title: 'Beginner friendly',
    body: 'Most people who walk in have never trained. Your first class is free, no uniform is required, and every class has a beginner path through it.',
    image: '/why/beginner.webp',
    imageAlt: 'Two students drilling a position in the gi, one guiding the other',
    brief: 'A first-timer drilling with a coach, close, hands on the grip',
  },
  {
    id: 'structured',
    icon: 'belt',
    title: 'Safe and structured',
    body: 'Authentic Brazilian jiu-jitsu, taught the way it is taught in Brazil: a clear curriculum, controlled drilling, position before submission, and no shortcuts around the fundamentals.',
    image: '/why/structured.webp',
    imageAlt: 'A class drilling in pairs across the mat',
    brief: 'Wide shot of a class in line at the start, gis on, mat full',
  },
  {
    id: 'family',
    icon: 'family',
    title: 'Mats families sit beside',
    body: 'The academy is clean and organised, parents are welcome to stay and watch the whole class, and children are matched with children their own size.',
    image: '/why/family.webp',
    imageAlt: 'A young student in a gi watching a kids class from the side of the mat',
    brief: 'Kids class in session with parents sitting along the wall',
  },
  {
    id: 'coaching',
    icon: 'whistle',
    title: 'Coaches who know your name',
    body: 'Small enough that a coach fixes your grip by name instead of shouting a correction across the mats. You are not a number on a mat here.',
    image: '/why/coaching.webp',
    imageAlt: 'Two students close in the gi, working a detail on the ground',
    brief: 'Coach kneeling beside two students, correcting a detail mid-drill',
  },
]

/* ── O professor ─────────────────────────────────────────────────────────────
   NADA NA PÁGINA LÊ ISTO HOJE. A seção de corpo técnico saiu (a aula
   experimental entrou no lugar) e a copy da aula fala em "our team", não num
   nome próprio.

   O bloco fica porque é o lugar de estacionamento de duas pendências reais
   (faixa e linhagem) e porque o nome é o mesmo que vai no `employee` do JSON-LD
   em `index.html`. No dia em que uma seção de professor voltar, ou em que o
   cliente mandar a faixa, é aqui que entra.

   Faixa e linhagem não se preenchem com um chute: dizer a faixa errada de um
   professor de jiu-jitsu é o erro mais caro que esta página poderia cometer, e
   ele não sairia num teste, sairia na boca de um aluno. */
export const instructor = {
  name: 'Diego do Nascimento Holanda',
  shortName: 'Diego',
  role: 'Head coach',
  /** [CONFIRMAR] faixa e linhagem. */
  belt: null as string | null,
  lineage: null as string | null,
}

/* ── A aula experimental ─────────────────────────────────────────────────────
   A seção que entrou no lugar do corpo técnico, a pedido do Adryan.

   Ela existe porque a objeção real de quem nunca treinou não é "o professor é
   bom?", é "o que exatamente vai acontecer comigo quando eu atravessar aquela
   porta?". Nenhum anúncio responde isso, e é a resposta que faz alguém marcar.

   ISTO JÁ FOI UMA LINHA DO TEMPO de seis etapas, e virou três parágrafos ao
   lado de um vídeo, também a pedido. O conteúdo não se perdeu: cada garantia
   que estava numa etapa continua numa frase. O que mudou é quem carrega o peso
   da seção, que agora é o vídeo de dentro da sala. Faz sentido: a pergunta é
   "como é lá dentro", e para essa pergunta um vídeo vale mais que seis títulos.

   Nada aqui depende de dado que o cliente não deu. Não tem horário, não tem
   preço e não tem promessa de estrutura que ninguém conferiu.

   E quem recebe é "our team", NUNCA um nome próprio. A versão anterior dizia
   que o Diego encontra você na porta, e isso é uma promessa que a academia não
   controla: numa terça à noite quem abre a porta é quem estiver lá. Promessa
   de atendimento é da casa, não de uma pessoa, senão a primeira vez que for
   outro professor a página vira mentira na cara do aluno. */
export const trial = {
  /**
   * A CHECKLIST substituiu três parágrafos.
   *
   * O conteúdo é o mesmo, item por item: o que trazer, o kimono emprestado,
   * quem recebe na porta, o aquecimento que não é teste físico, a técnica
   * destrinchada e drilada, e o rola opcional com nada assinado. O que mudou é
   * a forma, a pedido: prosa aqui obriga a LER para descobrir se a objeção da
   * pessoa foi respondida, e lista deixa ela varrer com o olho e achar a dela.
   *
   * Seis itens, e seis é teto: cada um precisa caber numa linha na coluna do
   * texto, e a seção inteira precisa continuar cabendo numa tela ao lado de um
   * vídeo 9/16.
   *
   * Escritos como FATO e não como pergunta. A referência (o "right fit" do
   * Jiu-Jitsu Prime) pergunta ao leitor e ele responde mentalmente que sim;
   * aqui a seção não está qualificando ninguém, está descrevendo o que
   * acontece, e pergunta retórica em cima disso soaria vendedora.
   */
  checklist: [
    'You bring a t-shirt, shorts and water. Nothing else.',
    'A kimono to borrow, if the class you booked uses one.',
    'Someone meets you at the door, fifteen minutes early.',
    'A warm-up that is movement, not a fitness test.',
    'One technique, broken down and drilled with a partner.',
    'Live rounds only if you want them. Nothing is signed.',
  ],

  /**
   * Vídeo de FUNDO da seção, mandado pelo cliente.
   *
   * ATENÇÃO ao que ele mostra: é um passeio pela sala VAZIA, com os tatames
   * ainda enrolados e embalados em plástico. Não é aula acontecendo. Por isso
   * ele entra bem escurecido (véu de 82%) e só como textura de ambiente: no
   * claro, uma sala em montagem atrás de um texto que descreve um aquecimento e
   * um drill vira contradição na cara do leitor.
   *
   * [CONFIRMAR com o cliente] se essa filmagem é do 47 Franklin Street ou de um
   * espaço novo. Se for espaço novo, é notícia que muda a página inteira.
   *
   * O arquivo foi reencodado de 3,3 MB para 1,1 MB (mesma duração, sem áudio,
   * 720px). O original está em `raw/`, fora da pasta publicada.
   */
  bgVideo: {
    src: '/video/first-class.mp4',
    poster: '/video/first-class-poster.webp',
  },

  /** O que precisa estar no vídeo. Vira o briefing do slot vazio. */
  videoBrief:
    'Inside the academy, filmed vertically: the mats, a class in session and the front desk',
}

/* ── Avaliações ──────────────────────────────────────────────────────────────
   REAIS, copiadas do perfil do Google da academia. Nenhuma foi escrita aqui, e
   nenhuma foi retocada: o texto é o que a pessoa escreveu, com a pontuação que
   ela usou, e o nome é o que aparece no perfil dela.

   Seis, escolhidas para cobrir as duas campanhas: três de aluno adulto e três
   de pai ou mãe. Foram preferidas as avaliações COMPLETAS, e não as que o
   Google corta com "… More": citar meia frase de alguém é o tipo de coisa que
   o autor da frase repara.

   Algumas foram escritas em português e o Google traduz. Elas entram na
   tradução, que é como o próprio Google as mostra para quem lê em inglês.

   Se for trocar ou acrescentar: o `role` não é enfeite, é o que diz ao leitor
   de quem é a voz, e é o que faz um pai se reconhecer no depoimento de outro
   pai em vez de ler seis elogios iguais. */
export type Review = {
  name: string
  /** "Member", "Parent", "Beginner": diz ao leitor de quem é a voz. */
  role: string
  text: string
}

export const reviews: Review[] = [
  {
    name: 'Luisa',
    role: 'Member',
    text: 'The place is clean, organized, and has a great energy. Professor Diego is very attentive, patient, and truly cares about his students. Highly recommend for anyone looking to train Jiu-Jitsu in a positive environment!',
  },
  {
    name: 'Michelle Sena da silva',
    role: 'Parent',
    text: 'Excellent academy, very well-prepared instructor, an excellent Jiu-Jitsu professional. I’m very happy to be part of this academy. I feel my daughter is in the right place.',
  },
  {
    name: 'Thiago Cerqueira',
    role: 'Member',
    text: 'The best Jiu-Jitsu teacher I’ve ever trained with. Very technical and attentive!! I improved a lot after training with Master Diego.',
  },
  {
    name: 'Isabela Bergamasco',
    role: 'Parent',
    text: 'I really like the gym! My son trains there and I’m very happy with the place. It’s a very clean, organized, and well-maintained environment. The instructors are very attentive and caring with the children, which makes all the difference to me.',
  },
  {
    name: 'Gustavo',
    role: 'Member',
    text: 'Awesome gym!! Crew feels like a family and wonderful staff/coaches.',
  },
  {
    name: 'Patrick William de Oliveira Lima',
    role: 'Parent',
    text: 'Simply the right place for your child to learn Jiu Jitsu and its values. Professor Diego Holanda is always attentive to the children, both in terms of teaching methods and in monitoring our son’s development in the sport. We are reaping the rewards both in our daily lives and in competitions.',
  },
]

/* ── Grade de horários ───────────────────────────────────────────────────────
   [CONFIRMAR] a grade REAL, por turma. Esta é a estrutura final e o componente
   já lê daqui, mas os horários abaixo são um rascunho e não podem ir ao ar:
   mandar alguém para uma porta fechada é o pior erro possível numa página que
   vai receber tráfego pago.

   É também daqui que saem os horários oferecidos no agendamento, então trocar
   esta lista arruma a página e o formulário de uma vez. */
export const schedulePending = true

export type ClassSlot = { time: string; program: string }

export const schedule: { day: string; slots: ClassSlot[] }[] = [
  {
    day: 'Monday',
    slots: [
      { time: '6:30 am', program: 'Adults · Beginners' },
      { time: '5:00 pm', program: 'Kids · 7 to 15' },
      { time: '6:30 pm', program: 'Adults · All levels' },
      { time: '7:30 pm', program: 'Adults · No-Gi' },
    ],
  },
  {
    day: 'Tuesday',
    slots: [
      { time: '12:00 pm', program: 'Adults · Beginners' },
      { time: '5:00 pm', program: 'Kids · 7 to 15' },
      { time: '6:30 pm', program: 'Adults · All levels' },
    ],
  },
  {
    day: 'Wednesday',
    slots: [
      { time: '6:30 am', program: 'Adults · Beginners' },
      { time: '5:00 pm', program: 'Kids · 7 to 15' },
      { time: '6:30 pm', program: 'Adults · All levels' },
      { time: '7:30 pm', program: 'Adults · No-Gi' },
    ],
  },
  {
    day: 'Thursday',
    slots: [
      { time: '12:00 pm', program: 'Adults · Beginners' },
      { time: '5:00 pm', program: 'Kids · 7 to 15' },
      { time: '6:30 pm', program: 'Adults · All levels' },
    ],
  },
  {
    day: 'Friday',
    slots: [
      { time: '6:30 am', program: 'Adults · Beginners' },
      { time: '5:00 pm', program: 'Kids · 7 to 15' },
      { time: '6:30 pm', program: 'Adults · No-Gi' },
    ],
  },
  {
    day: 'Saturday',
    slots: [
      { time: '9:00 am', program: 'Kids · 7 to 15' },
      { time: '10:00 am', program: 'Adults · Beginners' },
      { time: '11:00 am', program: 'Adults · All levels' },
    ],
  },
]

/* ── Perguntas ───────────────────────────────────────────────────────────────
   No formato da referência: a pergunta escrita na voz de quem chega, e a
   resposta respondendo de verdade em vez de empurrar para o formulário.

   TRÊS perguntas da referência ficaram FORA, e é de propósito: "estou preso a
   um contrato", "tem chuveiro e vestiário" e "qual o horário de funcionamento"
   dependem de dado que o cliente não mandou. A de preço ficou, reescrita para
   responder o que dá para responder sem inventar número. As outras entram
   quando o dado chegar.

   A mesma lista alimenta o JSON-LD da seção, então pergunta e resposta existem
   num lugar só e nunca divergem. */
export const faq = [
  /* SEIS perguntas, a pedido, e o corte não foi por tamanho: quatro das dez
     respondiam coisa que a página já responde melhor em outro lugar.

     Saíram: "how do I book my free trial" (é a seção III inteira, com os três
     passos), "what actually happens in the trial class" (é a seção IV, com o
     vídeo e a prancheta), "where are you located" (está na barra do topo, na
     primeira tela, no mapa e no rodapé) e "do you train no-gi" (é um dos quatro
     cartões de programa, com nome e foto).

     As seis que ficaram têm em comum uma coisa: nenhuma é informação, todas são
     OBJEÇÃO. É o que um FAQ de página de captação serve para fazer, e é por
     isso que a ordem também mudou — as duas primeiras são os dois motivos mais
     comuns para alguém fechar a página, e a terceira é o medo que ninguém
     escreve no formulário.

     A mesma lista alimenta o JSON-LD da seção, então cortar aqui corta lá: o
     dado estruturado nunca anuncia uma pergunta que a página não mostra. */
  {
    q: 'I have never trained before. Is Holanda BJJ beginner friendly?',
    a: 'Completely. You do not need any experience at all: the Beginners programme is built for total first-timers, and your first class is on us. All you need for day one is a t-shirt, shorts and a bottle of water.',
  },
  {
    q: 'I am not fit or flexible enough. Can I still start?',
    a: 'That is the reason to start, not a reason to wait. The warm-up is movement and not a fitness test, you set your own pace while drilling, and you stop whenever you need to. Nobody here started fit or flexible.',
  },
  {
    q: 'Will I have to fight someone on my first day?',
    a: 'No. Live rounds are optional on your first class, and most first-timers sit and watch them. Nobody is thrown in to see how they cope.',
  },
  {
    q: 'Do I need a gi or any equipment?',
    a: 'No. For the gi classes there is a kimono here to borrow on your first class. For no-gi, shorts and a t-shirt are enough. Buy something only if you decide to keep training.',
  },
  {
    q: 'Do you have classes for kids?',
    a: 'Yes, for ages 7 to 15. Children are matched with children their own size, the class is structured from start to finish, and parents are welcome to stay and watch the whole thing.',
  },
  {
    q: 'How much is membership?',
    a: 'It depends on the programme and on how often you want to train. We go through the options with you after your free class, with nothing to sign that day.',
  },
]

