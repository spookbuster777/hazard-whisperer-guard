export interface AIKnowledgeSource {
  type: 'TBC' | 'PSPP' | 'GR';
  label: string;
  category: string;
  categoryNumber: number;
  confidence: number;
  reasoning: string;
  citation: {
    title: string;
    content: string;
  };
}

export interface ClusterInfo {
  id: string;
  name: string;
  reportCount: number;
  similarityScore: number;
  status: 'Duplikat Kuat' | 'Duplikat Mungkin' | 'Bukan Duplikat';
  components: {
    locationRadius: number;
    locationName: number;
    detailLocation: number;
    locationDescription: number;
    nonCompliance: number;
    subNonCompliance: number;
    imageContext: number;
    findingDescription: number;
  };
}

// AI Processing Status (only for Antrian AI)
export type AIStatus = 'MENUNGGU_ANALISIS_AI' | 'SEDANG_ANALISIS_AI' | 'AI_GAGAL' | 'AI_SELESAI';

// Duplicate Detection Status
export type DuplicateStatus = 'MENUNGGU_ANALISIS_DUPLICATE' | 'SEDANG_ANALISIS_DUPLICATE' | 'DUPLICATE_SELESAI';

// Duplicate Scores Interface
export interface DuplicateScores {
  overall: number;      // Combined score
  ruleBased: number;    // Rule-based matching score
  geo: number;          // Geographic/location similarity
  lexical: number;      // Word-level similarity
  semantic: number;     // Meaning-level similarity
}

// Evaluation Status (only for Daftar Laporan post-AI)
export type EvaluationStatus = 'BELUM_DIEVALUASI' | 'DALAM_EVALUASI' | 'SELESAI' | 'PERLU_REVIEW_ULANG';

// SLA Status
export type SLAStatus = 'hijau' | 'kuning' | 'merah';

export interface HazardReport {
  id: string;
  tanggal: string;
  pelapor: string;
  lokasi: string;
  lokasiKode: string;
  jenisHazard: string;
  subJenisHazard: string;
  cluster: string | null;
  site: string;
  lokasiArea?: string;
  detailLokasi: string;
  deskripsi?: string;
  deskripsiTemuan: string;
  quickAction: string;
  tanggalPembuatan: string;
  rolePelapor: string;
  
  // Ketidaksesuaian fields
  ketidaksesuaian?: string;
  subKetidaksesuaian?: string;
  
  // AI Pipeline fields
  aiStatus: AIStatus;
  aiBatch?: string;
  etaSiapEvaluasi?: string;
  timestamp?: string; // ISO timestamp for queue ordering
  
  // Post-AI fields (populated when aiStatus = AI_SELESAI)
  labels?: ('TBC' | 'PSPP' | 'GR')[];
  confidenceScore?: number;
  aiKnowledgeSources?: AIKnowledgeSource[];
  clusterSuggestion?: string;
  
  // Evaluation fields
  evaluationStatus?: EvaluationStatus;
  evaluatorName?: string;
  slaStatus?: SLAStatus;
  slaDueDate?: string;
  assignedTo?: string;
  
  // Duplicate detection fields
  duplicateStatus?: DuplicateStatus;
  duplicateScores?: DuplicateScores;
}

// Cluster data with similarity scoring based on the clustering rules
export const reportClusters: ClusterInfo[] = [
  {
    id: "C-001",
    name: "Pelanggaran Kecepatan Area Gerbang",
    reportCount: 6,
    similarityScore: 0.87,
    status: "Duplikat Kuat",
    components: {
      locationRadius: 1,
      locationName: 1,
      detailLocation: 0.5,
      locationDescription: 0.8,
      nonCompliance: 1,
      subNonCompliance: 1,
      imageContext: 0.7,
      findingDescription: 0.9
    }
  },
  {
    id: "C-002",
    name: "Kondisi Jalan Berlubang Pit 3",
    reportCount: 5,
    similarityScore: 0.82,
    status: "Duplikat Kuat",
    components: {
      locationRadius: 1,
      locationName: 1,
      detailLocation: 1,
      locationDescription: 0.9,
      nonCompliance: 1,
      subNonCompliance: 0.5,
      imageContext: 0.6,
      findingDescription: 0.8
    }
  },
  {
    id: "C-003",
    name: "Retakan Highwall Pit 2",
    reportCount: 5,
    similarityScore: 0.91,
    status: "Duplikat Kuat",
    components: {
      locationRadius: 1,
      locationName: 1,
      detailLocation: 1,
      locationDescription: 1,
      nonCompliance: 1,
      subNonCompliance: 1,
      imageContext: 0.8,
      findingDescription: 0.7
    }
  },
  {
    id: "C-004",
    name: "APD Tidak Lengkap Workshop",
    reportCount: 6,
    similarityScore: 0.65,
    status: "Duplikat Mungkin",
    components: {
      locationRadius: 0.5,
      locationName: 0.5,
      detailLocation: 0.5,
      locationDescription: 0.6,
      nonCompliance: 1,
      subNonCompliance: 0.5,
      imageContext: 0.5,
      findingDescription: 0.7
    }
  },
  {
    id: "C-005",
    name: "Helm Safety Area Konstruksi",
    reportCount: 6,
    similarityScore: 0.78,
    status: "Duplikat Kuat",
    components: {
      locationRadius: 0.5,
      locationName: 1,
      detailLocation: 0.5,
      locationDescription: 0.8,
      nonCompliance: 1,
      subNonCompliance: 1,
      imageContext: 0.9,
      findingDescription: 0.85
    }
  }
];

// Location data for dropdowns
export const siteOptions = [
  "MINING PIT",
  "MARINE",
  "PROCESSING PLANT",
  "CAMP AREA",
  "OFFICE AREA"
];

export const lokasiOptions: Record<string, string[]> = {
  "MINING PIT": ["Hauling Road", "Pit Area", "Disposal Area", "Loading Point"],
  "MARINE": ["Fuel Transfer Area", "Jetty", "Barge Loading", "Port Office"],
  "PROCESSING PLANT": ["Crusher", "Conveyor Belt", "Stockpile", "Weighbridge"],
  "CAMP AREA": ["Mess Hall", "Dormitory", "Recreation Area", "Parking Lot"],
  "OFFICE AREA": ["Main Office", "Workshop", "Warehouse", "Gate"]
};

