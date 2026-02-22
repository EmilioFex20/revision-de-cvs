"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import ViewCvButton from "@/components/ViewCvButton";

type Student = {
  student_id: string;
  name: string;
  major_last: string;
  semester: string;
  cv_s3_key: string;
};

type Grouped = Record<string, Record<string, Student[]>>;

function norm(s: string) {
  return (s ?? "").toLowerCase().trim();
}

export default function MajorsTree({ grouped }: { grouped: Grouped }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return grouped;

    const out: Grouped = {};

    for (const [major, semesters] of Object.entries(grouped)) {
      for (const [semester, students] of Object.entries(semesters)) {
        const matches = students.filter((s) => {
          const haystack = [s.name, s.student_id].map(norm).join(" ");

          return haystack.includes(q);
        });

        if (matches.length > 0) {
          out[major] ??= {};
          out[major][semester] = matches;
        }
      }
    }

    return out;
  }, [grouped, query]);

  const majors = useMemo(
    () => Object.keys(filtered).sort((a, b) => a.localeCompare(b)),
    [filtered],
  );

  const hasAnyResults = majors.length > 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col gap-2">
        <Input
          className="border-black"
          placeholder="Search student name or ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          variant="secondary"
          className="border border-black"
          onClick={() => setQuery("")}
          disabled={!query}
        >
          Clear Filters
        </Button>
        {query && (
          <div className="text-xs text-muted-foreground">
            Showing results for: <span className="font-medium">{query}</span>
          </div>
        )}
      </div>

      {!hasAnyResults ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No results found.
          </CardContent>
        </Card>
      ) : (
        majors.map((major) => {
          const semesters = Object.keys(filtered[major]).sort((a, b) =>
            a.localeCompare(b),
          );

          // total students across semesters (after filtering)
          const total = semesters.reduce(
            (acc, sem) => acc + filtered[major][sem].length,
            0,
          );

          return (
            <Card key={major} className="w-full outline outline-1">
              <CardContent className="p-3 py-0">
                <Collapsible
                  className="data-[state=open]:bg-muted rounded-md"
                  defaultOpen={Boolean(query)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="group w-full justify-start flex-col mb-8 md:flex-row md:mb-0"
                    >
                      <span className="font-semibold">{major}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({semesters.length} semesters, {total} students)
                      </span>
                      <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-3 p-2.5 pt-0 outline outline-1 rounded-md">
                    {semesters.map((semester) => {
                      const students = filtered[major][semester];

                      return (
                        <div
                          key={`${major}::${semester}`}
                          className="bg-background"
                        >
                          <Collapsible
                            className="data-[state=open]:bg-muted/50 rounded-md"
                            defaultOpen={Boolean(query)} // open when searching
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="group w-full justify-start border-b-1 border-black rounded-none"
                              >
                                <span className="font-medium">
                                  Semester: {semester}
                                </span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({students.length} students)
                                </span>
                                <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
                              </Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="p-5 pt-0">
                              <ul className="space-y-2">
                                {students.map((s) => (
                                  <li
                                    key={s.student_id}
                                    className="flex items-center justify-between gap-3 border-b-1 border-black bg-background p-3"
                                  >
                                    <div className="min-w-0">
                                      <div className="truncate font-medium">
                                        {s.name || "(No name)"}
                                      </div>
                                      <div className="truncate text-xs text-muted-foreground">
                                        {s.student_id}
                                      </div>
                                    </div>

                                    <ViewCvButton studentId={s.student_id} />
                                  </li>
                                ))}
                              </ul>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
