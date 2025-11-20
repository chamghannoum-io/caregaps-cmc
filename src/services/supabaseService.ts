/**
 * Supabase Service
 * Handles connection to Supabase and storage operations
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Get your anon key from: Supabase Dashboard > Settings > API > anon public key
const SUPABASE_URL = 'https://hlxhzllylxrkgncaddyi.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!SUPABASE_ANON_KEY) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY not set! Create a .env file with your Supabase anon key.')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface PatientFile {
  name: string
  path: string
  bucket: string
}

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'patients'

export const supabaseService = {
  /**
   * Get list of patient files from storage bucket
   */
  async getPatientFiles(bucketName: string = DEFAULT_BUCKET): Promise<PatientFile[]> {
    try {
      console.log('📂 Fetching patient files from bucket:', bucketName)

      const { data, error } = await supabase.storage
        .from(bucketName)
        .list()

      if (error) {
        console.error('❌ Error fetching files:', error)
        throw new Error(`Failed to fetch patient files: ${error.message}`)
      }

      console.log('✅ Found files:', data)

      // Filter for .txt files and map to PatientFile format
      const patientFiles = data
        ?.filter(file => file.name.endsWith('.txt'))
        .map(file => ({
          name: file.name.replace('.txt', ''),
          path: file.name,
          bucket: bucketName
        })) || []

      return patientFiles
    } catch (error) {
      console.error('💥 Error in getPatientFiles:', error)
      throw error
    }
  },

  /**
   * Get content of a specific patient file
   */
  async getPatientFileContent(filePath: string, bucketName: string = DEFAULT_BUCKET): Promise<string> {
    try {
      console.log('📄 Fetching file content:', filePath)

      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath)

      if (error) {
        console.error('❌ Error downloading file:', error)
        throw new Error(`Failed to download file: ${error.message}`)
      }

      // Convert blob to text
      const content = await data.text()
      console.log('✅ File content retrieved:', content.substring(0, 100) + '...')

      return content
    } catch (error) {
      console.error('💥 Error in getPatientFileContent:', error)
      throw error
    }
  },

  /**
   * Test connection to Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.listBuckets()
      
      if (error) {
        console.error('❌ Connection test failed:', error)
        return false
      }

      console.log('✅ Connected to Supabase. Available buckets:', data)
      return true
    } catch (error) {
      console.error('💥 Connection test error:', error)
      return false
    }
  }
}

