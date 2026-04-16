'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ArrowDown, Sparkles, Music, Camera, QrCode, ChevronRight } from 'lucide-react'
import AuthButton from '@/components/AuthButton'

// ─── Partículas de fundo (marca registrada) ──────────────────────
function Particulas({ cor = '#ff2d78' }: { cor?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            background: `${cor}${40 + i * 8}`,
            left: `${8 + i * 11}%`,
            top: `${15 + ((i * 17) % 60)}%`,
          }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 4 + i * 0.8, repeat: Infinity, delay: i * 0.6 }}
        />
      ))}
    </div>
  )
}

// ─── Glow orbs animados ──────────────────────────────────────────
function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full blur-[180px] opacity-15"
        style={{ background: 'radial-gradient(circle, #ff2d78, transparent 70%)', top: '-15%', right: '-10%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full blur-[80px] md:blur-[60px] md:blur-[50px] md:blur-[80px] opacity-10"
        style={{ background: 'radial-gradient(circle, #ff69b4, transparent 70%)', top: '40%', left: '-10%' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, delay: 3 }}
      />
      <motion.div
        className="absolute w-[180px] h-[180px] md:w-[350px] md:h-[350px] rounded-full blur-[60px] md:blur-[50px] md:blur-[80px] opacity-8"
        style={{ background: 'radial-gradient(circle, #c850c0, transparent 70%)', bottom: '10%', right: '20%' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, delay: 5 }}
      />
    </div>
  )
}

