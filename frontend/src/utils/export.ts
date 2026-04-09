export const exportToCSV = (data: any[], filename: string = 'export.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from all objects
  const keys = Array.from(
    new Set(data.flatMap(obj => Object.keys(obj)))
  ) as string[];

  // Create CSV header
  const header = keys.map(key => `"${key}"`).join(',');

  // Create CSV rows
  const rows = data.map(obj =>
    keys.map(key => {
      const value = obj[key];
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
