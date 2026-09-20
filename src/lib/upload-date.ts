type UploadDatedWork = {
  uploadDate?: string;
  year: number;
};

const TIME_ZONE_SUFFIX = /(?:Z|[+-]\d{2}:?\d{2})$/i;

export function workUploadDate(work: UploadDatedWork): string {
  const value = work.uploadDate?.trim();
  if (value && TIME_ZONE_SUFFIX.test(value)) {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) return new Date(timestamp).toISOString();
  }

  const year = work.year >= 1000 && work.year <= 9999 ? work.year : new Date().getUTCFullYear();
  return `${year}-01-01T00:00:00Z`;
}
