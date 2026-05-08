import { motion, AnimatePresence } from 'motion/react';
import { AppLogo } from './AppLogo';

interface SplashScreenProps {
  isVisible: boolean;
}

const floatingCards = [
  {
    title: 'Data Warga',
    value: '271',
    detail: 'Sinkronisasi progresif',
    className:
      'left-[8%] top-[16%] w-40 -rotate-12 bg-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl',
  },
  {
    title: 'Akurasi',
    value: '95%',
    detail: 'Prioritas lebih presisi',
    className:
      'right-[9%] top-[18%] w-44 rotate-12 bg-[#fff5d6]/75 text-[#1f2a44] shadow-[0_28px_70px_rgba(249,201,74,0.35)]',
  },
  {
    title: 'Verifikasi',
    value: 'AHP',
    detail: 'Tahap seleksi terstruktur',
    className:
      'bottom-[18%] left-[12%] w-44 rotate-6 bg-[#dff3ff]/80 text-[#103250] shadow-[0_28px_70px_rgba(80,160,220,0.28)]',
  },
  {
    title: 'BLT-DD',
    value: '2026',
    detail: 'Layanan desa digital',
    className:
      'bottom-[14%] right-[10%] w-40 -rotate-6 bg-white/12 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl',
  },
];

export function SplashScreen({ isVisible }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[10000] overflow-hidden bg-[#081421]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(109,201,255,0.36),_transparent_34%),radial-gradient(circle_at_20%_80%,_rgba(39,102,255,0.24),_transparent_28%),linear-gradient(135deg,_#091521_0%,_#10263c_38%,_#173f66_100%)]" />
          <div className="splash-grid absolute inset-0 opacity-35" />
          <div className="splash-orb splash-orb-a" />
          <div className="splash-orb splash-orb-b" />
          <div className="splash-orb splash-orb-c" />

          <div className="absolute inset-0 perspective-[1800px]">
            {floatingCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40, rotateX: -24, scale: 0.88 }}
                animate={{
                  opacity: 1,
                  y: [0, -14, 0],
                  rotateX: [0, 8, 0],
                  rotateY: [0, index % 2 === 0 ? -10 : 10, 0],
                  scale: 1,
                }}
                transition={{
                  duration: 4.8 + index * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.1,
                }}
                className={`absolute rounded-[1.75rem] border border-white/15 p-5 text-white ${card.className}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <p className="text-[0.7rem] uppercase tracking-[0.32em] text-white/65">
                  {card.title}
                </p>
                <p className="mt-3 text-3xl font-black tracking-tight">{card.value}</p>
                <p className="mt-2 text-sm text-white/70">{card.detail}</p>
              </motion.div>
            ))}
          </div>

          <div className="relative flex h-full items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.84, rotateX: -20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="splash-hero relative w-full max-w-4xl"
            >
              <div className="absolute inset-[-16%] rounded-full bg-[radial-gradient(circle,_rgba(139,227,255,0.32),_transparent_58%)] blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/14 bg-white/10 px-6 py-10 text-white shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:px-10">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  className="mx-auto max-w-3xl text-center"
                >
                  <div className="mb-6 flex justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.75, rotateY: -25 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ delay: 0.12, duration: 0.7 }}
                    >
                      <AppLogo
                        size="xl"
                        className="shadow-[0_28px_70px_rgba(80,160,220,0.42)]"
                      />
                    </motion.div>
                  </div>
                  <p
                    className="text-[1.3rem] uppercase tracking-[0.45em] text-[#c7ecff]"
                    style={{ fontFamily: '"Segoe UI", "Trebuchet MS", sans-serif' }}
                  >
                    Bantuan Langsung Tunai Dana Desa
                  </p>
                  <h1
                    className="mt-5 text-2xl font-black leading-none text-white sm:text-5xl"
                    style={{ fontFamily: '"Arial Black", "Segoe UI", sans-serif' }}
                  >
                    Sistem Seleksi
                    <span className="block bg-gradient-to-r from-[#f8feff] via-[#8ae0ff] to-[#ffe28b] bg-clip-text text-transparent">
                      Bantuan Tunai Desa
                    </span>
                  </h1>
                  <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#d8ebff] sm:text-base">
                    Sistem digital untuk membantu proses seleksi penerima BLT-DD secara lebih akurat dan efisien.
                  </p>
                </motion.div>

                <div className="mt-10 flex flex-col items-center gap-5">
                  <div className="relative h-3 w-full max-w-md overflow-hidden rounded-full bg-white/12">
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: ['-100%', '18%', '100%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-y-0 w-2/3 rounded-full bg-gradient-to-r from-transparent via-[#9ce8ff] to-[#fff0a8] blur-[1px]"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-[#d5f4ff]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#9ce8ff] shadow-[0_0_18px_rgba(156,232,255,0.95)]" />
                    <span>Menyiapkan ruang kerja digital desa</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
