export interface UploadedArtifact {
  url: string;
  pathname: string;
}

export async function uploadArtifact(filename: string, content: Buffer, contentType: string) {
  const { put } = await import("@vercel/blob");
  const blob = await put(filename, content, {
    access: "public",
    addRandomSuffix: false,
    contentType
  });

  return {
    url: blob.url,
    pathname: blob.pathname
  };
}
