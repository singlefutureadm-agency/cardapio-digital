const { createClient } = require('@supabase/supabase-js')

const BUCKET = 'uploads'

function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY não configurados')
  return createClient(url, key)
}

async function uploadFile(buffer, filename, mimetype) {
  const supabase = getClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: mimetype, upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return data.publicUrl
}

async function deleteFile(urlOrPath) {
  if (!urlOrPath) return
  try {
    const supabase = getClient()
    const filename = urlOrPath.split('/').pop().split('?')[0]
    await supabase.storage.from(BUCKET).remove([filename])
  } catch (_) {}
}

module.exports = { uploadFile, deleteFile }
