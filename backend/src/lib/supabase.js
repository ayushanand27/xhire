import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env.js";

const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY);

/**
 * Supabase Storage Service
 * Handles file uploads (resumes, reports, etc.) and retrieval
 */

export class StorageService {
  /**
   * Upload a file to Supabase Storage
   * @param {string} bucket - Bucket name (e.g., 'resumes', 'reports')
   * @param {string} path - File path within bucket
   * @param {Buffer} fileBuffer - File content
   * @param {object} metadata - Optional metadata
   */
  static async uploadFile(bucket, path, fileBuffer, metadata = {}) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, fileBuffer, {
          cacheControl: "3600",
          upsert: false,
          metadata,
        });

      if (error) throw error;

      return {
        path: data.path,
        fullPath: `${bucket}/${data.path}`,
        url: supabase.storage.from(bucket).getPublicUrl(data.path).data
          .publicUrl,
      };
    } catch (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      throw error;
    }
  }

  /**
   * Download a file from Supabase Storage
   */
  static async downloadFile(bucket, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) throw error;

      return await data.text();
    } catch (error) {
      console.error(`Error downloading from ${bucket}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(bucket, path) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error(`Error deleting from ${bucket}:`, error);
      throw error;
    }
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * List files in a bucket
   */
  static async listFiles(bucket, folder = "") {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`Error listing files in ${bucket}:`, error);
      throw error;
    }
  }
}

/**
 * Generate embeddings using Supabase Vector service
 * This uses OpenAI's embedding model through Supabase Functions
 * (Alternative: Use Claude embeddings or local embeddings)
 */
export class EmbeddingService {
  /**
   * Generate embeddings for text chunks
   * In production, use pgvector with Supabase RLS policies
   */
  static async generateEmbeddings(texts) {
    try {
      // For now, this is a placeholder
      // In production, integrate with:
      // 1. OpenAI Embeddings API (via Supabase Functions)
      // 2. Or use Sentence Transformers locally
      // 3. Or use Claude Embeddings API (if available)

      console.warn("Embeddings not yet implemented - using mock");

      return texts.map((text) => ({
        text,
        embedding: Array(1536).fill(0), // Mock 1536-dim vector
      }));
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw error;
    }
  }

  /**
   * Store embeddings in pgvector database
   */
  static async storeEmbeddings(resumeId, chunks) {
    try {
      // Implementation would insert into ResumeChunk model with embeddings
      // This is handled by Claude-generated embeddings service
      console.log(`Storing ${chunks.length} embeddings for resume ${resumeId}`);
    } catch (error) {
      console.error("Error storing embeddings:", error);
      throw error;
    }
  }
}

export default supabase;
