// ─── Preset images for hero background and document covers ──────────────────
// All images are sourced from Unsplash (free for commercial use, no attribution required).
// URL parameters: w = width, q = quality (1-100), fit = crop mode

export interface PresetImage {
  id: string;
  url: string; // full-size for display
  thumbnail: string; // small for picker grid
  label: string;
}

// ─── Hero Background Presets (wide landscape, Malaysian education themed) ────

export const HERO_PRESET_IMAGES: PresetImage[] = [
  {
    id: "hero-1",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=75&fit=crop",
    label: "Graduation Ceremony",
  },
  {
    id: "hero-2",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&q=75&fit=crop",
    label: "University Campus",
  },
  {
    id: "hero-3",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=75&fit=crop",
    label: "Lecture Hall",
  },
  {
    id: "hero-4",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=75&fit=crop",
    label: "Library Books",
  },
  {
    id: "hero-5",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=75&fit=crop",
    label: "Students Studying",
  },
  {
    id: "hero-6",
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=75&fit=crop",
    label: "Group Discussion",
  },
  {
    id: "hero-7",
    url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=75&fit=crop",
    label: "Campus Architecture",
  },
  {
    id: "hero-8",
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=75&fit=crop",
    label: "Modern Library",
  },
  {
    id: "hero-9",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=75&fit=crop",
    label: "University Aerial View",
  },
  {
    id: "hero-10",
    url: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&q=75&fit=crop",
    label: "Campus Grounds",
  },
  {
    id: "hero-11",
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=75&fit=crop",
    label: "Classroom Teaching",
  },
  {
    id: "hero-12",
    url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=75&fit=crop",
    label: "University Building",
  },
  // ── Malaysia themed ──
  {
    id: "hero-13",
    url: "https://images.unsplash.com/photo-1565440703262-6c57be7c8b6f?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1565440703262-6c57be7c8b6f?w=400&q=75&fit=crop",
    label: "KL Skyline",
  },
  {
    id: "hero-14",
    url: "https://images.unsplash.com/photo-1569974682753-92c3967e0b56?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1569974682753-92c3967e0b56?w=400&q=75&fit=crop",
    label: "KL Modern City",
  },
  {
    id: "hero-15",
    url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=75&fit=crop",
    label: "Putrajaya Mosque",
  },
  {
    id: "hero-16",
    url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&q=75&fit=crop",
    label: "KL Cityscape",
  },
  {
    id: "hero-17",
    url: "https://images.unsplash.com/photo-1570784925399-72c2a0b4e4a0?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1570784925399-72c2a0b4e4a0?w=400&q=75&fit=crop",
    label: "Tropical Campus",
  },
  {
    id: "hero-18",
    url: "https://images.unsplash.com/photo-1508002366005-75a695ee2d17?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1508002366005-75a695ee2d17?w=400&q=75&fit=crop",
    label: "Malaysia Architecture",
  },
  // ── Education & Learning themed ──
  {
    id: "hero-19",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=75&fit=crop",
    label: "Students Collaborating",
  },
  {
    id: "hero-20",
    url: "https://images.unsplash.com/photo-1571260899304-425eee4c7ccc?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1571260899304-425eee4c7ccc?w=400&q=75&fit=crop",
    label: "Student Library",
  },
  {
    id: "hero-21",
    url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=75&fit=crop",
    label: "Library Hall",
  },
  {
    id: "hero-22",
    url: "https://images.unsplash.com/photo-1568667256549-094a56dc85e8?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1568667256549-094a56dc85e8?w=400&q=75&fit=crop",
    label: "Bookshelves",
  },
  {
    id: "hero-23",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&q=75&fit=crop",
    label: "Campus Life",
  },
  {
    id: "hero-24",
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1920&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=75&fit=crop",
    label: "Group Training",
  },
];

// ─── Document Cover Presets (general document/education themed) ──────────────

