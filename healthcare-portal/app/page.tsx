// app/page.tsx
'use client';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="homepage-saas relative min-h-screen overflow-hidden bg-background text-foreground">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&family=Onest:wght@400;500;600;700&display=swap');

        .homepage-saas {
          --saas-mint: #2dd4bf;
          --saas-sky: #7dd3fc;
          --saas-coral: #fb7185;
          --saas-ink: #0b1015;
          font-family: 'Onest', 'Avenir Next', 'Segoe UI', sans-serif;
        }

        .homepage-saas .display-font {
          font-family: 'Fraunces', 'Times New Roman', serif;
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.35),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-40 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.25),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-16 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,113,133,0.22),transparent_70%)] blur-3xl" />

      <header className="relative z-10 px-6 pb-16 pt-10 md:px-10 lg:px-16">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-default-500">
            <span className="h-2 w-2 rounded-full bg-[color:var(--saas-mint)]" />
            Careflow Cloud
          </div>
          <div className="hidden items-center gap-6 text-sm text-default-400 md:flex">
            <Link href="#features" className="transition hover:text-foreground">
              Features
            </Link>
            <Link href="#workflow" className="transition hover:text-foreground">
              Workflow
            </Link>
            <Link href="#security" className="transition hover:text-foreground">
              Security
            </Link>
            <Link href="#pricing" className="transition hover:text-foreground">
              Pricing
            </Link>
          </div>
          <Button
            as={Link}
            href="/login"
            variant="bordered"
            radius="full"
            className="border-default-400/60 text-foreground"
          >
            Log in
          </Button>
        </nav>

        <section className="mx-auto mt-16 grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-default-400">
              Modern healthcare operations
            </p>
            <h1 className="display-font text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              A SaaS command center for{' '}
              <span className="text-[color:var(--saas-mint)]">
                faster appointments
              </span>{' '}
              and calmer care days.
            </h1>
            <p className="text-base text-default-400 md:text-lg">
              Centralize scheduling, patient outreach, billing follow-up, and
              care team handoffs in one dashboard. The platform keeps every
              clinic in sync and every patient in the loop.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                as={Link}
                href="/signup"
                color="primary"
                size="lg"
                radius="full"
                className="bg-[color:var(--saas-mint)] text-[color:var(--saas-ink)]"
              >
                Sign up free
              </Button>
              <Button
                as={Link}
                href="/login"
                variant="bordered"
                size="lg"
                radius="full"
              >
                Existing user? Log in
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-default-400">
              <div>
                <p className="text-2xl font-semibold text-foreground">42%</p>
                <p>faster patient response times</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">18 hrs</p>
                <p>saved per clinic each week</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">4.9★</p>
                <p>patient satisfaction score</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="animate-[float-slow_8s_ease-in-out_infinite] rounded-[32px] border border-default-100/40 bg-content1/60 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-default-400">
                    Today at a glance
                  </p>
                  <h2 className="display-font mt-2 text-2xl font-semibold">
                    Care team pulse
                  </h2>
                </div>
                <span className="rounded-full bg-[color:var(--saas-mint)]/20 px-3 py-1 text-xs font-semibold text-[color:var(--saas-mint)]">
                  Live
                </span>
              </div>
              <div className="mt-6 grid gap-4">
                {[
                  {
                    label: 'Check-ins automated',
                    value: '128',
                    trend: '+12%',
                  },
                  {
                    label: 'Claims ready to send',
                    value: '42',
                    trend: '+8%',
                  },
                  {
                    label: 'Follow-ups due',
                    value: '16',
                    trend: '-4%',
                  },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-default-200/40 bg-background/70 px-4 py-3"
                    style={{
                      animation: 'fade-up 0.7s ease-out both',
                      animationDelay: `${index * 120}ms`,
                    }}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-default-400">
                        {item.label}
                      </p>
                      <p className="text-lg font-semibold">{item.value}</p>
                    </div>
                    <span className="text-xs font-semibold text-[color:var(--saas-mint)]">
                      {item.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 hidden rounded-3xl border border-default-200/40 bg-background/70 p-4 text-xs text-default-400 shadow-lg backdrop-blur md:block">
              HIPAA-ready • Audit trail • Role-based access
            </div>
          </div>
        </section>
      </header>

      <section
        id="features"
        className="relative z-10 mx-auto max-w-6xl px-6 pb-20 md:px-10 lg:px-16"
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-default-400">
              Platform highlights
            </p>
            <h2 className="display-font mt-3 text-3xl font-semibold md:text-4xl">
              Every service line, finally in sync.
            </h2>
          </div>
          <Button as={Link} href="/signup" variant="bordered" radius="full">
            See it in action
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Smart scheduling',
              description:
                'Auto-fill open slots, surface conflicts, and nudge patients with real-time text reminders.',
            },
            {
              title: 'Digital intake',
              description:
                'Collect histories, insurance cards, and consent forms before the visit begins.',
            },
            {
              title: 'Care team handoffs',
              description:
                'Route notes and tasks automatically so every handoff stays on track.',
            },
            {
              title: 'Revenue clarity',
              description:
                'Track claims, denials, and copays from one clean billing timeline.',
            },
            {
              title: 'Patient messaging',
              description:
                'Two-way SMS and secure chat keep patients moving through their care plan.',
            },
            {
              title: 'Performance analytics',
              description:
                'See utilization, capacity, and patient outcomes on a single executive dashboard.',
            },
          ].map((feature, index) => (
            <Card
              key={feature.title}
              className="border border-default-100/40 bg-content1/60 backdrop-blur"
              style={{
                animation: 'fade-up 0.7s ease-out both',
                animationDelay: `${index * 100}ms`,
              }}
            >
              <CardHeader className="flex flex-col items-start gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-default-400">
                  0{index + 1}
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </CardHeader>
              <CardBody className="text-sm text-default-400">
                {feature.description}
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="workflow"
        className="relative z-10 mx-auto max-w-6xl px-6 pb-20 md:px-10 lg:px-16"
      >
        <div className="grid gap-10 rounded-[32px] border border-default-100/40 bg-content1/60 p-10 backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-default-400">
              Workflow
            </p>
            <h2 className="display-font mt-3 text-3xl font-semibold md:text-4xl">
              A calmer day for every clinical team.
            </h2>
            <p className="mt-4 text-sm text-default-400 md:text-base">
              Assign work automatically, track SLA deadlines, and send proactive
              updates to patients without chasing spreadsheets.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              'One unified queue for scheduling, triage, and outreach.',
              'Care plans that auto-trigger reminders and follow-ups.',
              'Unified notes so everyone sees the full patient story.',
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-default-200/40 bg-background/70 px-4 py-3 text-sm text-default-300"
                style={{
                  animation: 'fade-up 0.7s ease-out both',
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <span className="h-2 w-2 rounded-full bg-[color:var(--saas-coral)]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="security"
        className="relative z-10 mx-auto max-w-6xl px-6 pb-20 md:px-10 lg:px-16"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'HIPAA-aligned',
              description:
                'Audit-ready logs, encrypted data, and secure session controls.',
            },
            {
              title: 'Role-based access',
              description:
                'Granular permissions keep clinicians focused and data protected.',
            },
            {
              title: 'Always-on monitoring',
              description:
                'Real-time alerts for anomalies, downtime, and workflow lag.',
            },
          ].map((item, index) => (
            <Card
              key={item.title}
              className="border border-default-100/40 bg-content1/60 backdrop-blur"
              style={{
                animation: 'fade-up 0.7s ease-out both',
                animationDelay: `${index * 120}ms`,
              }}
            >
              <CardHeader>
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </CardHeader>
              <CardBody className="text-sm text-default-400">
                {item.description}
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="pricing"
        className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10 lg:px-16"
      >
        <div className="rounded-[32px] border border-default-100/40 bg-content1/60 p-10 text-center backdrop-blur">
          <p className="text-xs uppercase tracking-[0.4em] text-default-400">
            Get started
          </p>
          <h2 className="display-font mt-3 text-3xl font-semibold md:text-4xl">
            Launch your clinic workspace in days.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-default-400 md:text-base">
            Transparent, per-clinic pricing with unlimited team seats. Start
            free and scale as your organization grows.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button
              as={Link}
              href="/signup"
              color="primary"
              size="lg"
              radius="full"
              className="bg-[color:var(--saas-mint)] text-[color:var(--saas-ink)]"
            >
              Create your account
            </Button>
            <Button as={Link} href="/login" variant="bordered" radius="full">
              Log in
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
