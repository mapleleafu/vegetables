import { supabase } from "./supabaseClient";

export type UploadType = "images" | "audios";
export type ImageType = "words" | "avatars";

const generateUniqueFileName = (path: string, file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${path}-${Date.now()}.${fileExt}`;
  return fileName;
}

export async function uploadFile(file: File, path: string, uploadType: UploadType, imageType?: ImageType): Promise<string> {
  const fileName = generateUniqueFileName(path, file);
  const uploadPath = imageType ? `${uploadType}/${imageType}` : uploadType;
  const filePath = `${uploadPath}/${fileName}`;

  const { error } = await supabase.storage
    .from("assets")
    .upload(filePath, file);

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
  return data.publicUrl;
}
