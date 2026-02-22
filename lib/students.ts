import "server-only";
import { ddb } from "./aws";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const TABLE = process.env.DDB_TABLE!;

export type Student = {
  student_id: string;
  name: string;
  major_last: string;
  semester: string;
  cv_s3_key: string;
};

export async function listStudents(): Promise<Student[]> {
  const out: Student[] = [];
  let ExclusiveStartKey: any | undefined = undefined;

  do {
    const res = await ddb.send(
      new ScanCommand({
        TableName: TABLE,
        ExclusiveStartKey,
        ProjectionExpression: "student_id, #n, major_last, semester, cv_s3_key",
        ExpressionAttributeNames: { "#n": "name" },
      }),
    );

    const items = (res.Items ?? []).map((it) => unmarshall(it) as any);
    for (const it of items) {
      // basic safety checks
      if (it.student_id && it.major_last && it.semester && it.cv_s3_key) {
        out.push({
          student_id: it.student_id,
          name: it.name ?? "",
          major_last: it.major_last,
          semester: String(it.semester),
          cv_s3_key: it.cv_s3_key,
        });
      }
    }

    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return out;
}

export function groupStudents(students: Student[]) {
  const grouped: Record<string, Record<string, Student[]>> = {};

  for (const s of students) {
    const major = s.major_last || "Unknown";
    const semester = s.semester || "Unknown";

    grouped[major] ??= {};
    grouped[major][semester] ??= [];
    grouped[major][semester].push(s);
  }

  for (const major of Object.keys(grouped)) {
    for (const sem of Object.keys(grouped[major])) {
      grouped[major][sem].sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return grouped;
}
