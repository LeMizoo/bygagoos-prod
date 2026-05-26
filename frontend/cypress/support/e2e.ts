// Commandes personnalisées Cypress
// Les types sont définis dans index.d.ts

// Commande de login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
  });
});

// Commande de logout
Cypress.Commands.add('logout', () => {
  cy.get('button').contains('Déconnexion').click();
  cy.url().should('include', '/auth/login');
});

// Commande pour sélectionner par data-cy
Cypress.Commands.add('getByDataCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});