// State awal untuk form yang memakai useActionState.
//   ok      : null (belum dikirim) | true | false
//   message : pesan umum untuk ditampilkan di atas form
//   errors  : { namaField: "pesan error" }
//   values  : nilai yang dikembalikan agar isian tidak hilang (tanpa password)
export const initialFormState = {
  ok: null,
  message: "",
  errors: {},
  values: {},
};
