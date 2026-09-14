import { site } from '@/data/site'

/**
 * FAIXA DO MAPA — largura total, encostada no rodapé.
 *
 * Sem `band` e sem `shell` de propósito: quem chegou até aqui leu a página
 * inteira e está procurando "como eu chego lá". Padding lateral ou vertical
 * transformaria a faixa num cartão, e cartão de mapa é a coisa que ninguém
 * clica.
 *
 * O embed é o por consulta (`?q=...&output=embed`), que não precisa de chave de
 * API e já aponta para o endereço real. Quando o cliente mandar o link do
 * perfil do Google, trocar pelo embed do lugar em `site.ts`: aí o pino cai
 * exatamente na porta e o cartão da academia aparece dentro do mapa.
 *
 * `loading="lazy"` no iframe: um mapa do Google no fim da página custa mais de
 * 700 KiB, e ele não tem por que ser baixado por quem nunca vai rolar até aqui.
 */
export function MapBand() {
  const address = `${site.address.line1}, ${site.address.line2}`

  return (
    <section aria-label={`Map to ${site.name}`} className="relative">
      <div className="rule-double" />
      <iframe
        src={site.mapsEmbedSrc}
        title={`Map showing ${site.name} at ${address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-[300px] w-full border-0 md:h-[420px]"
      />
    </section>
  )
}
