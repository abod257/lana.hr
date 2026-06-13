"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="bg-muted p-3 rounded-lg text-left mb-6">
              <p className="text-xs font-mono text-destructive break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
