import { useEffect, type ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box, Typography, Grid, Paper, Container, Chip, IconButton, GlobalStyles,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CodeIcon from '@mui/icons-material/Code';
import WebIcon from '@mui/icons-material/Web';
import StorageIcon from '@mui/icons-material/Storage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, type Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GRADIENT, GRADIENT_DARK } from '../config/constants';
import { useTranslation } from '../lib/i18n';
import { DatabaseDiagram } from '../components/DatabaseDiagram';

const globalStyles = (
  <GlobalStyles styles={{
    '@keyframes techFloat': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-8px)' },
    },
    '@keyframes techGlow': {
      '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.15)' },
      '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.3)' },
    },
    '@keyframes techShimmer': {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    '@keyframes techPulse': {
      '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
      '50%': { opacity: 1, transform: 'scale(1.05)' },
    },
    '@keyframes techSpinSlow': {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    '@keyframes techBorderFlow': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
  }} />
);

/* ── Framer-Motion Wrappers ── */

function FadeInUp({ children, delay = 0, duration = 0.7 }: { children: ReactNode; delay?: number; duration?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ScrollReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.12, triggerOnce: true });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  const variants: Variants = {
    hidden: { opacity: 0, y: 60, scale: 0.97 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={variants}>
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const chipPop: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 16 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.5, delay: 0.6 + i * 0.035, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── Main Component ── */

export function TechnologiesPage() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  const categories = [
    {
      title: t('backend'),
      icon: <CodeIcon />,
      color: '#4f46e5',
      dark: '#818cf8',
      items: [
        { name: 'C#', desc: t('techCSharp') },
        { name: '.NET 10', desc: t('techDotNet') },
        { name: 'ASP.NET Web API', desc: t('techAspWebApi') },
        { name: 'Entity Framework', desc: t('techEf') },
        { name: 'ASP.NET Identity', desc: t('techIdentity') },
        { name: 'MediatR', desc: t('techMediatR') },
        { name: 'FluentValidation', desc: t('techFluentValidation') },
        { name: 'Hangfire', desc: t('techHangfire') },
        { name: 'SignalR', desc: t('techSignalR') },
        { name: 'SMTP Server', desc: t('techSmtp') },
        { name: 'Serilog', desc: t('techSerilog') },
        { name: 'SePay', desc: t('techSepay') },
      ],
    },
    {
      title: t('frontend'),
      icon: <WebIcon />,
      color: '#7c3aed',
      dark: '#c4b5fd',
      items: [
        { name: 'React 19', desc: t('techReact') },
        { name: 'TypeScript', desc: t('techTypeScript') },
        { name: 'Vite', desc: t('techVite') },
        { name: 'Redux Toolkit', desc: t('techRedux') },
        { name: 'RTK Query', desc: t('techRtkQuery') },
        { name: 'React Router', desc: t('techReactRouter') },
        { name: 'Material UI', desc: t('techMui') },
        { name: 'React Hook Form', desc: t('techReactHookForm') },
        { name: 'Zod', desc: t('techZod') },
      ],
    },
    {
      title: t('databases'),
      icon: <StorageIcon />,
      color: '#0284c7',
      dark: '#38bdf8',
      items: [
        { name: 'SQL Server', desc: t('techSqlServer') },
        { name: 'Redis', desc: t('techRedis') },
        { name: 'Elasticsearch & Kibana', desc: t('techElasticsearch') },
      ],
    },
    {
      title: t('architecture'),
      icon: <AccountTreeIcon />,
      color: '#16a34a',
      dark: '#4ade80',
      items: [
        { name: 'Clean Architecture', desc: t('techCleanArch') },
        { name: 'CQRS', desc: t('techCqrs') },
        { name: 'Repository Pattern', desc: t('techRepoPattern') },
        { name: 'Unit of Work', desc: t('techUowPattern') },
        { name: 'Result Pattern', desc: t('techResultPattern') },
        { name: 'Options Pattern', desc: t('techOptionsPattern') },
        { name: 'Dependency Injection', desc: t('techDi') },
      ],
    },
    {
      title: t('versionControl'),
      icon: <CloudUploadIcon />,
      color: '#d97706',
      dark: '#fbbf24',
      items: [
        { name: 'Git', desc: t('techGit') },
        { name: 'GitHub', desc: t('techGithub') },
        { name: 'Docker', desc: t('techDocker') },
        { name: 'SmarterASP.NET', desc: t('techSmarterAsp') },
      ],
    },
  ];

  const allTechNames = categories.flatMap((c) => c.items.map((i) => i.name));

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {globalStyles}

      {/* ── Hero Section ── */}
      <Box
        sx={(t) => ({
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 11 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: t.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)'
            : 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 50%, #faf5ff 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: t.palette.mode === 'dark'
              ? 'radial-gradient(circle at 20% 50%, rgba(96,165,250,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(129,140,248,0.1) 0%, transparent 60%)'
              : 'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(79,70,229,0.05) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: t.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)',
            animation: 'techPulse 5s ease-in-out infinite',
            pointerEvents: 'none',
          },
        })}
      >
        {/* Floating decorative orbs */}
        <Box
          sx={{
            position: 'absolute', top: '20%', left: '8%',
            width: 80, height: 80, borderRadius: '50%',
            background: mode === 'dark'
              ? 'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            animation: 'techFloat 6s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute', bottom: '15%', right: '10%',
            width: 120, height: 120, borderRadius: '50%',
            background: mode === 'dark'
              ? 'radial-gradient(circle, rgba(196,181,253,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
            animation: 'techFloat 8s ease-in-out infinite 2s',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <FadeInUp delay={0}>
            <IconButton
              onClick={() => navigate('/about')}
              sx={{
                position: 'absolute',
                left: { xs: -8, md: -16 },
                top: { xs: -8, md: -8 },
                color: mode === 'dark' ? 'rgba(165,180,252,0.7)' : 'text.secondary',
                backdropFilter: 'blur(8px)',
                background: mode === 'dark' ? 'rgba(99,102,241,0.08)' : 'rgba(79,70,229,0.04)',
                '&:hover': {
                  color: '#6366f1',
                  background: mode === 'dark' ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.08)',
                  transform: 'translateX(-4px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </FadeInUp>

          <FadeInUp delay={0.15}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3.5rem' },
                letterSpacing: '-0.5px',
                background: mode === 'dark' ? GRADIENT_DARK : GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              {t('techTitle')}
            </Typography>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                color: mode === 'dark' ? 'rgba(203,213,225,0.7)' : '#475569',
                maxWidth: 560,
                mx: 'auto',
                lineHeight: 1.8,
                mb: 5,
              }}
            >
              {t('techSubtitle')}
            </Typography>
          </FadeInUp>

          {/* Animated floating tech chips */}
          <Box
            component={motion.div}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, maxWidth: 650, mx: 'auto' }}
          >
            {allTechNames.map((name, i) => (
              <Box key={name} component={motion.div} custom={i} variants={chipPop}>
                <Chip
                  label={name}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    background: mode === 'dark' ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.07)',
                    color: mode === 'dark' ? '#a5b4fc' : '#4f46e5',
                    border: `1px solid ${mode === 'dark' ? 'rgba(99,102,241,0.25)' : 'rgba(79,70,229,0.15)'}`,
                    height: 28,
                    cursor: 'default',
                    '&:hover': {
                      transform: 'translateY(-3px) scale(1.1)',
                      background: mode === 'dark' ? 'rgba(99,102,241,0.22)' : 'rgba(79,70,229,0.14)',
                      boxShadow: mode === 'dark'
                        ? '0 6px 24px rgba(99,102,241,0.25)'
                        : '0 6px 24px rgba(79,70,229,0.18)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Categories Section ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {categories.map((cat, catIndex) => (
            <ScrollReveal key={cat.title} delay={catIndex * 0.08}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: cat.color,
                    boxShadow: mode === 'dark'
                      ? `0 12px 48px ${cat.color}18, 0 0 0 1px ${cat.color}10`
                      : `0 12px 48px ${cat.color}14, 0 0 0 1px ${cat.color}08`,
                    transform: 'translateY(-2px)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, transparent, ${cat.color}40, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    '&:hover': { opacity: 1 },
                  },
                }}
              >
                {/* Category Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: mode === 'dark'
                        ? `linear-gradient(135deg, ${cat.color}20, ${cat.color}08)`
                        : `linear-gradient(135deg, ${cat.color}15, ${cat.color}06)`,
                      color: mode === 'dark' ? cat.dark : cat.color,
                      '& svg': { fontSize: 26 },
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'rotate(-8deg) scale(1.1)' },
                    }}
                  >
                    {cat.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                      }}
                    >
                      {cat.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: mode === 'dark' ? 'rgba(203,213,225,0.6)' : '#64748b',
                        fontWeight: 500,
                      }}
                    >
                      {cat.items.length} technologies
                    </Typography>
                  </Box>
                </Box>

                {/* Tech Items Grid */}
                <Grid container spacing={2}>
                  {cat.items.map((item) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.name}>
                      <Box
                        sx={{
                          p: 2.2,
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'default',
                          '&:hover': {
                            borderColor: mode === 'dark' ? `${cat.dark}50` : `${cat.color}40`,
                            background: mode === 'dark'
                              ? `linear-gradient(135deg, ${cat.color}10, ${cat.color}04)`
                              : `linear-gradient(135deg, ${cat.color}08, ${cat.color}02)`,
                            transform: 'translateY(-3px)',
                            boxShadow: mode === 'dark'
                              ? `0 8px 28px ${cat.color}15`
                              : `0 8px 28px ${cat.color}12`,
                          },
                        }}
                      >
                        <Chip
                          label={item.name}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            background: mode === 'dark'
                              ? `linear-gradient(135deg, ${cat.dark}18, ${cat.color}10)`
                              : `linear-gradient(135deg, ${cat.color}14, ${cat.color}08)`,
                            color: mode === 'dark' ? cat.dark : cat.color,
                            border: `1px solid ${mode === 'dark' ? `${cat.dark}30` : `${cat.color}25`}`,
                            borderRadius: '8px',
                            height: 28,
                            mb: 1.2,
                            '& .MuiChip-label': { px: 1.2 },
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: mode === 'dark'
                                ? `linear-gradient(135deg, ${cat.dark}28, ${cat.color}18)`
                                : `linear-gradient(135deg, ${cat.color}22, ${cat.color}12)`,
                              boxShadow: `0 0 16px ${cat.color}25`,
                              transform: 'scale(1.05)',
                            },
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            lineHeight: 1.6,
                            fontSize: '0.82rem',
                            color: mode === 'dark' ? 'rgba(203,213,225,0.8)' : '#475569',
                          }}
                        >
                          {item.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </ScrollReveal>
          ))}
        </Box>
      </Container>

      {/* ── Database Diagram Section ── */}
      <ScrollReveal>
        <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 7 } }}>
          <Paper
            elevation={0}
            sx={(t) => ({
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'hidden',
              background: t.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: t.palette.mode === 'dark'
                  ? 'radial-gradient(circle at 20% 30%, rgba(96,165,250,0.06) 0%, transparent 50%)'
                  : 'radial-gradient(circle at 20% 30%, rgba(37,99,235,0.04) 0%, transparent 50%)',
                pointerEvents: 'none',
              },
            })}
          >
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box
                  sx={{
                    width: 44, height: 44, borderRadius: 2.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: mode === 'dark' ? 'rgba(14,165,233,0.12)' : 'rgba(2,132,199,0.08)',
                    color: mode === 'dark' ? '#38bdf8' : '#0284c7',
                  }}
                >
                  <StorageIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{
                    fontWeight: 700,
                    background: mode === 'dark' ? GRADIENT_DARK : GRADIENT,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {t('dbDiagramTitle')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: mode === 'dark' ? 'rgba(203,213,225,0.6)' : '#64748b' }}>
                    {t('dbDiagramSubtitle')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <DatabaseDiagram />
              </Box>
            </Box>
          </Paper>
        </Container>
      </ScrollReveal>

      {/* ── Bottom CTA ── */}
      <ScrollReveal>
        <Container maxWidth="md" sx={{ pb: { xs: 8, md: 10 } }}>
          <Box
            sx={(t) => ({
              textAlign: 'center',
              py: { xs: 6, md: 8 },
              px: { xs: 3, md: 5 },
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: t.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.4s ease',
              '&:hover': {
                boxShadow: t.palette.mode === 'dark'
                  ? '0 16px 48px rgba(99,102,241,0.12)'
                  : '0 16px 48px rgba(79,70,229,0.1)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: t.palette.mode === 'dark'
                  ? 'radial-gradient(circle at 50% 0%, rgba(96,165,250,0.08) 0%, transparent 60%)'
                  : 'radial-gradient(circle at 50% 0%, rgba(37,99,235,0.05) 0%, transparent 60%)',
                pointerEvents: 'none',
              },
            })}
          >
            <Box sx={{ position: 'relative' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: mode === 'dark' ? GRADIENT_DARK : GRADIENT,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                {t('techBuiltWith')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  maxWidth: 450,
                  mx: 'auto',
                  color: mode === 'dark' ? 'rgba(203,213,225,0.7)' : '#475569',
                  lineHeight: 1.7,
                }}
              >
                {t('techBuiltWithDesc')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={t('backToAbout')}
                  clickable
                  onClick={() => navigate('/about')}
                  sx={{
                    fontWeight: 600,
                    height: 40,
                    px: 1,
                    background: mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))'
                      : 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.06))',
                    color: mode === 'dark' ? '#a5b4fc' : '#4f46e5',
                    border: `1px solid ${mode === 'dark' ? 'rgba(99,102,241,0.35)' : 'rgba(79,70,229,0.25)'}`,
                    '&:hover': {
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.18))'
                        : 'linear-gradient(135deg, rgba(79,70,229,0.18), rgba(124,58,237,0.1))',
                      transform: 'translateY(-3px)',
                      boxShadow: mode === 'dark'
                        ? '0 8px 28px rgba(99,102,241,0.25)'
                        : '0 8px 28px rgba(79,70,229,0.2)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                <Chip
                  label={t('viewProducts')}
                  clickable
                  onClick={() => navigate('/products')}
                  sx={{
                    fontWeight: 600,
                    height: 40,
                    px: 1,
                    background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    color: mode === 'dark' ? '#e2e8f0' : '#334155',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    '&:hover': {
                      background: mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
                      transform: 'translateY(-3px)',
                      boxShadow: mode === 'dark'
                        ? '0 8px 28px rgba(255,255,255,0.06)'
                        : '0 8px 28px rgba(0,0,0,0.06)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </ScrollReveal>
    </Box>
  );
}
