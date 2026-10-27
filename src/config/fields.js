// Definisi field formulir. `options` merujuk ke kunci pilihan dari GET /api/meta.
// Aturan validasi yang berlaku tetap ada di server (app/Support/ApplicantRules.php).

export const SECTIONS = [
  {
    key: 'pribadi',
    title: 'Data pribadi',
    description: 'Isi sesuai KTP atau paspor Anda.',
    fields: [
      { name: 'nama', label: 'Nama lengkap', type: 'text', autocomplete: 'name', span: 2 },
      { name: 'hp', label: 'No. HP / WhatsApp', type: 'tel', autocomplete: 'tel', placeholder: '0812xxxxxxxx' },
      { name: 'telp', label: 'No. telepon', type: 'tel', placeholder: 'Telepon rumah atau kantor' },
      { name: 'tempat_lahir', label: 'Tempat lahir', type: 'text' },
      { name: 'tgl_lahir', label: 'Tanggal lahir', type: 'date' },
      { name: 'gender', label: 'Jenis kelamin', type: 'radio', options: 'gender', span: 2 },
      { name: 'status_pernikahan', label: 'Status pernikahan', type: 'select', options: 'status_pernikahan' },
      { name: 'golongan_darah', label: 'Golongan darah', type: 'select', options: 'golongan_darah' },
      { name: 'agama', label: 'Agama', type: 'select', options: 'agama' },
      { name: 'etnis', label: 'Etnis', type: 'select', options: 'etnis' },
      {
        name: 'ptkp', label: 'Status PTKP', type: 'select', options: 'ptkp',
        hint: 'Status pajak: TK = tidak kawin, K = kawin, angka = jumlah tanggungan.',
        // Pelamar perempuan: otomatis TK/0 dan tidak bisa diganti (juga dipaksa di server)
        lockIf: { field: 'gender', value: 'Perempuan', set: 'TK0', note: 'Untuk pelamar perempuan, status PTKP otomatis TK/0.' },
      },
    ],
  },
  {
    key: 'kontak',
    title: 'Kontak darurat',
    description: 'Dua orang yang bisa kami hubungi jika terjadi keadaan darurat.',
    fields: [
      { name: 'nama_contact_darurat', label: 'Nama kontak 1', type: 'text' },
      { name: 'contact_darurat_1', label: 'No. HP kontak 1', type: 'tel' },
      { name: 'hubungan_1', label: 'Hubungan dengan Anda', type: 'text', placeholder: 'Contoh: Ayah, Istri, Kakak' },
      { name: 'nama_contact_darurat_2', label: 'Nama kontak 2', type: 'text', newRow: true },
      { name: 'contact_darurat_2', label: 'No. HP kontak 2', type: 'tel' },
      { name: 'hubungan_2', label: 'Hubungan dengan Anda', type: 'text', placeholder: 'Contoh: Ibu, Suami, Adik' },
    ],
  },
  {
    key: 'identitas',
    title: 'Identitas dan alamat',
    description: 'Nomor identitas harus sama dengan dokumen yang Anda unggah.',
    fields: [
      { name: 'jenis_identitas', label: 'Jenis identitas', type: 'select', options: 'jenis_identitas' },
      { name: 'no_identitas', label: 'No. identitas', type: 'text', inputmode: 'text', hint: 'KTP: 16 digit angka. Paspor: 6 sampai 12 huruf/angka.' },
      { name: 'alamat_identitas', label: 'Alamat sesuai identitas', type: 'textarea', span: 2 },
      { name: 'alamat_tinggal_sekarang', label: 'Alamat tinggal sekarang', type: 'textarea', span: 2 },
    ],
  },
  {
    key: 'pendidikan',
    title: 'Pendidikan',
    description: 'Pendidikan terakhir yang Anda tempuh.',
    fields: [
      { name: 'pendidikan', label: 'Pendidikan terakhir', type: 'select', options: 'pendidikan', span: 2 },
      { name: 'jurusan', label: 'Jurusan', type: 'text', optional: true, schoolDetail: true },
      { name: 'nama_kampus', label: 'Nama sekolah / kampus', type: 'text', optional: true, schoolDetail: true },
    ],
  },
]

export const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields)