export const detailLokasiOptions: Record<string, string[]> = {
  "Hauling Road": ["Jalur Angkut Pit Selatan", "Jalur Angkut Pit Utara", "Persimpangan Utama"],
  "Pit Area": ["Pit 1 Section A", "Pit 2 Section B", "Pit 3 Section C"],
  "Disposal Area": ["Disposal Utama", "Disposal Cadangan"],
  "Loading Point": ["Loading Point 1", "Loading Point 2", "Loading Point 3"],
  "Fuel Transfer Area": ["Fuel Hose Connection Point", "Fuel Storage Tank", "Pump Station"],
  "Jetty": ["Jetty Utama", "Jetty Cadangan", "Dermaga Bongkar"],
  "Barge Loading": ["Conveyor Loading", "Crane Area", "Barge Parking"],
  "Port Office": ["Ruang Kontrol", "Ruang Operator", "Area Parkir"],
  "Crusher": ["Primary Crusher", "Secondary Crusher", "Tertiary Crusher"],
  "Conveyor Belt": ["Conveyor Utama", "Conveyor Transfer", "Conveyor Emergency"],
  "Stockpile": ["Stockpile A", "Stockpile B", "Reclaim Area"],
  "Weighbridge": ["Weighbridge 1", "Weighbridge 2"],
  "Mess Hall": ["Ruang Makan", "Dapur", "Area Cuci"],
  "Dormitory": ["Blok A", "Blok B", "Blok C"],
  "Recreation Area": ["Lapangan Olahraga", "Gym", "Ruang Santai"],
  "Parking Lot": ["Parkir Utama", "Parkir Tamu"],
  "Main Office": ["Lantai 1", "Lantai 2", "Ruang Meeting"],
  "Workshop": ["Workshop Utama", "Workshop Elektrik", "Workshop Mekanik"],
  "Warehouse": ["Gudang Spare Part", "Gudang Material", "Gudang BBM"],
  "Gate": ["Gerbang Utama", "Gerbang Belakang", "Pos Jaga"]
};

// Reports in AI Queue (Pre-Processing)
export const aiQueueReports: HazardReport[] = [
  {
    id: "HR-2025-336-24002",
    tanggal: "12 Des 2025",
    pelapor: "Sinta Dewi",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "",
    subJenisHazard: "",
    cluster: null,
    site: "MINING PIT",
    lokasiArea: "Hauling Road",
    detailLokasi: "Jalur Angkut Pit Selatan",
    deskripsiTemuan: "Pending AI analysis...",
    quickAction: "-",
    tanggalPembuatan: "12 Des 2025",
    rolePelapor: "Security",
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    subKetidaksesuaian: "Tidak menggunakan APD sesuai standard",
    aiStatus: "SEDANG_ANALISIS_AI",
    timestamp: "2025-12-12T06:15:00Z"
  },
  {
    id: "HR-2025-336-24001",
    tanggal: "12 Des 2025",
    pelapor: "Rizki Pratama",
    lokasi: "(B 56) Area Transportasi",
    lokasiKode: "B56",
    jenisHazard: "",
    subJenisHazard: "",
    cluster: null,
    site: "MARINE",
    lokasiArea: "Fuel Transfer Area",
    detailLokasi: "Fuel Hose Connection Point",
    deskripsiTemuan: "Pending AI analysis...",
    quickAction: "-",
    tanggalPembuatan: "12 Des 2025",
    rolePelapor: "Operator",
    ketidaksesuaian: "Pembelian, Penanganan bahan dan kendali bahan",
    subKetidaksesuaian: "Penyimpanan bahan tidak tepat",
    aiStatus: "MENUNGGU_ANALISIS_AI",
    timestamp: "2025-12-12T06:20:00Z"
  },
  {
    id: "HR-2025-336-24003",
    tanggal: "12 Des 2025",
    pelapor: "Hendra Saputra",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "",
    subJenisHazard: "",
    cluster: null,
    site: "PROCESSING PLANT",
    lokasiArea: "Crusher",
    detailLokasi: "Primary Crusher",
    deskripsiTemuan: "Pending AI analysis...",
    quickAction: "-",
    tanggalPembuatan: "12 Des 2025",
    rolePelapor: "Supervisor",
    ketidaksesuaian: "Kelayakan/Penggunaan Tools",
    subKetidaksesuaian: "Kesesuaian penggunaan Supporting Tools",
    aiStatus: "MENUNGGU_ANALISIS_AI",
    timestamp: "2025-12-12T06:25:00Z"
  },
  {
    id: "HR-2025-336-24005",
    tanggal: "12 Des 2025",
    pelapor: "Ahmad Fauzi",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "",
    subJenisHazard: "",
    cluster: null,
    site: "MINING PIT",
    lokasiArea: "Pit Area",
    detailLokasi: "Pit 1 Section A",
    deskripsiTemuan: "Pending AI analysis...",
    quickAction: "-",
    tanggalPembuatan: "12 Des 2025",
    rolePelapor: "Gate Keeper",
    ketidaksesuaian: "Perlengkapan_Mesin_atau_Peralatan",
    subKetidaksesuaian: "Pelepasan komponen-komponen yang tidak memadai",
    aiStatus: "MENUNGGU_ANALISIS_AI",
    timestamp: "2025-12-12T06:30:00Z"
  },
  {
    id: "HR-2025-336-24006",
    tanggal: "12 Des 2025",
    pelapor: "Budi Santoso",
    lokasi: "(B 67) Area Workshop",
    lokasiKode: "B67",
    jenisHazard: "",
    subJenisHazard: "",
    cluster: null,
    site: "OFFICE AREA",
    lokasiArea: "Workshop",
    detailLokasi: "Workshop Utama",
    deskripsiTemuan: "Pending AI analysis...",
    quickAction: "-",
    tanggalPembuatan: "12 Des 2025",
    rolePelapor: "Teknisi",
    ketidaksesuaian: "Perlengkapan_Mesin_atau_Peralatan",
    subKetidaksesuaian: "Penyesuaian / perbaikan / pemeliharaan yang tidak memadai",
    aiStatus: "MENUNGGU_ANALISIS_AI",
    timestamp: "2025-12-12T06:35:00Z"
  },
  {
    id: "HR-2025-336-24008",
    tanggal: "12 Des 2025",
    pelapor: "Agus Wijaya",
    lokasi: "(B 69) Jalan Hauling",
    lokasiKode: "B69",
    jenisHazard: "",
    subJenisHazard: "",
    cluster: null,
    site: "MINING PIT",
    lokasiArea: "Hauling Road",
    detailLokasi: "Jalur Angkut Pit Utara",
    deskripsiTemuan: "Pending AI analysis...",
    quickAction: "-",
    tanggalPembuatan: "12 Des 2025",
    rolePelapor: "Road Inspector",
    ketidaksesuaian: "Standar Road Management",
    subKetidaksesuaian: "Drainase tersumbat pada jalan angkut",
    aiStatus: "MENUNGGU_ANALISIS_AI",
    timestamp: "2025-12-12T06:40:00Z"
  },
  {
    id: "HR-2025-336-24010",
    tanggal: "12 Des 2025",
    pelapor: "Eka Putra",
    lokasi: "(B 71) Area Listrik",
    lokasiKode: "B71",
    jenisHazard: "",
    subJenisHazard: "",
    cluster: null,
    site: "MARINE",
    lokasiArea: "Jetty",
    detailLokasi: "Jetty Utama",
    deskripsiTemuan: "Pending AI analysis...",
    quickAction: "-",
    tanggalPembuatan: "12 Des 2025",
    rolePelapor: "Electrical Engineer",
    ketidaksesuaian: "Bahaya Elektrikal",
    subKetidaksesuaian: "Pengamanan peralatan listrik tidak memadai",
    aiStatus: "MENUNGGU_ANALISIS_AI",
    timestamp: "2025-12-12T06:45:00Z"
  }
];

