# Specification: PDF API and Capstone Page Tests

## Overview

Add comprehensive test coverage for the PDF download API and the capstone guidelines and rubrics pages to ensure they function correctly and maintain compatibility with future changes.

## Functional Requirements

1. **PDF API Tests**:
   - Verify that the API returns 404 for unknown PDF names
   - Verify that the API returns 200 with the correct PDF file for valid names
   - Verify that the API correctly sets the Content-Disposition header for downloads
   - Verify that the API properly handles path traversal attempts
   - Verify that the API returns 400 for invalid PDF names (non-alphanumeric, non-dash, non-underscore)

2. **Capstone Guidelines Page Tests**:
   - Verify that the page renders correctly for authenticated users
   - Verify that the page shows the correct content and download links
   - Verify that the page redirects unauthenticated users to the login page

3. **Capstone Rubrics Page Tests**:
   - Verify that the page renders correctly for authenticated users
   - Verify that the page shows the correct content and download links
   - Verify that the page redirects unauthenticated users to the login page

## Non-Functional Requirements

- Tests should be fast and reliable
- Tests should use existing test utilities and patterns from the codebase
- Tests should cover both success and error cases
- Tests should be written in TypeScript and use Vitest

## Acceptance Criteria

1. All PDF API tests pass
2. All capstone guidelines page tests pass
3. All capstone rubrics page tests pass
4. `npm test` runs all new tests without errors
5. The existing test suite continues to pass

## Out of Scope

- Adding new features to the PDF API or capstone pages
- Modifying the existing PDF API or capstone pages
- Adding real PDF content (placeholder PDFs are acceptable for testing)
