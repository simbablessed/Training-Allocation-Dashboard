import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID || "289bbe079a36a28babdb693fe8d288d0";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "f610af9e877ab51daa6534487c326215";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "ae0ff70dca31525b7289c0c6e0dc7b3b2cd6e4ddc8b6ea3e9b67dba6b51399d4";
const bucketName = process.env.R2_BUCKET_NAME || "docflow";
const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
const publicUrlBase = process.env.R2_PUBLIC_URL || "https://pub-d67807aaa37145a192f11b648bf83316.r2.dev";

let s3Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
}

export async function uploadToR2(params: {
  key: string;
  data: Buffer | Uint8Array | string;
  contentType: string;
}): Promise<{ url: string; key: string }> {
  const client = getR2Client();
  const body = typeof params.data === "string" ? Buffer.from(params.data, "utf-8") : params.data;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: params.key,
      Body: body,
      ContentType: params.contentType,
    })
  );

  const publicUrl = `${publicUrlBase}/${params.key}`;
  return { url: publicUrl, key: params.key };
}

export async function deleteFromR2(key: string): Promise<boolean> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
  return true;
}

export async function listR2Files(prefix: string = "educator-connect/") {
  const client = getR2Client();
  const res = await client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: 50,
    })
  );
  return (res.Contents || []).map((item) => ({
    key: item.Key || "",
    size: item.Size || 0,
    lastModified: item.LastModified?.toISOString() || "",
    url: `${publicUrlBase}/${item.Key}`,
  }));
}