// Reports ready for evaluation (Post-AI)
export const hazardReports: HazardReport[] = [
  // ========== CLUSTER C-001: Pelanggaran Kecepatan Area Gerbang (6 reports) ==========
  {
    id: "HR-2025-336-23917",
    tanggal: "03 Des 2025",
    pelapor: "Siti Rahayu",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "Pengoperasian Kendaraan",
    subJenisHazard: "Kecepatan berlebih",
    cluster: "C-001",
    site: "BMO 1",
    lokasiArea: "Hauling Road",
    detailLokasi: "Gerbang Utama Site",
    deskripsiTemuan: "LV melaju dengan kecepatan 45 km/jam di area 30 km/jam.",
    quickAction: "Warning Letter",
    tanggalPembuatan: "Budi Santoso",
    rolePelapor: "Gate Keeper",
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    subKetidaksesuaian: "Tidak menggunakan APD sesuai standard",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-13T07:45:00Z",
    labels: ['PSPP', 'GR'],
    confidenceScore: 92,
    evaluationStatus: "DALAM_EVALUASI",
    evaluatorName: "Andi Supervisor",
    slaStatus: "hijau",
    slaDueDate: "11 Des 2025",
    assignedTo: "Andi Supervisor",
    duplicateScores: {
      overall: 0.87,
      ruleBased: 0.95,
      geo: 0.92,
      lexical: 0.80,
      semantic: 0.85
    }
  },
  {
    id: "HR-2025-336-23920",
    tanggal: "02 Des 2025",
    pelapor: "Bambang Sutrisno",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "Pengoperasian Kendaraan",
    subJenisHazard: "Tidak sabuk pengaman",
    cluster: "C-001",
    site: "BMO 1",
    lokasiArea: "Hauling Road",
    detailLokasi: "Gerbang Utama Site",
    deskripsiTemuan: "Driver LV tidak menggunakan seatbelt saat melintas gerbang.",
    quickAction: "Safety Briefing",
    tanggalPembuatan: "Agus Salim",
    rolePelapor: "Security",
    ketidaksesuaian: "Kelayakan/Penggunaan Tools",
    subKetidaksesuaian: "Kesesuaian penggunaan Supporting Tools",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-02T11:00:00Z",
    labels: ['PSPP', 'GR'],
    confidenceScore: 89,
    evaluationStatus: "SELESAI",
    evaluatorName: "Citra Evaluator",
    slaStatus: "hijau",
    slaDueDate: "08 Des 2025",
    duplicateScores: {
      overall: 0.83,
      ruleBased: 0.90,
      geo: 0.88,
      lexical: 0.78,
      semantic: 0.80
    }
  },
  {
    id: "HR-2025-336-23930",
    tanggal: "01 Des 2025",
    pelapor: "Eko Prasetyo",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "Pengoperasian Kendaraan",
    subJenisHazard: "Kecepatan berlebih",
    cluster: "C-001",
    site: "BMO 1",
    lokasiArea: "Hauling Road",
    detailLokasi: "Checkpoint Gerbang",
    deskripsiTemuan: "HD melaju 40 km/jam melewati area gerbang utama tanpa mengurangi kecepatan.",
    quickAction: "Warning Letter",
    tanggalPembuatan: "Rudi Hartono",
    rolePelapor: "Gate Keeper",
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    subKetidaksesuaian: "Melebihi batas kecepatan",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-01T08:30:00Z",
    labels: ['PSPP', 'GR'],
    confidenceScore: 94,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "kuning",
    slaDueDate: "07 Des 2025",
    duplicateScores: {
      overall: 0.89,
      ruleBased: 0.92,
      geo: 0.95,
      lexical: 0.85,
      semantic: 0.88
    }
  },
  {
    id: "HR-2025-336-23931",
    tanggal: "30 Nov 2025",
    pelapor: "Suryadi Wijaya",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "Pengoperasian Kendaraan",
    subJenisHazard: "Kecepatan berlebih",
    cluster: "C-001",
    site: "BMO 1",
    lokasiArea: "Hauling Road",
    detailLokasi: "Gerbang Utama Site",
    deskripsiTemuan: "Kendaraan LV melaju dengan kecepatan tinggi di area 30 km/jam tanpa memperlambat.",
    quickAction: "Coaching",
    tanggalPembuatan: "Hendra Saputra",
    rolePelapor: "Security",
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    subKetidaksesuaian: "Melebihi batas kecepatan",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-30T14:20:00Z",
    labels: ['GR'],
    confidenceScore: 91,
    evaluationStatus: "SELESAI",
    evaluatorName: "Budi Evaluator",
    slaStatus: "hijau",
    slaDueDate: "05 Des 2025",
    duplicateScores: {
      overall: 0.86,
      ruleBased: 0.88,
      geo: 0.90,
      lexical: 0.82,
      semantic: 0.84
    }
  },
  {
    id: "HR-2025-336-23932",
    tanggal: "29 Nov 2025",
    pelapor: "Agung Nugroho",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "Pengoperasian Kendaraan",
    subJenisHazard: "Kecepatan berlebih",
    cluster: "C-001",
    site: "BMO 1",
    lokasiArea: "Hauling Road",
    detailLokasi: "Pos Jaga Gerbang",
    deskripsiTemuan: "Dump truck melintas gerbang dengan kecepatan 35 km/jam di zona 25 km/jam.",
    quickAction: "Warning",
    tanggalPembuatan: "Irwan Setiawan",
    rolePelapor: "Gate Keeper",
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    subKetidaksesuaian: "Melebihi batas kecepatan",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-29T10:15:00Z",
    labels: ['PSPP'],
    confidenceScore: 88,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "merah",
    slaDueDate: "04 Des 2025",
    duplicateScores: {
      overall: 0.84,
      ruleBased: 0.86,
      geo: 0.91,
      lexical: 0.79,
      semantic: 0.82
    }
  },
  {
    id: "HR-2025-336-23933",
    tanggal: "28 Nov 2025",
    pelapor: "Darmawan",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "Pengoperasian Kendaraan",
    subJenisHazard: "Kecepatan berlebih",
    cluster: "C-001",
    site: "BMO 1",
    lokasiArea: "Hauling Road",
    detailLokasi: "Gerbang Utama Site",
    deskripsiTemuan: "Bus karyawan melaju cepat melewati gerbang tanpa berhenti di checkpoint.",
    quickAction: "Safety Briefing",
    tanggalPembuatan: "Joko Susilo",
    rolePelapor: "Security",
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    subKetidaksesuaian: "Tidak berhenti di checkpoint",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-28T16:45:00Z",
    labels: ['PSPP', 'GR'],
    confidenceScore: 90,
    evaluationStatus: "DALAM_EVALUASI",
    evaluatorName: "Andi Supervisor",
    slaStatus: "hijau",
    slaDueDate: "03 Des 2025",
    duplicateScores: {
      overall: 0.81,
      ruleBased: 0.84,
      geo: 0.93,
      lexical: 0.75,
      semantic: 0.78
    }
  },

  // ========== CLUSTER C-002: Kondisi Jalan Berlubang Pit 3 (5 reports) ==========
  {
    id: "HR-2025-336-23918",
    tanggal: "03 Des 2025",
    pelapor: "Dedi Kurniawan",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Perawatan Jalan",
    subJenisHazard: "Jalan berlubang",
    cluster: "C-002",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Pit 3 Section A",
    deskripsiTemuan: "Terdapat lubang berdiameter 50cm di hauling road.",
    quickAction: "Road Maintenance",
    tanggalPembuatan: "Eko Prasetyo",
    rolePelapor: "Road Inspector",
    ketidaksesuaian: "Standar Road Management",
    subKetidaksesuaian: "Drainase tersumbat pada jalan angkut",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-12T10:20:00Z",
    labels: ['GR'],
    confidenceScore: 85,
    evaluationStatus: "SELESAI",
    evaluatorName: "Budi Evaluator",
    slaStatus: "hijau",
    slaDueDate: "08 Des 2025",
    duplicateScores: {
      overall: 0.82,
      ruleBased: 0.90,
      geo: 0.85,
      lexical: 0.75,
      semantic: 0.78
    }
  },
  {
    id: "HR-2025-336-23934",
    tanggal: "02 Des 2025",
    pelapor: "Wahyu Hidayat",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Perawatan Jalan",
    subJenisHazard: "Jalan berlubang",
    cluster: "C-002",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Pit 3 Section B",
    deskripsiTemuan: "Lubang di jalan hauling pit 3 sekitar 40cm mengganggu operasional.",
    quickAction: "Road Maintenance",
    tanggalPembuatan: "Suryadi",
    rolePelapor: "HD Operator",
    ketidaksesuaian: "Standar Road Management",
    subKetidaksesuaian: "Kondisi jalan tidak layak",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-02T09:30:00Z",
    labels: ['GR'],
    confidenceScore: 87,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "kuning",
    slaDueDate: "07 Des 2025",
    duplicateScores: {
      overall: 0.85,
      ruleBased: 0.88,
      geo: 0.92,
      lexical: 0.80,
      semantic: 0.82
    }
  },
  {
    id: "HR-2025-336-23935",
    tanggal: "01 Des 2025",
    pelapor: "Faisal Rahman",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Perawatan Jalan",
    subJenisHazard: "Jalan rusak",
    cluster: "C-002",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Pit 3 Section A",
    deskripsiTemuan: "Jalan hauling di pit 3 mengalami kerusakan parah dengan beberapa lubang.",
    quickAction: "Road Closure",
    tanggalPembuatan: "Andi Firmansyah",
    rolePelapor: "Road Inspector",
    ketidaksesuaian: "Standar Road Management",
    subKetidaksesuaian: "Permukaan jalan tidak rata",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-01T14:00:00Z",
    labels: ['TBC', 'GR'],
    confidenceScore: 92,
    evaluationStatus: "DALAM_EVALUASI",
    evaluatorName: "Citra Evaluator",
    slaStatus: "hijau",
    slaDueDate: "06 Des 2025",
    duplicateScores: {
      overall: 0.88,
      ruleBased: 0.91,
      geo: 0.94,
      lexical: 0.83,
      semantic: 0.86
    }
  },
  {
    id: "HR-2025-336-23936",
    tanggal: "30 Nov 2025",
    pelapor: "Gunawan Putra",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Perawatan Jalan",
    subJenisHazard: "Jalan berlubang",
    cluster: "C-002",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Pit 3 Junction",
    deskripsiTemuan: "Ditemukan lubang besar di persimpangan jalan pit 3.",
    quickAction: "Road Maintenance",
    tanggalPembuatan: "Hendra",
    rolePelapor: "Supervisor",
    ketidaksesuaian: "Standar Road Management",
    subKetidaksesuaian: "Lubang di jalan angkut",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-30T11:15:00Z",
    labels: ['GR'],
    confidenceScore: 86,
    evaluationStatus: "SELESAI",
    evaluatorName: "Doni Evaluator",
    slaStatus: "hijau",
    slaDueDate: "05 Des 2025",
    duplicateScores: {
      overall: 0.80,
      ruleBased: 0.84,
      geo: 0.89,
      lexical: 0.74,
      semantic: 0.76
    }
  },
  {
    id: "HR-2025-336-23937",
    tanggal: "29 Nov 2025",
    pelapor: "Rizal Arifin",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Perawatan Jalan",
    subJenisHazard: "Jalan berlubang",
    cluster: "C-002",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Pit 3 Section C",
    deskripsiTemuan: "Kondisi jalan pit 3 section C berlubang-lubang cukup dalam.",
    quickAction: "Road Maintenance",
    tanggalPembuatan: "Irwan",
    rolePelapor: "Road Inspector",
    ketidaksesuaian: "Standar Road Management",
    subKetidaksesuaian: "Kondisi jalan rusak",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-29T08:45:00Z",
    labels: ['GR'],
    confidenceScore: 84,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "merah",
    slaDueDate: "04 Des 2025",
    duplicateScores: {
      overall: 0.79,
      ruleBased: 0.82,
      geo: 0.87,
      lexical: 0.72,
      semantic: 0.75
    }
  },

  // ========== CLUSTER C-003: Retakan Highwall Pit 2 (5 reports) ==========
  {
    id: "HR-2025-336-23921",
    tanggal: "01 Des 2025",
    pelapor: "Maya Sari",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Kondisi Area",
    subJenisHazard: "Material longsor",
    cluster: "C-003",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Highwall Pit 2",
    deskripsiTemuan: "Terdapat retakan di highwall yang berpotensi longsor.",
    quickAction: "Area Closure",
    tanggalPembuatan: "Hendra Wijaya",
    rolePelapor: "Geotechnical",
    ketidaksesuaian: "Bahaya Geoteknik",
    subKetidaksesuaian: "Retakan pada highwall",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-01T16:45:00Z",
    labels: ['GR'],
    confidenceScore: 94,
    evaluationStatus: "DALAM_EVALUASI",
    evaluatorName: "Doni Evaluator",
    slaStatus: "kuning",
    slaDueDate: "09 Des 2025",
    assignedTo: "Doni Evaluator",
    duplicateScores: {
      overall: 0.91,
      ruleBased: 0.94,
      geo: 0.96,
      lexical: 0.88,
      semantic: 0.90
    }
  },
  {
    id: "HR-2025-336-23938",
    tanggal: "30 Nov 2025",
    pelapor: "Bayu Nugraha",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Kondisi Area",
    subJenisHazard: "Retakan dinding",
    cluster: "C-003",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Highwall Pit 2 Barat",
    deskripsiTemuan: "Retakan panjang terlihat di dinding highwall pit 2 bagian barat.",
    quickAction: "Monitoring",
    tanggalPembuatan: "Surya Dharma",
    rolePelapor: "Geotechnical",
    ketidaksesuaian: "Bahaya Geoteknik",
    subKetidaksesuaian: "Retakan pada highwall",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-30T09:30:00Z",
    labels: ['TBC', 'GR'],
    confidenceScore: 96,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "merah",
    slaDueDate: "05 Des 2025",
    duplicateScores: {
      overall: 0.93,
      ruleBased: 0.95,
      geo: 0.98,
      lexical: 0.90,
      semantic: 0.92
    }
  },
  {
    id: "HR-2025-336-23939",
    tanggal: "29 Nov 2025",
    pelapor: "Arif Wibowo",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Kondisi Area",
    subJenisHazard: "Potensi longsor",
    cluster: "C-003",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Highwall Pit 2",
    deskripsiTemuan: "Terdeteksi pergerakan tanah di area highwall pit 2.",
    quickAction: "Area Closure",
    tanggalPembuatan: "Joko Widodo",
    rolePelapor: "Surveyor",
    ketidaksesuaian: "Bahaya Geoteknik",
    subKetidaksesuaian: "Pergerakan tanah terdeteksi",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-29T15:20:00Z",
    labels: ['GR'],
    confidenceScore: 93,
    evaluationStatus: "SELESAI",
    evaluatorName: "Andi Supervisor",
    slaStatus: "hijau",
    slaDueDate: "04 Des 2025",
    duplicateScores: {
      overall: 0.89,
      ruleBased: 0.92,
      geo: 0.95,
      lexical: 0.85,
      semantic: 0.87
    }
  },
  {
    id: "HR-2025-336-23940",
    tanggal: "28 Nov 2025",
    pelapor: "Dimas Pratama",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Kondisi Area",
    subJenisHazard: "Retakan dinding",
    cluster: "C-003",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Highwall Pit 2 Timur",
    deskripsiTemuan: "Retakan baru muncul di highwall pit 2 sisi timur setelah hujan.",
    quickAction: "Inspection",
    tanggalPembuatan: "Kurniawan",
    rolePelapor: "Geotechnical",
    ketidaksesuaian: "Bahaya Geoteknik",
    subKetidaksesuaian: "Retakan pasca hujan",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-28T10:00:00Z",
    labels: ['TBC', 'GR'],
    confidenceScore: 91,
    evaluationStatus: "DALAM_EVALUASI",
    evaluatorName: "Budi Evaluator",
    slaStatus: "kuning",
    slaDueDate: "03 Des 2025",
    duplicateScores: {
      overall: 0.87,
      ruleBased: 0.90,
      geo: 0.94,
      lexical: 0.82,
      semantic: 0.85
    }
  },
  {
    id: "HR-2025-336-23941",
    tanggal: "27 Nov 2025",
    pelapor: "Fajar Setiawan",
    lokasi: "(B 66) Area Galian Coal",
    lokasiKode: "B66",
    jenisHazard: "Kondisi Area",
    subJenisHazard: "Material longsor",
    cluster: "C-003",
    site: "BMO 1",
    lokasiArea: "Pit Area",
    detailLokasi: "Highwall Pit 2",
    deskripsiTemuan: "Material kecil mulai berjatuhan dari highwall pit 2.",
    quickAction: "Area Closure",
    tanggalPembuatan: "Santoso",
    rolePelapor: "Operator HD",
    ketidaksesuaian: "Bahaya Geoteknik",
    subKetidaksesuaian: "Material jatuh dari highwall",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-27T14:30:00Z",
    labels: ['GR'],
    confidenceScore: 95,
    evaluationStatus: "SELESAI",
    evaluatorName: "Citra Evaluator",
    slaStatus: "hijau",
    slaDueDate: "02 Des 2025",
    duplicateScores: {
      overall: 0.90,
      ruleBased: 0.93,
      geo: 0.97,
      lexical: 0.86,
      semantic: 0.88
    }
  },

  // ========== CLUSTER C-004: APD Tidak Lengkap Workshop (6 reports) ==========
  {
    id: "HR-2025-336-23916",
    tanggal: "04 Des 2025",
    pelapor: "Ahmad Wijaya",
    lokasi: "(B 56) Area Transportasi",
    lokasiKode: "B56",
    jenisHazard: "APD",
    subJenisHazard: "APD tidak lengkap",
    cluster: "C-004",
    site: "BMO 2",
    lokasiArea: "Workshop",
    detailLokasi: "Workshop Utama",
    deskripsiTemuan: "Operator HD tidak menggunakan safety vest saat keluar dari unit.",
    quickAction: "Safety Briefing",
    tanggalPembuatan: "Rudi Hartono",
    rolePelapor: "Safety Officer",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "APD tidak lengkap saat bekerja",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-14T09:15:00Z",
    labels: ['TBC'],
    confidenceScore: 88,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "kuning",
    slaDueDate: "09 Des 2025",
    duplicateScores: {
      overall: 0.65,
      ruleBased: 0.70,
      geo: 0.50,
      lexical: 0.60,
      semantic: 0.68
    }
  },
  {
    id: "HR-2025-336-23922",
    tanggal: "01 Des 2025",
    pelapor: "Andi Pratama",
    lokasi: "(B 56) Area Workshop",
    lokasiKode: "B56",
    jenisHazard: "APD",
    subJenisHazard: "Sarung tangan tidak dipakai",
    cluster: "C-004",
    site: "BMO 2",
    lokasiArea: "Workshop",
    detailLokasi: "Workshop Mekanik",
    deskripsiTemuan: "Mekanik tidak menggunakan sarung tangan saat handling oli.",
    quickAction: "Coaching",
    tanggalPembuatan: "Surya Dharma",
    rolePelapor: "Supervisor",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "Tidak menggunakan sarung tangan",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-01T09:30:00Z",
    labels: ['TBC'],
    confidenceScore: 87,
    evaluationStatus: "PERLU_REVIEW_ULANG",
    slaStatus: "merah",
    slaDueDate: "06 Des 2025",
    duplicateScores: {
      overall: 0.68,
      ruleBased: 0.72,
      geo: 0.55,
      lexical: 0.65,
      semantic: 0.70
    }
  },
  {
    id: "HR-2025-336-23942",
    tanggal: "30 Nov 2025",
    pelapor: "Heri Susanto",
    lokasi: "(B 67) Workshop",
    lokasiKode: "B67",
    jenisHazard: "APD",
    subJenisHazard: "Kacamata safety",
    cluster: "C-004",
    site: "BMO 2",
    lokasiArea: "Workshop",
    detailLokasi: "Workshop Elektrik",
    deskripsiTemuan: "Teknisi tidak memakai kacamata safety saat mengelas.",
    quickAction: "Warning",
    tanggalPembuatan: "Bambang",
    rolePelapor: "Safety Officer",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "Tidak menggunakan kacamata safety",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-30T13:45:00Z",
    labels: ['TBC', 'PSPP'],
    confidenceScore: 90,
    evaluationStatus: "SELESAI",
    evaluatorName: "Doni Evaluator",
    slaStatus: "hijau",
    slaDueDate: "05 Des 2025",
    duplicateScores: {
      overall: 0.62,
      ruleBased: 0.65,
      geo: 0.48,
      lexical: 0.58,
      semantic: 0.64
    }
  },
  {
    id: "HR-2025-336-23943",
    tanggal: "29 Nov 2025",
    pelapor: "Joni Iskandar",
    lokasi: "(B 67) Workshop",
    lokasiKode: "B67",
    jenisHazard: "APD",
    subJenisHazard: "Sepatu safety",
    cluster: "C-004",
    site: "BMO 2",
    lokasiArea: "Workshop",
    detailLokasi: "Workshop Utama",
    deskripsiTemuan: "Pekerja menggunakan sepatu biasa bukan safety shoes di workshop.",
    quickAction: "APD Check",
    tanggalPembuatan: "Agus Salim",
    rolePelapor: "Supervisor",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "Tidak menggunakan sepatu safety",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-29T11:00:00Z",
    labels: ['TBC'],
    confidenceScore: 85,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "kuning",
    slaDueDate: "04 Des 2025",
    duplicateScores: {
      overall: 0.66,
      ruleBased: 0.68,
      geo: 0.52,
      lexical: 0.62,
      semantic: 0.67
    }
  },
  {
    id: "HR-2025-336-23944",
    tanggal: "28 Nov 2025",
    pelapor: "Kurniawan",
    lokasi: "(B 67) Workshop",
    lokasiKode: "B67",
    jenisHazard: "APD",
    subJenisHazard: "APD tidak lengkap",
    cluster: "C-004",
    site: "BMO 2",
    lokasiArea: "Workshop",
    detailLokasi: "Workshop Mekanik",
    deskripsiTemuan: "Beberapa mekanik bekerja tanpa APD lengkap di area workshop.",
    quickAction: "Safety Briefing",
    tanggalPembuatan: "Dedi",
    rolePelapor: "Foreman",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "APD tidak lengkap",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-28T08:30:00Z",
    labels: ['TBC', 'PSPP'],
    confidenceScore: 89,
    evaluationStatus: "DALAM_EVALUASI",
    evaluatorName: "Andi Supervisor",
    slaStatus: "hijau",
    slaDueDate: "03 Des 2025",
    duplicateScores: {
      overall: 0.64,
      ruleBased: 0.67,
      geo: 0.50,
      lexical: 0.60,
      semantic: 0.66
    }
  },
  {
    id: "HR-2025-336-23945",
    tanggal: "27 Nov 2025",
    pelapor: "Lukman",
    lokasi: "(B 67) Workshop",
    lokasiKode: "B67",
    jenisHazard: "APD",
    subJenisHazard: "Helm tidak dipakai",
    cluster: "C-004",
    site: "BMO 2",
    lokasiArea: "Workshop",
    detailLokasi: "Workshop Area",
    deskripsiTemuan: "Teknisi tidak menggunakan helm saat berada di area workshop.",
    quickAction: "Coaching",
    tanggalPembuatan: "Eko",
    rolePelapor: "Safety Officer",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "Tidak menggunakan helm",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-27T15:15:00Z",
    labels: ['TBC'],
    confidenceScore: 86,
    evaluationStatus: "SELESAI",
    evaluatorName: "Budi Evaluator",
    slaStatus: "hijau",
    slaDueDate: "02 Des 2025",
    duplicateScores: {
      overall: 0.63,
      ruleBased: 0.66,
      geo: 0.49,
      lexical: 0.59,
      semantic: 0.65
    }
  },

  // ========== CLUSTER C-005: Helm Safety Area Konstruksi (6 reports) ==========
  {
    id: "HR-2025-336-23915",
    tanggal: "04 Des 2025",
    pelapor: "Kamila Iskandar",
    lokasi: "(B 56) Area Transportasi",
    lokasiKode: "B56",
    jenisHazard: "APD",
    subJenisHazard: "Tidak menggunakan APD",
    cluster: "C-005",
    site: "BMO 1",
    lokasiArea: "Hauling Road",
    detailLokasi: "Area Konstruksi Jalan",
    deskripsiTemuan: "Pekerja tidak menggunakan helm saat berada di area konstruksi.",
    quickAction: "Fatigue Test",
    tanggalPembuatan: "Edi Gunawan",
    rolePelapor: "Supervisor/Officer",
    ketidaksesuaian: "DDP : Kelayakan dan Pengoperasian Kendaraan / Unit",
    subKetidaksesuaian: "Tidak menggunakan APD sesuai standard",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-15T08:30:00Z",
    labels: ['TBC', 'PSPP', 'GR'],
    confidenceScore: 95,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "hijau",
    slaDueDate: "10 Des 2025",
    clusterSuggestion: "C-005",
    duplicateScores: {
      overall: 0.78,
      ruleBased: 0.85,
      geo: 0.90,
      lexical: 0.65,
      semantic: 0.72
    },
    aiKnowledgeSources: [
      {
        type: 'TBC',
        label: 'TBC - To be Concern Hazard',
        category: 'Deviasi pengoperasian kendaraan/unit',
        categoryNumber: 1,
        confidence: 95,
        reasoning: 'Temuan ini secara langsung berkaitan dengan pengoperasian kendaraan/unit.',
        citation: {
          title: 'TBC - To be Concern Hazard Guidelines',
          content: 'Kategori 1: Deviasi pengoperasian kendaraan/unit'
        }
      },
      {
        type: 'PSPP',
        label: 'PSPP - Peraturan Sanksi Pelanggaran Prosedur',
        category: 'Pelanggaran Prosedur Keselamatan',
        categoryNumber: 4,
        confidence: 90,
        reasoning: 'Deskripsi temuan mengindikasikan adanya potensi bahaya.',
        citation: {
          title: 'PSPP - Peraturan Sanksi Pelanggaran Prosedur',
          content: 'Pasal 4: Pelanggaran Prosedur Keselamatan'
        }
      },
      {
        type: 'GR',
        label: 'Safety Golden Rules',
        category: 'Pengoperasian Kendaraan & Unit',
        categoryNumber: 2,
        confidence: 90,
        reasoning: 'Deskripsi temuan berkaitan dengan aturan pengoperasian kendaraan dan unit.',
        citation: {
          title: 'Safety Golden Rules - Pengoperasian Kendaraan & Unit',
          content: 'Golden Rule #2: Pengoperasian Kendaraan & Unit'
        }
      }
    ]
  },
  {
    id: "HR-2025-336-23919",
    tanggal: "02 Des 2025",
    pelapor: "Rina Marlina",
    lokasi: "(B 56) Area Transportasi",
    lokasiKode: "B56",
    jenisHazard: "APD",
    subJenisHazard: "Tidak menggunakan APD",
    cluster: "C-005",
    site: "BMO 1",
    lokasiArea: "Loading Point",
    detailLokasi: "Area Konstruksi Loading",
    deskripsiTemuan: "Crew tidak menggunakan kacamata safety saat dekat area debu konstruksi.",
    quickAction: "Coaching",
    tanggalPembuatan: "Joko Widodo",
    rolePelapor: "Supervisor",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "Tidak menggunakan kacamata safety",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-02T14:30:00Z",
    labels: ['TBC', 'PSPP'],
    confidenceScore: 91,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "merah",
    slaDueDate: "07 Des 2025",
    duplicateScores: {
      overall: 0.76,
      ruleBased: 0.82,
      geo: 0.85,
      lexical: 0.68,
      semantic: 0.74
    }
  },
  {
    id: "HR-2025-336-23946",
    tanggal: "01 Des 2025",
    pelapor: "Tono Supriyadi",
    lokasi: "(B 56) Area Konstruksi",
    lokasiKode: "B56",
    jenisHazard: "APD",
    subJenisHazard: "Helm tidak dipakai",
    cluster: "C-005",
    site: "BMO 1",
    lokasiArea: "Konstruksi",
    detailLokasi: "Area Konstruksi Baru",
    deskripsiTemuan: "Beberapa pekerja konstruksi tidak menggunakan helm safety.",
    quickAction: "Safety Briefing",
    tanggalPembuatan: "Budi",
    rolePelapor: "Foreman",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "Tidak menggunakan helm",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-01T10:45:00Z",
    labels: ['TBC', 'PSPP'],
    confidenceScore: 93,
    evaluationStatus: "DALAM_EVALUASI",
    evaluatorName: "Citra Evaluator",
    slaStatus: "hijau",
    slaDueDate: "06 Des 2025",
    duplicateScores: {
      overall: 0.80,
      ruleBased: 0.86,
      geo: 0.88,
      lexical: 0.72,
      semantic: 0.78
    }
  },
  {
    id: "HR-2025-336-23947",
    tanggal: "30 Nov 2025",
    pelapor: "Wawan Hermawan",
    lokasi: "(B 56) Area Konstruksi",
    lokasiKode: "B56",
    jenisHazard: "APD",
    subJenisHazard: "Rompi tidak dipakai",
    cluster: "C-005",
    site: "BMO 1",
    lokasiArea: "Konstruksi",
    detailLokasi: "Area Konstruksi Jalan",
    deskripsiTemuan: "Pekerja di area konstruksi tidak menggunakan rompi safety.",
    quickAction: "Warning",
    tanggalPembuatan: "Hadi",
    rolePelapor: "Safety Officer",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "Tidak menggunakan rompi safety",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-30T08:00:00Z",
    labels: ['TBC'],
    confidenceScore: 88,
    evaluationStatus: "SELESAI",
    evaluatorName: "Doni Evaluator",
    slaStatus: "hijau",
    slaDueDate: "05 Des 2025",
    duplicateScores: {
      overall: 0.74,
      ruleBased: 0.80,
      geo: 0.82,
      lexical: 0.66,
      semantic: 0.70
    }
  },
  {
    id: "HR-2025-336-23948",
    tanggal: "29 Nov 2025",
    pelapor: "Yoga Pratama",
    lokasi: "(B 56) Area Konstruksi",
    lokasiKode: "B56",
    jenisHazard: "APD",
    subJenisHazard: "Helm tidak dipakai",
    cluster: "C-005",
    site: "BMO 1",
    lokasiArea: "Konstruksi",
    detailLokasi: "Area Konstruksi Baru",
    deskripsiTemuan: "Mandor dan beberapa pekerja tidak pakai helm di zona konstruksi.",
    quickAction: "Coaching",
    tanggalPembuatan: "Irfan",
    rolePelapor: "Supervisor",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "Tidak menggunakan helm",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-29T13:30:00Z",
    labels: ['TBC', 'PSPP'],
    confidenceScore: 92,
    evaluationStatus: "BELUM_DIEVALUASI",
    slaStatus: "kuning",
    slaDueDate: "04 Des 2025",
    duplicateScores: {
      overall: 0.79,
      ruleBased: 0.84,
      geo: 0.87,
      lexical: 0.70,
      semantic: 0.76
    }
  },
  {
    id: "HR-2025-336-23949",
    tanggal: "28 Nov 2025",
    pelapor: "Zainal Abidin",
    lokasi: "(B 56) Area Konstruksi",
    lokasiKode: "B56",
    jenisHazard: "APD",
    subJenisHazard: "Sepatu tidak layak",
    cluster: "C-005",
    site: "BMO 1",
    lokasiArea: "Konstruksi",
    detailLokasi: "Area Konstruksi Jalan",
    deskripsiTemuan: "Pekerja konstruksi menggunakan sandal bukan safety shoes.",
    quickAction: "APD Check",
    tanggalPembuatan: "Karno",
    rolePelapor: "Safety Officer",
    ketidaksesuaian: "Perlengkapan APD",
    subKetidaksesuaian: "Tidak menggunakan sepatu safety",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-11-28T11:15:00Z",
    labels: ['TBC'],
    confidenceScore: 87,
    evaluationStatus: "SELESAI",
    evaluatorName: "Andi Supervisor",
    slaStatus: "hijau",
    slaDueDate: "03 Des 2025",
    duplicateScores: {
      overall: 0.75,
      ruleBased: 0.81,
      geo: 0.84,
      lexical: 0.67,
      semantic: 0.72
    }
  }
];

