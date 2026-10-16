/**
 * O divisor kids: um VARAL DE BANDEIRINHAS pendurado na curva da viga do torii
 * (pontas altas, meio baixo), na borda de cima da seção vermelha. Cada
 * bandeirola balança de leve, fora de fase com a vizinha.
 *
 * Não é a fita cruzada nem a onda das referências (Dárcio e Satori): é festa
 * de criança, e o fio é o kasagi.
 *
 * Tudo CSS: a altura de cada bandeira sobre a curva vem de `--y`, calculada
 * aqui uma vez (parábola), e o balanço é um `@keyframes` com atraso por índice.
 * Com reduced-motion, as bandeiras ficam paradas. No celular, metade delas.
 */
const N = 19
const FLAGS = Array.from({ length: N }, (_, i) => {
  const t = i / (N - 1)
  /* a curva do fio: 0 nas pontas, 1 no meio */
  const sag = 1 - (2 * t - 1) ** 2
  return { y: +(sag * 34).toFixed(1), tone: ['paper', 'ink', 'deep'][i % 3] }
})

export function Bunting() {
  return (
    <div className="bt" aria-hidden="true">
      <svg className="bt-string" viewBox="0 0 1000 60" preserveAspectRatio="none">
        <path d="M0 4C250 40 750 40 1000 4" />
      </svg>
      <ul className="bt-flags">
        {FLAGS.map((f, i) => (
          <li
            key={i}
            className={`bt-flag bt-flag--${f.tone}`}
            style={{ ['--y' as string]: `${f.y}px`, ['--i' as string]: i }}
          />
        ))}
      </ul>
    </div>
  )
}
