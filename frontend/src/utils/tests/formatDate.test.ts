// Fonctions à tester
const formatDate = (date: Date, locale: string = 'fr-FR'): string => {
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('fr-FR') + ' Ar';
};

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

describe('formatDate', () => {
  it('should format date in French format', () => {
    const date = new Date(2024, 4, 15);
    expect(formatDate(date)).toBe('15/05/2024');
  });

  it('should handle different dates', () => {
    const date = new Date(2024, 11, 25);
    expect(formatDate(date)).toBe('25/12/2024');
  });

  it('should handle edge cases', () => {
    const date = new Date(2024, 0, 1);
    expect(formatDate(date)).toBe('01/01/2024');
  });
});

describe('formatCurrency', () => {
  it('should format number with Ar suffix', () => {
    expect(formatCurrency(15000)).toBe('15 000 Ar');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('0 Ar');
  });

  it('should handle large numbers', () => {
    expect(formatCurrency(1250000)).toBe('1 250 000 Ar');
  });

  it('should handle decimal numbers', () => {
    expect(formatCurrency(1250.5)).toBe('1 250,5 Ar');
  });
});

describe('formatDateTime', () => {
  it('should format date and time', () => {
    const date = new Date(2024, 4, 15, 14, 30);
    expect(formatDateTime(date)).toBe('15/05/2024 14:30');
  });
});