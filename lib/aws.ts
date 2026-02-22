import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromIni } from "@aws-sdk/credential-providers";

const PROFILE = process.env.AWS_PROFILE!;
const REGION = process.env.AWS_REGION!;

export const s3 = new S3Client({
  region: REGION,
  credentials: fromIni({ profile: PROFILE }),
});

export const ddb = new DynamoDBClient({
  region: REGION,
  credentials: fromIni({ profile: PROFILE }),
});
