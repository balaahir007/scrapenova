"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex items-center justify-center h-screen">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Critical Error</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                {error.message || "A critical error occurred"}
              </p>
              <Button onClick={() => reset()}>Try again</Button>
            </AlertDescription>
          </Alert>
        </div>
      </body>
    </html>
  );
}
