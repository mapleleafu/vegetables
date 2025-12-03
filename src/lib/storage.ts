import { supabase } from "./supabaseClient";

export async function uploadImage(file: File, path: string) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${path}-${Date.now()}.${fileExt}`;
  const filePath = `images/${fileName}`;

  const { error } = await supabase.storage
    .from("assets")
    .upload(filePath, file);

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
  return data.publicUrl;
}