export const DOCUMENT_COVER_PRESETS: PresetImage[] = [
  {
    id: "cover-1",
    url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&q=75&fit=crop",
    label: "Books Stack",
  },
  {
    id: "cover-2",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&q=75&fit=crop",
    label: "Study Desk",
  },
  {
    id: "cover-3",
    url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=300&q=75&fit=crop",
    label: "Laptop & Coffee",
  },
  {
    id: "cover-4",
    url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&q=75&fit=crop",
    label: "Reading Books",
  },
  {
    id: "cover-5",
    url: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&q=75&fit=crop",
    label: "Writing Notes",
  },
  {
    id: "cover-6",
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&q=75&fit=crop",
    label: "Technology",
  },
  {
    id: "cover-7",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&q=75&fit=crop",
    label: "Office Work",
  },
  {
    id: "cover-8",
    url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&q=75&fit=crop",
    label: "Open Book",
  },
  {
    id: "cover-9",
    url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&q=75&fit=crop",
    label: "Document Papers",
  },
  {
    id: "cover-10",
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&q=75&fit=crop",
    label: "Team Workshop",
  },
  {
    id: "cover-11",
    url: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=300&q=75&fit=crop",
    label: "Abstract Blue",
  },
  {
    id: "cover-12",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?w=300&q=75&fit=crop",
    label: "Gradient Abstract",
  },
  // ── Malaysia & Community themed ──
  {
    id: "cover-13",
    url: "https://images.unsplash.com/photo-1565440703262-6c57be7c8b6f?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1565440703262-6c57be7c8b6f?w=300&q=75&fit=crop",
    label: "Malaysia Cityscape",
  },
  {
    id: "cover-14",
    url: "https://images.unsplash.com/photo-1569974682753-92c3967e0b56?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1569974682753-92c3967e0b56?w=300&q=75&fit=crop",
    label: "KL Towers",
  },
  {
    id: "cover-15",
    url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=300&q=75&fit=crop",
    label: "Putrajaya",
  },
  {
    id: "cover-16",
    url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=300&q=75&fit=crop",
    label: "City View",
  },
  // ── Education & Training themed ──
  {
    id: "cover-17",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&q=75&fit=crop",
    label: "Team Study",
  },
  {
    id: "cover-18",
    url: "https://images.unsplash.com/photo-1571260899304-425eee4c7ccc?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1571260899304-425eee4c7ccc?w=300&q=75&fit=crop",
    label: "Reading Corner",
  },
  {
    id: "cover-19",
    url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&q=75&fit=crop",
    label: "Library Books",
  },
  {
    id: "cover-20",
    url: "https://images.unsplash.com/photo-1568667256549-094a56dc85e8?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1568667256549-094a56dc85e8?w=300&q=75&fit=crop",
    label: "Book Collection",
  },
  {
    id: "cover-21",
    url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=75&fit=crop",
    label: "School Building",
  },
  {
    id: "cover-22",
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&q=75&fit=crop",
    label: "Modern Library",
  },
  {
    id: "cover-23",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&q=75&fit=crop",
    label: "Study Materials",
  },
  {
    id: "cover-24",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&q=75&fit=crop",
    label: "Classroom",
  },
];

// ─── Cover Color Presets ────────────────────────────────────────────────────

export interface CoverColor {
  id: string;
  color: string;
  label: string;
}

export const COVER_COLORS: CoverColor[] = [
  { id: "c-blue", color: "#3b82f6", label: "Blue" },
  { id: "c-indigo", color: "#6366f1", label: "Indigo" },
  { id: "c-purple", color: "#8b5cf6", label: "Purple" },
  { id: "c-pink", color: "#ec4899", label: "Pink" },
  { id: "c-red", color: "#ef4444", label: "Red" },
  { id: "c-orange", color: "#f97316", label: "Orange" },
  { id: "c-amber", color: "#f59e0b", label: "Amber" },
  { id: "c-green", color: "#22c55e", label: "Green" },
  { id: "c-teal", color: "#14b8a6", label: "Teal" },
  { id: "c-cyan", color: "#06b6d4", label: "Cyan" },
  { id: "c-slate", color: "#64748b", label: "Slate" },
  { id: "c-zinc", color: "#71717a", label: "Zinc" },
];
