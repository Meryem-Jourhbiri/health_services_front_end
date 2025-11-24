# Milestone 1 – Testing Summary

This document summarizes the testing setup and UI tests implemented for **Milestone 1** of the Healthcare Portal frontend.

## 1. Tools
- **Jest** – test runner  
- **React Testing Library** – component rendering and DOM queries  
- **jest-dom** – extended matchers  
- **ts-jest** – TypeScript support  
- **jsdom** – browser-like environment  

Tests run with:

```bash
npm test
```

## 2. Coverage
Since backend integration is not part of this milestone, authentication and navigation are mocked. Tests focus on verifying that all key UI screens render correctly.

### Authentication Pages
- **Login**: email, password, submit button, navigation link  
- **Signup**: name, email, password, submit button  
- **Forgot Password**: email input, submit button, back-to-login link  
- **Verify Email**: verification message, email from query params, back-to-login button  

### Patient Dashboard
- Renders "Your next appointment"  
- Renders "Quick actions"  
- Includes one **snapshot test**  

## 3. Scope
Milestone 1 testing covers **static UI rendering only**:
- No API calls  
- No redirect logic  
- No protected route logic  

## 4. Summary
A complete Jest + RTL setup is implemented.  
All authentication-related UI pages and the patient dashboard are tested with basic rendering checks and one snapshot test to ensure layout stability.

