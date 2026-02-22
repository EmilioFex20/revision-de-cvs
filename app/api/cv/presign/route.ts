import { NextResponse } from "next/server";
import { ddb, s3 } from "@/lib/aws";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const TABLE = process.env.DDB_TABLE!;
const BUCKET = process.env.CV_BUCKET!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const student_id = searchParams.get("student_id");
  if (!student_id) {
    return NextResponse.json({ error: "Missing student_id" }, { status: 400 });
  }

  const res = await ddb.send(
    new GetItemCommand({
      TableName: TABLE,
      Key: { student_id: { S: student_id } },
      ProjectionExpression: "cv_s3_key",
    }),
  );

  if (!res.Item) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const item = unmarshall(res.Item) as any;
  const key = item.cv_s3_key as string | undefined;

  if (!key) {
    return NextResponse.json({ error: "CV key missing" }, { status: 500 });
  }

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 60 * 5 },
  );

  return NextResponse.json({ url });
}
