// app/patient/page.tsx
"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardNavbar } from "@/components/navigation/DashboardNavbar";
import { useAuth } from "@/lib/auth/auth-context";

export default function PatientDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <ProtectedRoute allowRoles={["patient"]} unauthenticatedRedirect="/">
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardNavbar
          title="Patient Portal"
          onLogout={handleLogout}
          avatarLabel={user?.name || "Patient"}
          userName={user?.name || "Patient"}
          links={[
             { href: "/", label: "Home" },
             { href: "/patient", label: "Dashboard" },
             { href: "/patient/profile", label: "Profile" },
        ]}

        />

        <main className="flex-1 px-6 py-6 md:px-10 md:py-8 space-y-6">
          <section className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
            {/* Next appointment */}
            <Card>
              <CardHeader className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Your next appointment</h2>
                  <p className="text-sm text-default-500">
                    Stay on top of your upcoming visit.
                  </p>
                </div>
                <Chip color="primary" variant="flat">
                  In 2 days
                </Chip>
              </CardHeader>
              <CardBody className="space-y-3">
                <p className="text-sm text-default-500">
                  With <span className="font-medium text-foreground">Dr. Lee</span>{" "}
                  (Family Medicine)
                </p>
                <div className="grid gap-3 sm:grid-cols-3 text-sm">
                  <InfoItem label="Date" value="Tue, Jan 21 - 09:30" />
                  <InfoItem label="Location" value="Clinic A - Room 204" />
                  <InfoItem label="Reason" value="Routine checkup" />
                </div>
                <div className="flex gap-3 flex-wrap mt-2">
                  <Button color="primary" radius="full" size="sm">
                    Check-in online
                  </Button>
                  <Button variant="bordered" radius="full" size="sm">
                    Reschedule
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Quick actions</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <QuickAction
                  title="Book a new appointment"
                  description="Find a time that works best for you."
                />
                <QuickAction
                  title="View lab results"
                  description="See your latest tests and reports."
                />
                <QuickAction
                  title="Message your doctor"
                  description="Ask a question or follow up on your visit."
                />
              </CardBody>
            </Card>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem(props: InfoItemProps) {
  const { label, value } = props;
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-default-500">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

type QuickActionProps = {
  title: string;
  description: string;
};

function QuickAction(props: QuickActionProps) {
  const { title, description } = props;
  return (
    <button className="w-full rounded-xl border border-default-100 bg-content1/70 px-3 py-3 text-left transition hover:border-primary hover:bg-primary/5">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-default-500 mt-1">{description}</p>
    </button>
  );
}
