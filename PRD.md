# PRD: Portfolio Production Polish & Multi-Agent Optimization

## Overview
This document defines discrete, incremental tasks for auditing, securing, and polishing Sanjay's Full-Stack Interactive Portfolio. Ralph Loop and Roo Code will execute these tasks sequentially.

## Task 1: Typecheck and Build Baseline Verification
Run the build pipeline and verify zero TypeScript or Vite compilation errors across client and server.
- Run `npm run build` to confirm client compilation.
- Verify all imported shared types between `src/` and `server/`.
- Ensure no lingering warnings or missing dependencies.

## Task 2: Code Security and Input Validation Audit
Audit backend endpoints in `server/` against CodeRabbit security rules.
- Check authentication middleware for secure cookie extraction and JWT verification.
- Ensure all database queries utilize parameterized queries to prevent SQL injection.
- Ensure sensitive environment variables (`JWT_SECRET`, database passwords) cannot be exposed in error handlers.

## Task 3: Interactive Canvas & 3D Resource Cleanup
Review Three.js and Framer Motion components to guarantee smooth performance and leak-free destruction.
- Verify Three.js scene, geometry, and material disposal on component unmount in `src/components/`.
- Verify resize event listeners are properly removed in cleanup functions.
- Optimize canvas re-renders and frame rate throttling on lower-powered devices.

## Task 4: Media and Image Optimization Pipeline Check
Validate asset management and fallback resilience.
- Verify `scripts/optimize-portfolio-images.mjs` handles missing source images gracefully.
- Ensure image upload endpoints validate MIME types and reject files exceeding size limits.
- Confirm placeholder fallbacks exist for failed network image loads.

## Task 5: Admin Panel Resilience and Error Handling
Improve UX and feedback across the admin interface.
- Add toast notifications or clear inline error states for failed admin actions (project updates, settings save).
- Verify session expiry handles redirect to `/admin/login` cleanly without breaking state.
- Ensure audit logging captures administrative changes without saving passwords or tokens.

## Task 6: Resend Email Notification Integration for Contact Inquiries
Add production-grade email notifications for contact inquiries using Resend.
- Validate submissions and persist to database prior to email dispatch.
- Protect against CRLF header injection and HTML injection.
- Handle Resend API failures gracefully without failing the visitor's submission.
- Preserve Vercel serverless function lightweight footprint.
