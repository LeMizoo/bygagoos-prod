describe('Module Taxi', () => {
  beforeEach(() => {
    cy.login('admin@bygagoos.com', 'password123');
    cy.visit('/admin/taxi/vehicles');
  });

  it('should display vehicles list', () => {
    cy.get('h1').should('contain', 'Véhicules');
    cy.get('table').should('be.visible');
  });

  it('should open add vehicle modal', () => {
    cy.contains('Ajouter un véhicule').click();
    cy.get('form').should('be.visible');
    cy.get('input[placeholder*="Immatriculation"]').should('be.visible');
  });

  it('should navigate to drivers page', () => {
    cy.visit('/admin/taxi/drivers');
    cy.get('h1').should('contain', 'Conducteurs');
  });
});