// ─── Aspas SVG decorativas (marca registrada) ────────────────────
function AspasSVG({ className = '', cor = '#ff2d78' }: { className?: string; cor?: string }) {
  return (
    <svg viewBox="0 0 40 30" className={className} fill="none">
      <path d="M0 20 Q0 10 8 5 L10 8 Q5 12 5 18 H12 V28 H0 Z" fill={`${cor}25`} />
      <path d="M18 20 Q18 10 26 5 L28 8 Q23 12 23 18 H30 V28 H18 Z" fill={`${cor}25`} />
    </svg>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/70 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <img src="/logo.png" alt="Eternizar" className="h-14" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-zinc-400 hover:text-white text-sm transition-colors">Como Funciona</a>
          <a href="#depoimentos" className="text-zinc-400 hover:text-white text-sm transition-colors">Depoimentos</a>
          <AuthButton variant="navbar" />
          <Link
            href="/criar"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white border border-[#ff2d78] hover:bg-[#ff2d78] transition-all duration-300"
          >
            Criar Homenagem
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <AuthButton variant="navbar" />
          <Link
            href="/criar"
            className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#ff2d78] transition-all"
          >
            Criar
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}

// ═══════════════════════════════════════════════════════════════════
export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080c] text-white overflow-x-hidden">

      <Navbar />

      {/* ═══ HERO — Tela inteira, emocional ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <GlowOrbs />
        <Particulas />

        {/* Aspas decorativas gigantes de fundo */}
        <AspasSVG className="absolute top-[18%] left-[8%] w-24 md:w-32 opacity-30" />
        <AspasSVG className="absolute bottom-[22%] right-[8%] w-20 md:w-28 opacity-20 rotate-180" />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          {/* Logo grande */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <img src="/logo.png" alt="Eternizar" className="h-14 sm:h-16 md:h-20 mx-auto" />
          </motion.div>

          {/* Ícone coração animado */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 1, delay: 0.3 }}
            className="mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-12 h-12 mx-auto fill-current" style={{ color: '#ff2d78', filter: 'drop-shadow(0 0 30px rgba(255,45,120,0.5))' }} />
            </motion.div>
          </motion.div>

          {/* Headline emocional */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6"
          >
            Algumas histórias merecem{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#ff6b9d] to-[#ff2d78] bg-clip-text text-transparent">
              ser eternizadas.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Transforme os momentos mais especiais em uma experiência digital 
            inesquecível. Com música, fotos e a história de vocês.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/criar"
              className="btn-shimmer inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base shadow-lg shadow-[#ff2d78]/25 hover:shadow-[#ff2d78]/40 hover:scale-105 transition-transform duration-300"
            >
              Criar minha homenagem
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-zinc-300 font-semibold text-base border border-white/10 hover:bg-white/5 transition-all"
            >
              Ver exemplo
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 flex flex-col items-center gap-2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ArrowDown className="w-5 h-5 text-[#ff2d78]/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ SEÇàO EMOCIONAL — O que você pode criar ═══ */}
      <section className="relative py-32 overflow-hidden">
        <Particulas cor="#ff69b4" />

        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[#ff2d78] text-xs uppercase tracking-[0.3em] mb-4 font-medium">Para quem você ama</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Uma página feita com amor.
              <br />
              <span className="text-zinc-500">Sentida pelo coração.</span>
            </h2>
          </motion.div>

          {/* Cards emocionais — sem preço */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                titulo: 'Para o amor da sua vida',
                desc: 'Reviva o primeiro beijo, a primeira viagem, cada segundo juntos. Uma página que conta a história de vocês com música, fotos e um contador de tempo real.',
                icone: Heart,
                gradiente: 'from-pink-500/20 to-rose-500/5',
              },
              {
                titulo: 'Para a turma que marcou sua vida',
                desc: 'Os perrengues, as risadas, a colação. Uma homenagem digital para nunca esquecer os melhores anos da faculdade.',
                icone: Camera,
                gradiente: 'from-violet-500/20 to-purple-500/5',
              },
              {
                titulo: 'Para quem merece ouvir',
                desc: 'Aniversários, agradecimentos, pedidos de desculpa. Uma surpresa que chega pelo link e emociona na primeira tela.',
                icone: Sparkles,
                gradiente: 'from-amber-500/20 to-orange-500/5',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative rounded-2xl p-8 border border-white/8 bg-white/[0.02] hover:border-white/15 transition-all duration-500"
              >
                {/* Glow sutil no hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${card.gradiente} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <card.icone className="w-8 h-8 mb-6 text-[#ff2d78]" />
                  <h3 className="text-xl font-bold mb-3 text-white">{card.titulo}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SEÇàO FEATURES — Visual, não lista ═══ */}
      <section id="como-funciona" className="relative py-32 overflow-hidden">
        {/* Fundo gradiente marca registrada */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 50%, #2d001840, transparent 70%)'
        }} />
        <Particulas />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[#ff2d78] text-xs uppercase tracking-[0.3em] mb-4 font-medium">Simples e mágico</p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Em minutos, uma surpresa <br className="hidden sm:block" /> que dura para sempre.
            </h2>
          </motion.div>

          <div className="space-y-24">
            {[
              {
                num: '01',
                titulo: 'Conte sua história',
                desc: 'Escolha fotos, uma música especial e escreva os momentos que marcaram vocês. O formulário guia cada passo.',
                icone: Camera,
              },
              {
                num: '02',
                titulo: 'Adicione a trilha sonora',
                desc: 'Busque a música de vocês e ela toca automaticamente quando a página é aberta. O som que define a história.',
                icone: Music,
              },
              {
                num: '03',
                titulo: 'Compartilhe a emoção',
                desc: 'Receba um link exclusivo e um QR Code para compartilhar. A pessoa abre e vive a experiência completa.',
                icone: QrCode,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`flex items-start gap-8 ${i % 2 !== 0 ? 'flex-row-reverse text-right' : ''}`}
              >
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-white/[0.03]">
                    <item.icone className="w-7 h-7 text-[#ff2d78]" />
                  </div>
                </div>
                <div>
                  <span className="text-[#ff2d78]/40 text-xs font-bold tracking-widest">{item.num}</span>
                  <h3 className="text-2xl font-bold mb-2 mt-1">{item.titulo}</h3>
                  <p className="text-zinc-500 leading-relaxed max-w-md">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SEÇàO DEPOIMENTOS — Social proof emocional ═══ */}
      <section id="depoimentos" className="relative py-32 overflow-hidden">
        <Particulas cor="#c850c0" />

        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#ff2d78] text-xs uppercase tracking-[0.3em] mb-4 font-medium">Quem já criou</p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              A reação deles é a melhor parte.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { texto: 'Minha namorada chorou de emoção quando abriu. Melhor presente que já dei na vida.', autor: 'Lucas', cidade: 'São Paulo' },
              { texto: 'Fizemos para a turma inteira. Virou tradição — todo semestre alguém cria uma.', autor: 'Mariana', cidade: 'Curitiba' },
              { texto: 'Mandei no aniversário da minha mãe. Ela assistiu 4 vezes seguidas.', autor: 'Rafael', cidade: 'Rio de Janeiro' },
            ].map((dep, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl p-6 border border-white/8 bg-white/[0.02]"
              >
                <AspasSVG className="w-10 mb-4 opacity-60" />
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">{dep.texto}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ff2d78]/20 flex items-center justify-center text-xs font-bold text-[#ff2d78]">
                    {dep.autor[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{dep.autor}</p>
                    <p className="text-zinc-600 text-xs">{dep.cidade}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL — Emocional ═══ */}
      <section className="relative py-32 overflow-hidden">
        {/* Background marca registrada */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 60%, #2d001850, transparent 60%)'
        }} />
        <Particulas />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-8"
            >
              <Heart className="w-10 h-10 mx-auto fill-current text-[#ff2d78]" style={{ filter: 'drop-shadow(0 0 20px rgba(255,45,120,0.4))' }} />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Alguém especial merece{' '}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#ff6b9d] to-[#ff2d78] bg-clip-text text-transparent">
                saber o quanto importa.
              </span>
            </h2>
            <p className="text-zinc-500 mb-10 text-base max-w-lg mx-auto">
              Não espere a data perfeita. O momento perfeito é agora.
            </p>
            <Link
              href="/criar"
              className="btn-shimmer inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-bold text-base shadow-lg shadow-[#ff2d78]/25 hover:shadow-[#ff2d78]/40 hover:scale-105 transition-transform duration-300"
            >
              Criar agora
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo.png" alt="Eternizar" className="h-10 opacity-70" />
          <p className="text-zinc-700 text-xs">
            © {new Date().getFullYear()} Eternizar. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}
