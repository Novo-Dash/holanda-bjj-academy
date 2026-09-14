import { Pending } from '@/components/paper'
import { Wordmark } from '@/components/mark'
import { programs, site } from '@/data/site'

const YEAR = new Date().getFullYear()

/* Os mesmos âncoras da barra do topo, mais os que só existem aqui embaixo. No
   desenho da referência esta coluna se chama "explore" e é o mapa da página
   para quem chegou até o fim sem achar o que procurava. */
const EXPLORE = [
  { label: 'Programmes', href: '#programs' },
  { label: 'How to start', href: '#how' },
  { label: 'The trial class', href: '#trial' },
  { label: 'Why people stay', href: '#why' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Questions', href: '#faq' },
]

/**
 * Rodapé em tinta, com o fio duplo de sempre no topo, aqui na versão clara
 * sobre escuro. A página fecha na cor da marca: o pedido é escuro, a faixa do
 * mapa devolve o papel por um instante, e o rodapé assenta no escuro de novo.
 *
 * Quatro colunas: a marca, os programas, o índice da página e o "visite-nos".
 *
 * O horário de funcionamento saiu daqui a pedido. Com ele fora, a grade de
 * aulas não aparece em NENHUM lugar visível da página: ela só existe no passo 3
 * do agendamento, onde o formulário oferece os horários do programa escolhido.
 * Isso é defensável enquanto a grade for rascunho (`schedulePending`), e vira
 * uma lacuna real no dia em que a grade verdadeira chegar.
 *
 * O padding de baixo é maior no celular por causa da barra fixa de ação, que
 * mora exatamente ali: sem a folga, a última linha do rodapé fica debaixo dela
 * e a barra cobriria o link do Instagram.
 */
export function Footer() {
  const hasFacebook = Boolean(site.socials.facebook)

  return (
    <footer className="bg-ink pb-24 text-paper md:pb-0">
      <div className="shell">
        <div className="rule-double-dark" />

        <div className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark invert />
            <p className="mt-6 max-w-[34ch] text-[0.88rem] leading-relaxed text-paper/60">
              Beginner-friendly Brazilian jiu-jitsu in the middle of {site.city},{' '}
              {site.stateLong}. Adults, kids and no-gi, with the first class on us.
            </p>
          </div>

          <div>
            <p className="label text-paper/55">Programmes</p>
            <ul className="mt-4 flex flex-col gap-2 text-[0.88rem] text-paper/85">
              {programs.map((p) => (
                <li key={p.id}>
                  {p.name} <span className="text-paper/55">· {p.ages}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-paper/55">Explore</p>
            <ul className="mt-3 flex flex-col text-[0.88rem]">
              {EXPLORE.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-block py-1.5 text-paper/85 no-underline hover:text-paper"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-paper/55">Visit us</p>
            <address className="mt-4 not-italic text-[0.88rem] leading-relaxed text-paper/85">
              {site.address.line1}
              <br />
              {site.address.line2}
              {site.address.zip ? ` ${site.address.zip}` : ''}
            </address>
            {site.address.zipPending && <Pending dark>Zip code to confirm</Pending>}

            {/* O link de direções veio da seção de endereço, que saiu. Ele é a
                única ação que aquela seção tinha e que o mapa embutido não
                oferece: o mapa mostra onde é, este abre a rota no telefone de
                quem está lendo. */}
            <a
              href={site.mapsDirections}
              target="_blank"
              rel="noreferrer"
              className="label mt-3 inline-flex items-center gap-3 py-1.5 text-paper/85 no-underline hover:text-paper"
            >
              Get directions
              <span aria-hidden="true" className="block h-1.5 w-1.5 rotate-45 bg-red" />
            </a>

            <p className="mt-4 text-[0.88rem]">
              <a
                href={site.phoneHref}
                className="tnum inline-block py-1 text-paper/85 no-underline hover:text-paper"
              >
                {site.phone}
              </a>
              <br />
              {site.email ? (
                <a
                  href={`mailto:${site.email}`}
                  className="inline-block py-1 text-paper/85 no-underline hover:text-paper"
                >
                  {site.email}
                </a>
              ) : (
                <Pending dark>Email to confirm</Pending>
              )}
            </p>

          </div>
        </div>

        <div className="rule-double-dark" />
        <div className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.78rem] text-paper/50">
            © {YEAR} {site.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5 text-[0.78rem]">
            <a
              href={site.socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-block py-1.5 text-paper/60 no-underline hover:text-paper"
            >
              {site.socials.instagramHandle}
            </a>
            {hasFacebook && (
              <a
                href={site.socials.facebook ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="inline-block py-1.5 text-paper/60 no-underline hover:text-paper"
              >
                Facebook
              </a>
            )}
            <span className="text-paper/55">Built by Novo Dash</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
