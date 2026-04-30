import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ACCESS_KEY, SECRET_KEY, BUCKET, REGION } from "../env";

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    },
});

// export const S3_BASE_URL = `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;
export const S3_BASE_URL = `http://cozzy.corner.s3.ap-south-1.amazonaws.com/`;

export function getImageUrl(path: string | null | undefined): string {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${S3_BASE_URL}${path}`;
}

export async function uploadToS3(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename using crypto randomUUID
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `t20/${crypto.randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
    });

    await s3Client.send(command);

    // Return the relative path
    return fileName;
}
