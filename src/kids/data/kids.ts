import { reviews, site } from '@/data/site'

/**
 * Toda a copy da LP Kids (copy-kids.md, ETAPA 1, 08/10/2026), literal.
 *
 * Endereço, telefone, nota e depoimentos NÃO moram aqui: vêm de
 * `src/data/site.ts`, que é o contrato das duas páginas (PRD 0.6).
 *
 * Pendência (PRD 0.5), dois tipos:
 *  - `pending`: o texto existe e pode ir ao ar, mas falta um fato que o
 *    completaria. Em prospect a página imprime a pastilha; em client, só o texto.
 *  - `gated`: o item só existe com o dado. Em client ele NÃO renderiza. É o caso
 *    do título do NAGA: plausível é exatamente o que ninguém confere depois.
 */

export type Item = {
  text: string
  /** O que falta, em português, para a pastilha do modo prospect. */
  pending?: string
  /** Não renderiza em client enquanto `pending` existir. */
  gated?: boolean
}

export type Variant = 'a' | 'b' | 'c'

export const nav = {
  links: [
    { label: 'Safety', href: '#safety' },
    { label: 'First Class', href: '#first-class' },
    { label: 'Coach', href: '#coach' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: 'Book a Free Kids Class',
  /* No celular o botão do topo usa o texto da barra fixa da copy. */
  ctaShort: 'Free Kids Class',
}

export const hero = {
  eyebrow: ['Jiu-Jitsu Kids', 'Ages 4 to 13', '47 Franklin Street, Framingham'],
  /** Quebras de linha escritas à mão. `mark` é a palavra que ganha o traço. */
  h1: {
    a: { lines: ['Kids jiu-jitsu', 'that sends them', 'home calmer,', 'not wilder.'], mark: 'calmer' },
    b: {
      lines: ['The hour your kid', 'can’t wait for.', 'The change you', 'notice at home.'],
      mark: 'notice',
    },
    c: {
      lines: ['“Will jiu-jitsu make', 'my kid aggressive?”', 'It does the opposite.'],
      mark: 'opposite',
    },
  } satisfies Record<Variant, { lines: string[]; mark: string }>,
  sub: 'Kids train with kids their own size, and you can watch every minute from the side of the mat. Your child’s first class is free: no experience, no uniform, nothing to sign.',
  cta: 'Book My Kid’s Free Class',
  /* Resumida a pedido do Adryan (09/10): 1 a 2 linhas, centrada sob o botão. */
  micro: 'Under a minute. We text you the address and what to wear.',
  directions: 'Get directions',
}

/** Os quatro selos. Cada um é BOTÃO para a seção que prova o que ele diz
    (diagnóstico: 8,1% de cliques mortos em selos). */
export const trust = [
  {
    id: 'rating',
    label: `${site.rating.score} on Google · ${site.rating.count} reviews`,
    hint: 'see parent reviews',
    target: '#reviews',
    icon: 'star',
  },
  {
    id: 'size',
    label: 'Matched by age and size',
    hint: 'see how we keep it safe',
    target: '#safety',
    icon: 'size',
  },
  {
    id: 'watch',
    label: 'Parents watch every class',
    hint: 'see how we keep it safe',
    target: '#safety',
    icon: 'eye',
  },
  {
    id: 'kimono',
    label: 'Kimono on loan, day one',
    hint: 'see the first class',
    target: '#first-class',
    icon: 'gi',
  },
] as const

/**
 * III · NAGA. O texto vem do POST da própria academia no Instagram (colado
 * pelo Adryan em 09/10), mais a linha da copy. Ele diz "great performance",
 * "excellent results and submissions": NÃO diz "Overall Team Champions" nem a
 * data, então isso não aparece. O vídeo mostra o cinturão escrito "TEAM
 * CHAMPION", e a legenda dele diz só o que está no vídeo.
 */
export const naga = {
  eyebrow: 'On the competition mat',
  h2: 'Another great performance at NAGA.',
  body: 'Our academy keeps growing as a reference in competition training for kids and teens. Even facing more experienced, higher-ranked opponents, our athletes showed technique and confidence, and came home with excellent results and submissions.',
  line: 'Most of them walked in nervous on day one. Competing is an invitation here, never a requirement.',
  videoCaption: 'The NAGA team champion belt',
  videoLabel: 'Holanda BJJ kids holding the NAGA team champion belt',
  cta: 'Book My Kid’s Free Class',
}

export const twoReaders = {
  h2: 'Two people are deciding. This part is for both of you.',
  parents: {
    label: 'For parents',
    h3: 'What you’ll notice at home',
    items: [
      {
        title: 'Structure they can follow.',
        text: 'Every class runs in the same order: line up, warm up, learn, drill, line up. Kids who know the routine learn to stay with it.',
      },
      { title: 'Energy that ends up on the mat.', text: 'Not on the couch, the walls or a younger sibling.' },
      {
        title: 'Confidence they earned.',
        text: 'It comes from finishing something hard, not from being told they’re great.',
      },
      {
        title: 'A real answer to bullying.',
        text: 'Posture, voice, distance and calm come first. They learn to end a problem, never to start one.',
        pending: 'Existe módulo anti-bullying no currículo? Quantas aulas por mês?',
      },
    ] as Array<{ title: string; text: string; pending?: string }>,
  },
  kids: {
    label: 'For kids',
    h3: 'What you’ll do in class',
    items: [
      { id: 'fall', text: 'Learn to fall without getting hurt. (It’s the most fun part.)' },
      { id: 'games', text: 'Play games that are secretly jiu-jitsu.' },
      { id: 'size', text: 'Train with kids your size. Nobody bigger squashing you.' },
      {
        id: 'stripes',
        text: 'Earn stripes on your belt when you’re ready.',
        pending: 'Sistema de graus kids',
        gated: true,
      },
    ] as Array<{ id: string; text: string; pending?: string; gated?: boolean }>,
  },
  cta: 'Book My Kid’s Free Class',
}

export const safety = {
  eyebrow: 'Is it safe?',
  h2: 'No punches. No kicks. Your kid learns to fall before anything else.',
  body: 'Injury is the first worry most parents bring through the door. This is what keeps it off our mats:',
  rules: [
    { title: 'Zero strikes.', text: 'Kids learn to hold, control and escape. Nobody hits anybody.' },
    {
      title: 'Paired by size, not only age.',
      text: 'Your 5-year-old trains with 5-year-olds, not with the 12-year-olds.',
    },
    {
      title: 'Tap means stop.',
      text: 'Every child learns the rule in the first class, and every partner respects it.',
    },
    { title: 'You see all of it.', text: 'Parents are welcome to stay and watch the whole class.' },
    {
      title: '',
      text: '',
      pending: 'Tipo de tatame e número de professores no tatame durante a aula kids',
      gated: true,
    },
  ] as Array<{ title: string; text: string; pending?: string; gated?: boolean }>,
  /* rótulo do botão de cada ilustração, para leitor de tela */
  playLabel: 'Play the animation',
}

export const aggression = {
  /* legenda à mão da polaroid: o que a foto mostra */
  photoCaption: 'Line up. Bow in.',
  question: 'Will jiu-jitsu make my kid more aggressive?',
  body: 'Most parents think it and never say it, so we’ll answer it here. Jiu-jitsu was built for the moment someone bigger pushes first. Kids learn to stay calm under pressure, keep their distance and use their voice, and only then to hold on. The kid who knows they can handle it is usually the kid who never needs to prove it.',
  quote: {
    text: 'We are reaping the rewards both in our daily lives and in competitions.',
    name: 'Patrick William de Oliveira Lima',
    role: 'parent',
  },
}

export const firstClass = {
  eyebrow: 'Your first visit',
  h2: 'Your kid’s first class, start to finish.',
  /* `at`: o minuto do passo em relação ao começo da aula. O cronômetro desce
     pela linha e chega em cada passo exatamente no minuto dele. O último passo
     não tem minuto: a duração da aula kids ainda não foi confirmada, e o
     cronômetro mostra `clock.done` em vez de inventar um número. */
  steps: [
    {
      at: -15,
      title: 'Arrive 15 minutes early.',
      text: 'Someone meets you at the door and shows you where to sit.',
      img: '/kids/fc-1',
      alt: 'The academy mat, empty and ready before class',
    },
    {
      at: -10,
      title: 'Gear up.',
      text: 'T-shirt, shorts with no pockets or zippers, and a water bottle. We lend a kimono for the gi class.',
      img: '/kids/fc-2',
      alt: 'Kids in white and black gis walking onto the mat for warm-up',
    },
    {
      at: -5,
      title: 'Meet Professor Diego.',
      text: 'He introduces himself and pairs your child with a partner their size.',
      img: '/kids/fc-3',
      alt: 'Professor Diego smiling with two of his kids students',
    },
    {
      at: 0,
      title: 'Class.',
      text: 'Warm-up games, then one technique broken into small steps and drilled with a partner. No hard sparring on day one.',
      img: '/kids/fc-4',
      alt: 'Kids rolling forward on the mat during warm-up',
    },
    {
      at: null,
      title: 'After class.',
      text: 'We walk you through the schedule and the options. Nothing to sign that day.',
      img: '/kids/fc-5',
      alt: 'The Holanda BJJ team together outdoors, kids and parents waving',
    },
  ] as Array<{ at: number | null; title: string; text: string; img: string; alt: string }>,
  clock: { inClass: 'class!', done: 'done ✓', after: 'after' },
  kidsNote: 'Wear your comfiest shorts. You’ll go home tired and with a new move.',
  cta: 'Pick a Day for the Free Class',
}

export const coach = {
  eyebrow: 'Who teaches your kid',
  h2: 'Professor Diego Holanda. Brazilian jiu-jitsu, taught the way it’s taught in Brazil.',
  /* Grau da faixa, anos de tatame, linhagem, idioma e o título NAGA ficam FORA
     até o cliente confirmar (pendências no README). */
  body: [
    'Diego is the head instructor and the name on the door, so he is the one on the mat with your kid.',
    'Parents keep saying the same thing in their reviews, in different words: he watches each child, not just the class.',
  ],
  photoCaption: 'Professor Diego Holanda',
  cta: 'Meet Professor Diego in a Free Class',
}

/**
 * Os depoimentos de PAI OU MÃE, do perfil do Google da academia (export
 * colado pelo Adryan em 09/10). Duas regras para qualquer troca futura:
 *
 * 1. SÓ ENTRA AVALIAÇÃO COMPLETA. O export corta as longas com "… More"
 *    (Danielle Cosgon, Marcela Miranda, Juliana Ferreira, lidia mafra,
 *    Valdeceia Barbosa). Completar o fim seria escrever palavra que a pessoa
 *    não escreveu. Voltam quando alguém copiar o texto inteiro do perfil.
 * 2. VERBATIM. As que estão em português vão TRADUZIDAS, fiéis, e marcadas
 *    como tradução no cartão (`translated`). Emoji fica de fora (a página não
 *    usa emoji); o resto é a fala da pessoa.
 *
 * Michelle, Isabela e Patrick já estavam no site.ts (a `/` também os usa):
 * vêm de lá, para o texto não existir em dois lugares.
 */
const fromSite = (name: string) => {
  const r = reviews.find((x) => x.name === name)
  if (!r) throw new Error(`review ausente no site.ts: ${name}`)
  return r.text
}

const PARENT_REVIEWS: Array<{ name: string; text: string; translated?: boolean }> = [
  {
    name: 'Eder Oliveira',
    text: 'Great place! The coaches are awesome with the kids, and it’s great to see him having fun while building confidence and discipline. Highly recommend!',
  },
  { name: 'Michelle Sena da Silva', text: fromSite('Michelle Sena da silva') },
  {
    name: 'Patrick William de Oliveira Lima',
    text: fromSite('Patrick William de Oliveira Lima'),
    translated: true,
  },
  {
    name: 'Amanda Alves',
    text: 'My son has improved so much in a short time. The professor and the whole team are amazing. Highly recommend.',
    translated: true,
  },
  { name: 'Isabela Bergamasco', text: fromSite('Isabela Bergamasco'), translated: true },
  {
    name: 'Sthefany Bento',
    text: 'A calm environment and amazing teachers. My daughter is loving it. Enrolling my daughter at this academy was my best choice.',
    translated: true,
  },
  { name: 'Djulia Portugal', text: 'My son loves the classes with Professor Diego.', translated: true },
  {
    name: 'Ana Cardozo',
    text: 'Knowing my son is learning discipline for everything, a time to play and a time to train. The teachers are very polite and firm with the kids, but also very caring. For me it’s a perfect score.',
    translated: true,
  },
]

export const parents = {
  h2: 'Framingham parents, in their own words.',
  sub: `${site.rating.score} on Google. Every quote below is on the academy’s Google profile.`,
  reviews: PARENT_REVIEWS,
  eyebrow: 'Parent stories',
  source: 'Parent · Google review',
  translated: 'Translated from Portuguese',
  stars: '5 out of 5 stars',
  prev: 'Previous review',
  next: 'Next review',
  goTo: (n: number) => `Show review ${n}`,
  cta: 'Book My Kid’s Free Class',
}

export const quickCheck = {
  h2: 'Is jiu-jitsu right for my kid?',
  sub: 'If you nod at even one of these, the free class is worth an hour of your week.',
  items: [
    { id: 'energy', text: 'My kid has more energy than our living room can hold.' },
    { id: 'shy', text: 'My kid is shy and holds back in groups.' },
    { id: 'bullied', text: 'Someone at school has been pushing my kid around.' },
    { id: 'quits', text: 'My kid quits things when they get hard.' },
    { id: 'screens', text: 'I’d trade an hour of screen time for an hour of moving.' },
    { id: 'protect', text: 'I want my kid to look after themselves, and never to start a fight.' },
  ],
  counter: (n: number) => `You checked ${n} of 6.`,
  worth: 'Worth an hour of your week.',
  cta: 'Book My Kid’s Free Class',
}

export const faq = {
  h2: 'Questions parents ask',
  sub: 'Still wondering? Call',
  cta: 'Book My Kid’s Free Class',
  items: [
    {
      q: 'Will my kid get hurt?',
      a: 'There are no punches or kicks in jiu-jitsu. Kids learn to fall safely first, train with partners their size, and stop the moment someone taps. You can watch the whole class.',
    },
    {
      q: 'Will jiu-jitsu make my kid aggressive?',
      a: 'It works the other way. Kids learn calm, distance and their voice before any technique, so they can end a problem without starting one.',
    },
    {
      q: 'My kid is shy and has never played a sport. Is that a problem?',
      a: 'No. Most people who walk through our door have never trained. Shy kids can watch the first few minutes and join when they’re ready.',
    },
    {
      q: 'What age can my kid start?',
      a: 'From 4 to 13, grouped by age and size: one class for ages 4 to 6 and one for ages 7 to 13.',
    },
    {
      q: 'What should my kid wear?',
      a: 'A t-shirt, shorts without pockets or zippers, and a water bottle. We lend a kimono for the first class.',
      pending: 'Confirmar empréstimo de kimono para kids',
    },
    { q: 'Can I stay and watch?', a: 'Yes. Parents are welcome to watch the whole class.' },
    {
      q: 'How much is it? Are we locked in?',
      a: 'It depends on how many days a week your kid trains. We go through the options after the free class, with nothing to sign that day.',
      pending: 'Tipo de contrato e regra de cancelamento',
    },
    {
      q: 'Can siblings train too? Is there family pricing?',
      a: '',
      pending: 'Desconto irmão/família, com número',
      gated: true,
    },
    {
      q: 'What days are kids classes?',
      a: '',
      pending:
        'Grade kids em texto (o CRM mostra 4-6 seg/qua/sex 17h e 7-13 seg/qua/qui 18h; confirmar com a academia)',
      gated: true,
    },
    {
      q: 'Do I need a credit card to book?',
      a: 'No. No card, no contract, nothing to sign for the free class.',
    },
  ] as Array<{ q: string; a: string; pending?: string; gated?: boolean }>,
}

export const finalCta = {
  h2: 'One free class. Then decide with your own eyes.',
  body: 'Bring your kid to 47 Franklin Street, in the middle of Framingham, and watch the whole class from the side of the mat. If it’s not for them, you’ve spent an hour.',
  cta: 'Book My Kid’s Free Class',
  orCall: 'or call',
  microAfterPhone: 'No experience. No uniform. No card.',
  mapTitle: 'Map showing Holanda BJJ Academy at 47 Franklin Street, Framingham',
}

export const form = {
  title: 'Book your kid’s free class',
  fields: {
    name: { label: 'Parent’s name', placeholder: 'First and last name' },
    phone: { label: 'Phone', help: 'We text the confirmation here.' },
    age: { label: 'Child’s age' },
    day: { label: 'Best day to come' },
    program: { label: 'Class', ages: (min: number, max: number) => `Ages ${min} to ${max}` },
  },
  ages: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  step1: 'Next: pick a day',
  step2: 'Book the free class',
  back: 'Back',
  under:
    'About thirty seconds. We text you the address, what to wear and the class time. No spam, and no call unless you want one.',
  errors: {
    name: 'Add your name so we know who to expect.',
    phone: 'That number looks short. US numbers have 10 digits.',
    age: 'Pick your kid’s age.',
    day: 'Pick a day that works.',
    time: 'Pick a time.',
  },
  loadingDays: 'Finding open classes…',
  noDays: 'No open spots in the next two weeks. We’ll text you the next one.',
  noApi: 'We couldn’t load the class times. Send this and we’ll text you the next open class.',
  sendWithoutDay: 'Send and text me a time',
  orCall: 'or call',
  thanks: {
    title: 'You’re in.',
    text: 'Check your texts: the address, what to bring and your kid’s class time are on the way.',
    kids: 'Kids: get ready for your first move.',
    calendar: 'Add to calendar',
  },
}

export const footer = {
  tag: 'Jiu-Jitsu Kids · Ages 4 to 13',
  built: 'Built by Novo Dash',
}

export const video = {
  /* A VSL do anúncio Kids aprovado (Drive, "02. Media / Kids Ads (Approved) /
     HolandaBJJ_vídeo1.mp4"), entregue pelo Adryan em 09/10. 31 s, legenda já
     gravada na imagem, COM áudio: o "Tap for sound" reinicia com som. O
     original de 44 MB fica em raw/kids-vsl/; aqui, 540×960 a 24 fps (3 MB). O
     `?v=` força o navegador a buscar a versão nova. */
  src: '/kids/vsl.mp4?v=3',
  poster: '/kids/vsl-poster.webp?v=3',
  width: 540,
  height: 960,
  label: 'Holanda BJJ Academy kids class: the kids line up, train with partners their size and learn with the coach',
  sound: 'Tap for sound',
  pause: 'Pause',
  play: 'Play',
  replay: 'Watch again',
}
