import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-8" />
      <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-[var(--muted-foreground)]">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button variant="outline">Back home</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="gradient">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
