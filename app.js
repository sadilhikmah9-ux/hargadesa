// app.js
// Logic untuk menangani pencarian harga komoditas.
// Catatan: Untuk integrasi backend, set API_URL ke endpoint nyata.

const API_URL = ""; // <-- Jika ada API, letakkan URL di sini. Jika kosong, digunakan dataset lokal.

const sampleData = [
    { komoditas: "Beras Premium", harga: 13500, tanggal: "2025-11-21", sumber: "Pasar Desa X", lokasi: "desa-a" },
    { komoditas: "Telur Ayam", harga: 28000, tanggal: "2025-11-21", sumber: "Kelompok Tani Y", lokasi: "desa-b" },
    { komoditas: "Cabai Merah", harga: 42000, tanggal: "2025-11-20", sumber: "Pasar Desa A", lokasi: "desa-a" },
    // Tambahkan data contoh lainnya jika diperlukan
];

const form = document.getElementById("form-pencarian");
const komoditasInput = document.getElementById("komoditas");
const lokasiSelect = document.getElementById("lokasi");
const tabelBody = document.getElementById("tabel-body");
const statusEl = document.getElementById("results-status");
const submitBtn = document.getElementById("btn-submit");

function formatRupiah(number) {
    if (typeof number !== "number") return number;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(number);
}

function renderRows(rows) {
    tabelBody.innerHTML = "";
    if (!rows || rows.length === 0) {
        tabelBody.innerHTML = `<tr><td colspan=\"4\">Tidak ada data ditemukan.</td></tr>`;
        return;
    }
    const fragment = document.createDocumentFragment();
    rows.forEach(row => {
        const tr = document.createElement("tr");

        const tdKomoditas = document.createElement("td");
        tdKomoditas.textContent = row.komoditas;

        const tdHarga = document.createElement("td");
        tdHarga.textContent = formatRupiah(row.harga);

        const tdTanggal = document.createElement("td");
        tdTanggal.textContent = row.tanggal;

        const tdSumber = document.createElement("td");
        tdSumber.textContent = row.sumber;

        tr.appendChild(tdKomoditas);
        tr.appendChild(tdHarga);
        tr.appendChild(tdTanggal);
        tr.appendChild(tdSumber);

        fragment.appendChild(tr);
    });
    tabelBody.appendChild(fragment);
}

async function fetchFromApi(query, lokasi) {
    if (!API_URL) return null;
    const url = new URL(API_URL);
    url.searchParams.set("komoditas", query);
    url.searchParams.set("lokasi", lokasi);

    const resp = await fetch(url.toString(), { method: "GET" });
    if (!resp.ok) throw new Error("Gagal mengambil data dari server.");
    const data = await resp.json();
    // Asumsikan response berbentuk array objek {komoditas, harga, tanggal, sumber, lokasi}
    return data;
}

async function performSearch(e) {
    e.preventDefault();
    const q = komoditasInput.value.trim();
    const lokasi = lokasiSelect.value;

    if (q.length < 2) {
        statusEl.textContent = "Masukkan minimal 2 karakter untuk kata kunci pencarian.";
        komoditasInput.focus();
        return;
    }

    statusEl.textContent = "Mencari...";
    submitBtn.disabled = true;

    try {
        let results = null;
        if (API_URL) {
            const apiData = await fetchFromApi(q, lokasi);
            results = Array.isArray(apiData) ? apiData : [];
        } else {
            // Pencarian pada dataset lokal (case-insensitive substring match)
            const lowQ = q.toLowerCase();
            results = sampleData.filter(item => {
                const matchesKeyword = item.komoditas.toLowerCase().includes(lowQ);
                const matchesLokasi = !lokasi || item.lokasi === lokasi;
                return matchesKeyword && matchesLokasi;
            });
        }

        renderRows(results);
        statusEl.textContent = `Menampilkan ${results.length} hasil.`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Terjadi kesalahan saat mengambil data. Cek console untuk detail.";
        renderRows([]);
    } finally {
        submitBtn.disabled = false;
    }
}

// Inisialisasi: render beberapa data default (mis. latest)
function init() {
    // Tampilkan sample data awal (default)
    renderRows(sampleData);
    statusEl.textContent = `Menampilkan ${sampleData.length} hasil contoh.`;
    form.addEventListener("submit", performSearch);
}

init();
