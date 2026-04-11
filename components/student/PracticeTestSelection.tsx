"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { getUnitConfig } from "@/lib/practice-tests/question-banks";

export function PracticeTestSelection() {
  const units = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl mb-2">
              Practice Tests
            </h1>
            <p className="text-muted-foreground">
              Select a unit to test your knowledge.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {units.map((unitNumber) => {
              const unitConfig = getUnitConfig(unitNumber);
              return (
                <Link href={`/student/study/practice-tests/${unitNumber}`} key={unitNumber} className="block">
                  <Card className="border-primary/20 bg-background hover:border-primary/40 transition-colors h-full">
                    <CardHeader className="pb-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                      <CardTitle className="text-lg">Unit {unitNumber}</CardTitle>
                    </CardHeader>
                    <CardDescription>
                      {unitConfig?.messaging.calloutDescription || "Test your knowledge"}
                    </CardDescription>
                    <CardContent className="pt-4">
                      <Button className="w-full">
                        {unitConfig?.messaging.calloutCta || "Start Practice Test"}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="flex justify-start">
            <Button variant="secondary" asChild>
              <Link href="/student/study">Back to Study Hub</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
