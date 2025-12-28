// app/page.tsx
"use client";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <section className="max-w-3xl w-full space-y-10 text-center">
        <div className="space-y-4">
          <p className="text-sm tracking-wide text-primary font-semibold uppercase">
            Health Portal
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold">
            One portal for{" "}
            <span className="text-primary">doctors and patients</span>.
          </h1>
          <p className="text-default-500 text-base md:text-lg">
            Manage appointments, records, and communication in a single place.
            Built with Next.js, TypeScript, Tailwind, and HeroUI.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            as={Link}
            href="/login?next=/doctor"
            color="primary"
            size="lg"
            radius="full"
          >
            I&apos;m a Doctor
          </Button>

          <Button
            as={Link}
            href="/login?next=/patient"
            variant="bordered"
            size="lg"
            radius="full"
          >
            I&apos;m a Patient
          </Button>
        </div>

        <Card className="mt-6 border border-default-100 bg-content1/60 backdrop-blur">
          <CardHeader className="flex flex-col items-start gap-2 text-left">
            <h2 className="text-lg font-semibold">What you get</h2>
            <p className="text-sm text-default-500">
              This is just sample data – you can wire it up to your real API
              later.
            </p>
          </CardHeader>
          <CardBody className="grid gap-4 md:grid-cols-3 text-left">
            <Feature
              title="Appointments"
              description="See upcoming visits and manage schedule conflicts."
            />
            <Feature
              title="Records"
              description="View key vitals and recent test results at a glance."
            />
            <Feature
              title="Messaging"
              description="Secure communication between doctors and patients."
            />
          </CardBody>
        </Card>
      </section>
    </main>
  );
}

type FeatureProps = {
  title: string;
  description: string;
};

function Feature({ title, description }: FeatureProps) {
  return (
    <div className="space-y-1">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-default-500">{description}</p>
    </div>
  );
}