export const similarReports = [
  {
    id: "HR-2025-336-23915",
    similarity: 93,
    description: "Pekerja tidak menggunakan APD lengkap di area konstruksi",
    location: "BMO 2 - Area Dumping",
    daysAgo: 6
  },
  {
    id: "HR-2025-336-23916",
    similarity: 93,
    description: "APD tidak digunakan dengan benar di lokasi kerja",
    location: "BMO 2 - Area Dumping",
    daysAgo: 6
  }
];

export const dashboardStats = {
  // AI Pipeline stats
  menungguAnalisisAI: 230,
  sedangDiprosesAI: 45,
  aiGagal: 3,
  batchSisaHariIni: 2,
  
  // Evaluator stats
  totalLaporan: 4127,
  siapDievaluasi: 3241,
  dalamEvaluasi: 156,
  selesai: 680,
  perluReviewUlang: 50,
  
  // Cluster stats
  painPoints: 4,
  totalCluster: 5,
  clusteredReport: 28,
  averageClusterSize: 5.6,
  criticalCluster: 3,
  
  // Performance
  reviewToClosing: 2.6,
  intervalSubmission: 20.4
};

// AI Duplicate Detection Queue
export const aiDuplicateQueueReports: HazardReport[] = [
  // PROCESSING - Analyzing Semantic
  {
    id: "HR-2025-336-23920",
    tanggal: "11 Des 2025",
    pelapor: "Rudi Hartono",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "APD",
    subJenisHazard: "Helm tidak dipakai",
    cluster: null,
    site: "MINING PIT",
    lokasiArea: "Hauling Road",
    detailLokasi: "Jalur Angkut Pit Selatan",
    deskripsiTemuan: "Pekerja tidak menggunakan helm safety di area konstruksi.",
    quickAction: "Warning",
    tanggalPembuatan: "11 Des 2025",
    rolePelapor: "Supervisor",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-11T08:00:00Z",
    duplicateStatus: "SEDANG_ANALISIS_DUPLICATE",
    duplicateScores: {
      overall: 0.78,
      ruleBased: 0.85,
      geo: 0.90,
      lexical: 0.65,
      semantic: 0.72
    }
  },
  // QUEUED - Waiting
  {
    id: "HR-2025-336-23921",
    tanggal: "11 Des 2025",
    pelapor: "Sinta Dewi",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "APD",
    subJenisHazard: "Helm tidak lengkap",
    cluster: null,
    site: "MINING PIT",
    lokasiArea: "Hauling Road",
    detailLokasi: "Jalur Angkut Pit Selatan",
    deskripsiTemuan: "Karyawan tidak memakai helm saat bekerja di area konstruksi.",
    quickAction: "Safety Briefing",
    tanggalPembuatan: "11 Des 2025",
    rolePelapor: "Safety Officer",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-11T08:15:00Z",
    duplicateStatus: "MENUNGGU_ANALISIS_DUPLICATE"
  },
  // QUEUED - Waiting
  {
    id: "HR-2025-336-23922",
    tanggal: "11 Des 2025",
    pelapor: "Ahmad Fauzi",
    lokasi: "(B 66) Area Galian",
    lokasiKode: "B66",
    jenisHazard: "Jalan",
    subJenisHazard: "Jalan berlubang",
    cluster: null,
    site: "MINING PIT",
    lokasiArea: "Pit Area",
    detailLokasi: "Pit 3 Section A",
    deskripsiTemuan: "Terdapat lubang di jalan hauling sekitar 40cm.",
    quickAction: "Road Maintenance",
    tanggalPembuatan: "11 Des 2025",
    rolePelapor: "Road Inspector",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-11T09:00:00Z",
    duplicateStatus: "MENUNGGU_ANALISIS_DUPLICATE"
  },
  // COMPLETED - High Score (Duplikat Kuat)
  {
    id: "HR-2025-336-23923",
    tanggal: "10 Des 2025",
    pelapor: "Budi Santoso",
    lokasi: "(B 67) Workshop",
    lokasiKode: "B67",
    jenisHazard: "APD",
    subJenisHazard: "Sarung tangan",
    cluster: null,
    site: "OFFICE AREA",
    lokasiArea: "Workshop",
    detailLokasi: "Workshop Utama",
    deskripsiTemuan: "Teknisi tidak menggunakan sarung tangan saat bekerja.",
    quickAction: "APD Check",
    tanggalPembuatan: "10 Des 2025",
    rolePelapor: "Teknisi Senior",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-10T10:30:00Z",
    duplicateStatus: "DUPLICATE_SELESAI",
    duplicateScores: {
      overall: 0.88,
      ruleBased: 0.90,
      geo: 0.85,
      lexical: 0.88,
      semantic: 0.90
    }
  },
  // COMPLETED - Medium Score (Mirip Perlu Review)
  {
    id: "HR-2025-336-23924",
    tanggal: "10 Des 2025",
    pelapor: "Eka Putra",
    lokasi: "(B 65) Area Gerbang",
    lokasiKode: "B65",
    jenisHazard: "Kecepatan",
    subJenisHazard: "Speeding",
    cluster: null,
    site: "MINING PIT",
    lokasiArea: "Hauling Road",
    detailLokasi: "Gerbang Utama Site",
    deskripsiTemuan: "Kendaraan melaju kencang di area gerbang.",
    quickAction: "Warning",
    tanggalPembuatan: "10 Des 2025",
    rolePelapor: "Gate Keeper",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-10T11:00:00Z",
    duplicateStatus: "DUPLICATE_SELESAI",
    duplicateScores: {
      overall: 0.78,
      ruleBased: 0.85,
      geo: 0.82,
      lexical: 0.70,
      semantic: 0.75
    }
  },
  // COMPLETED - Very High Score (Duplikat Kuat)
  {
    id: "HR-2025-336-23925",
    tanggal: "10 Des 2025",
    pelapor: "Agus Wijaya",
    lokasi: "(B 69) Jalan Hauling",
    lokasiKode: "B69",
    jenisHazard: "Kecepatan",
    subJenisHazard: "Over Speed",
    cluster: null,
    site: "MINING PIT",
    lokasiArea: "Hauling Road",
    detailLokasi: "Jalur Angkut Pit Utara",
    deskripsiTemuan: "LV melaju 50 km/jam di zona 30 km/jam dekat gerbang.",
    quickAction: "Warning Letter",
    tanggalPembuatan: "10 Des 2025",
    rolePelapor: "Security",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-10T11:30:00Z",
    duplicateStatus: "DUPLICATE_SELESAI",
    duplicateScores: {
      overall: 0.91,
      ruleBased: 0.95,
      geo: 0.88,
      lexical: 0.90,
      semantic: 0.92
    }
  },
  // COMPLETED - Low Score (Tidak Duplikat)
  {
    id: "HR-2025-336-23926",
    tanggal: "09 Des 2025",
    pelapor: "Dewi Sartika",
    lokasi: "(B 70) Area Jetty",
    lokasiKode: "B70",
    jenisHazard: "Elektrikal",
    subJenisHazard: "Kabel terkelupas",
    cluster: null,
    site: "MARINE",
    lokasiArea: "Jetty",
    detailLokasi: "Jetty Utama",
    deskripsiTemuan: "Ditemukan kabel listrik terkelupas di area jetty.",
    quickAction: "Electrical Check",
    tanggalPembuatan: "09 Des 2025",
    rolePelapor: "Electrical Engineer",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-09T14:00:00Z",
    duplicateStatus: "DUPLICATE_SELESAI",
    duplicateScores: {
      overall: 0.35,
      ruleBased: 0.40,
      geo: 0.30,
      lexical: 0.35,
      semantic: 0.38
    }
  },
  // PROCESSING - Analyzing Lexical
  {
    id: "HR-2025-336-23927",
    tanggal: "11 Des 2025",
    pelapor: "Hendra Saputra",
    lokasi: "(B 66) Area Crusher",
    lokasiKode: "B66",
    jenisHazard: "Mesin",
    subJenisHazard: "Pelindung mesin",
    cluster: null,
    site: "PROCESSING PLANT",
    lokasiArea: "Crusher",
    detailLokasi: "Primary Crusher",
    deskripsiTemuan: "Pelindung mesin crusher tidak terpasang dengan benar.",
    quickAction: "Machine Check",
    tanggalPembuatan: "11 Des 2025",
    rolePelapor: "Operator",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-11T07:30:00Z",
    duplicateStatus: "SEDANG_ANALISIS_DUPLICATE",
    duplicateScores: {
      overall: 0,
      ruleBased: 0.60,
      geo: 0.55,
      lexical: 0.58,
      semantic: 0
    }
  },
  // PROCESSING - Analyzing Geo
  {
    id: "HR-2025-336-23928",
    tanggal: "11 Des 2025",
    pelapor: "Irwan Setiawan",
    lokasi: "(B 68) Stockpile",
    lokasiKode: "B68",
    jenisHazard: "Material",
    subJenisHazard: "Tumpahan material",
    cluster: null,
    site: "PROCESSING PLANT",
    lokasiArea: "Stockpile",
    detailLokasi: "Stockpile A",
    deskripsiTemuan: "Material batu bara tumpah di jalan akses stockpile.",
    quickAction: "Cleanup",
    tanggalPembuatan: "11 Des 2025",
    rolePelapor: "Loader Operator",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-11T06:45:00Z",
    duplicateStatus: "SEDANG_ANALISIS_DUPLICATE",
    duplicateScores: {
      overall: 0,
      ruleBased: 0.70,
      geo: 0.65,
      lexical: 0,
      semantic: 0
    }
  },
  // COMPLETED - Low Similarity
  {
    id: "HR-2025-336-23929",
    tanggal: "09 Des 2025",
    pelapor: "Joko Widodo",
    lokasi: "(B 71) Camp Area",
    lokasiKode: "B71",
    jenisHazard: "Kebersihan",
    subJenisHazard: "Sampah berserakan",
    cluster: null,
    site: "CAMP AREA",
    lokasiArea: "Mess Hall",
    detailLokasi: "Ruang Makan",
    deskripsiTemuan: "Sampah organik berserakan di sekitar tempat makan.",
    quickAction: "Cleaning",
    tanggalPembuatan: "09 Des 2025",
    rolePelapor: "Camp Manager",
    aiStatus: "AI_SELESAI",
    timestamp: "2025-12-09T12:00:00Z",
    duplicateStatus: "DUPLICATE_SELESAI",
    duplicateScores: {
      overall: 0.72,
      ruleBased: 0.75,
      geo: 0.70,
      lexical: 0.72,
      semantic: 0.71
    }
  }
];