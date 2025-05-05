/// <reference types="cypress" />
describe('Package Purchase Flow', () => {
  beforeEach(() => {
    // Reset database state
    cy.task('db:seed');
    
    // Mock Stripe
    cy.intercept('POST', '/api/checkout/sessions', {
      statusCode: 200,
      body: {
        url: '/purchases/success?purchase_id=test-purchase-id',
      },
    }).as('createCheckout');
  });

  it('should handle unauthenticated purchase attempt', () => {
    // Visit package details page
    cy.visit('/packages/test-package-id');

    // Click purchase button
    cy.findByRole('button', { name: /purchase/i }).click();

    // Should redirect to login
    cy.url().should('include', '/login');

    // Should store intended purchase in session storage
    cy.window().then((win: Cypress.AUTWindow) => {
      expect(win.sessionStorage.getItem('intended_purchase')).to.equal('test-package-id');
    });
  });

  it('should complete purchase flow for authenticated user', () => {
    // Log in
    cy.login('test@example.com', 'password');

    // Visit package details page
    cy.visit('/packages/test-package-id');

    // Verify package details
    cy.findByRole('heading').should('contain', 'Test Package');
    cy.findByText(/100\.00/).should('exist');
    cy.findByText(/60 minutes/).should('exist');

    // Click purchase button
    cy.findByRole('button', { name: /purchase/i }).click();

    // Should create checkout session
    cy.wait('@createCheckout');

    // Should redirect to success page
    cy.url().should('include', '/purchases/success');

    // Verify success page content
    cy.findByRole('heading', { name: /purchase successful/i }).should('exist');
    cy.findByText(/next steps/i).should('exist');

    // Contact information should be hidden initially
    cy.findByText(/test@consultant.com/).should('not.exist');

    // Click to reveal contact info
    cy.findByRole('button', { name: /view contact information/i }).click();

    // Contact information should be visible
    cy.findByText(/test@consultant.com/).should('exist');
    cy.findByText(/\+1234567890/).should('exist');

    // Click Calendly button
    cy.findByRole('button', { name: /schedule your session/i }).click();

    // Should open Calendly in new tab
    cy.window().then((win: Cypress.AUTWindow) => {
      expect(win.open).to.be.calledWith(
        'https://calendly.com/test/meeting',
        '_blank'
      );
    });
  });

  it('should handle failed purchase attempt', () => {
    // Mock failed checkout
    cy.intercept('POST', '/api/checkout/sessions', {
      statusCode: 500,
      body: { error: 'Failed to create checkout session' },
    }).as('createCheckoutError');

    // Log in
    cy.login('test@example.com', 'password');

    // Visit package details page
    cy.visit('/packages/test-package-id');

    // Click purchase button
    cy.findByRole('button', { name: /purchase/i }).click();

    // Should show error toast
    cy.findByText(/failed to initiate purchase/i).should('exist');

    // Should stay on package page
    cy.url().should('include', '/packages/test-package-id');
  });

  it('should handle inactive packages', () => {
    // Log in
    cy.login('test@example.com', 'password');

    // Visit inactive package page
    cy.visit('/packages/inactive-package-id');

    // Purchase button should be disabled
    cy.findByRole('button', { name: /currently unavailable/i })
      .should('exist')
      .should('be.disabled');
  });

  it('should track contact and scheduling actions', () => {
    // Mock tracking endpoints
    cy.intercept('POST', '/api/purchases/*/contact', {
      statusCode: 200,
      body: { success: true },
    }).as('trackContact');

    cy.intercept('POST', '/api/purchases/*/schedule', {
      statusCode: 200,
      body: { success: true },
    }).as('trackSchedule');

    // Log in and visit success page
    cy.login('test@example.com', 'password');
    cy.visit('/purchases/success?purchase_id=test-purchase-id');

    // Click to view contact info
    cy.findByRole('button', { name: /view contact information/i }).click();

    // Should track contact view
    cy.wait('@trackContact');

    // Click to schedule
    cy.findByRole('button', { name: /schedule your session/i }).click();

    // Should track scheduling
    cy.wait('@trackSchedule');
  });
});
