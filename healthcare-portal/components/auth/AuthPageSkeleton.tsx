import { Card, CardBody, CardHeader } from "@heroui/card";

export default function AuthPageSkeleton() {
  return (
    <div className="theme-public flex min-h-screen items-center justify-center bg-gradient-to-b from-background/80 to-background px-4 py-10">
      <Card className="w-full max-w-md border border-default-100 bg-content1/80 backdrop-blur">
        <CardHeader className="flex flex-col items-start gap-2">
          <div className="h-3 w-28 rounded-full bg-default-200" />
          <div>
            <div className="h-6 w-56 rounded-full bg-default-200" />
            <div className="mt-2 h-3 w-64 rounded-full bg-default-200" />
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="h-10 w-full rounded-medium bg-default-200" />
            <div className="h-10 w-full rounded-medium bg-default-200" />
            <div className="h-10 w-full rounded-medium bg-default-200" />
            <div className="h-4 w-32 rounded-full bg-default-200" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
