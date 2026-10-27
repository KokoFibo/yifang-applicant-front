const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Kompres awal di browser supaya unggahan dari HP lebih cepat dan hemat kuota.
 * Server tetap melakukan resize + konversi WebP final (1200px, kualitas 75).
 * Orientasi EXIF diterapkan, gambar diperkecil ke sisi terpanjang `maxSide`.
 */
export async function compressImage(file, { maxSide = 1600, quality = 0.85 } = {}) {
  const okType = OK_TYPES.includes(file.type)
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff' // PNG transparan -> latar putih
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) throw new Error('toBlob gagal')
    if (okType && scale === 1 && blob.size >= file.size) return file // sudah cukup kecil

    const base = file.name.replace(/\.[^.]+$/, '') || 'foto'
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
  } catch {
    if (okType) return file
    throw new Error('Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.')
  }
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
