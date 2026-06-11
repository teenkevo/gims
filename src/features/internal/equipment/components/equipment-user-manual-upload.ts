export async function appendUserManualUploads(
  formData: FormData,
  files: File[]
) {
  if (files.length === 0) return true;

  const uploadFormData = new FormData();
  files.forEach((file) => uploadFormData.append("files", file));

  const response = await fetch("/api/upload", {
    method: "POST",
    body: uploadFormData,
  });

  if (!response.ok) return false;

  const result = await response.json();
  result?.files?.forEach(
    (file: { fileId: string; fileName: string }) => {
      formData.append("userManuals", file.fileId);
      formData.append("userManualNames", file.fileName);
    }
  );

  return true;
}
