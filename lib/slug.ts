export function toSlug(text: string): string {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Builds: /equipment/genie-gs-1930-scissor-lift
export function buildEquipmentUrl(item: {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
}): string {
  const slug =
    toSlug(item.slug || "") ||
    toSlug(item.name || item.title || "");

  if (slug) {
    return `/equipment/${slug}`;
  }

  const fallbackId = String(item._id || item.id || "").trim();
  return fallbackId ? `/equipment/${fallbackId}` : "/equipment";
}

export function isObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(String(value || "").trim());
}

// Normalizes the dynamic route param (slug or legacy <slug>-<24hexId> or raw <24hexId>)
export function extractSlugOrId(slugOrId: string): {
  slug: string;
  id: string | null;
  isIdOnly: boolean;
} {
  const raw = decodeURIComponent(String(slugOrId || "")).trim();
  if (!raw) {
    return { slug: "", id: null, isIdOnly: false };
  }

  if (isObjectId(raw)) {
    return { slug: "", id: raw, isIdOnly: true };
  }

  // Also supports legacy /equipment/<slug>-<24hexId> if an old link is visited
  const trailingIdMatch = raw.match(/^(.*?)-([a-f\d]{24})$/i);
  if (trailingIdMatch) {
    return {
      slug: toSlug(trailingIdMatch[1]),
      id: trailingIdMatch[2],
      isIdOnly: false,
    };
  }

  return {
    slug: toSlug(raw),
    id: null,
    isIdOnly: false,
  };
}