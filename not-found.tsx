import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">404</h1>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/dashboard">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
