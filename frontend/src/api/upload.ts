// frontend/src/api/upload.ts

import api from "./client";

export const uploadFile = async (file: File, folder: string = "general") => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post(`/upload/single/${folder}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
};

export const uploadMultipleFiles = async (files: File[], folder: string = "general") => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append("files", file);
  });
  
  const response = await api.post(`/upload/multiple/${folder}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
};

export const deleteFile = async (filename: string, folder: string = "temp") => {
  const response = await api.delete(`/upload/${filename}?folder=${folder}`);
  return response.data;
};