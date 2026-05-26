describe('Authentification', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('should display login form', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error with empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-500, .error-message').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-token',
        user: { id: 1, email: 'admin@bygagoos.com', role: 'SUPER_ADMIN' }
      }
    }).as('loginRequest');

    cy.get('input[type="email"]').type('admin@bygagoos.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/admin/dashboard');
  });
});