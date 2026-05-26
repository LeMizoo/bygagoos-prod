describe('Tableau de bord', () => {
  beforeEach(() => {
    cy.login('admin@bygagoos.com', 'password123');
    cy.visit('/admin/dashboard');
  });

  it('should display dashboard title', () => {
    cy.contains('Tableau de bord').should('be.visible');
  });

  it('should display KPI cards', () => {
    cy.get('.grid-cols-1.md\\:grid-cols-4').within(() => {
      cy.get('.bg-white.rounded-xl').should('have.length.at.least', 3);
    });
  });

  it('should navigate to Ink dashboard', () => {
    cy.contains('Dashboard Ink').click();
    cy.url().should('include', '/ink/dashboard');
  });

  it('should navigate to Trans dashboard', () => {
    cy.contains('Dashboard Trans').click();
    cy.url().should('include', '/trans/dashboard');
  });

  it('should navigate to CDA dashboard', () => {
    cy.contains('Dashboard CDA').click();
    cy.url().should('include', '/cda/dashboard');
  });
});