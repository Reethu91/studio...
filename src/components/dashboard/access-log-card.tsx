"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AccessLogEntry } from "./main-dashboard";
import { format } from "date-fns";
import { History } from "lucide-react";

type AccessLogCardProps = {
  log: AccessLogEntry[];
};

export default function AccessLogCard({ log }: AccessLogCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <History className="size-6 text-primary" />
          <div>
            <CardTitle>Access Log</CardTitle>
            <CardDescription>
              History of attempts to access encrypted content.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Required Emotion</TableHead>
                <TableHead>Attempted Emotion</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {log.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No access attempts yet.
                  </TableCell>
                </TableRow>
              )}
              {log.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {format(entry.timestamp, "PPP p")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{entry.required}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.attempted}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        entry.status === "Success" ? "default" : "destructive"
                      }
                      className={entry.status === "Success" ? "bg-accent text-accent-foreground" : ""}
                    >
                      {entry.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
