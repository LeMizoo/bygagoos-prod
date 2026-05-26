describe('Module Restaurant', () => {
  beforeEach(() => {
    cy.login('admin@bygagoos.com', 'password123');
  });

  it('should display stock management', () => {
    cy.visit('/admin/restaurant/stock');
    cy.get('h1').should('contain', 'Gestion des stocks');
  });

  it('should display tables plan', () => {
    cy.visit('/admin/restaurant/tables');
    cy.get('h1').should('contain', 'Plan des tables');
  });

  it('should add new product to stock', () => {
    cy.visit('/admin/restaurant/stock');
    cy.contains('Ajouter un produit').click();
    cy.get('input[placeholder="Nom du produit"]').type('Tomates');
    cy.get('button[type="submit"]').click();
    cy.contains('Tomates').should('be.visible');
  });
});