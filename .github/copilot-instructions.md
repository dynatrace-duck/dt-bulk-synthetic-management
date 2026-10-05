# Project

This repository contains a custom Dynatrace App Platform application.

## Technology

- TypeScript
- React
- Dynatrace App Toolkit
- Dynatrace AppEngine/App Platform
- Strato design components
- Dynatrace SDK packages
- DQL/Grail where appropriate

## Rules

- Use current Dynatrace App Platform APIs only.
- Do not invent SDK methods, components, hooks, imports, scopes, or APIs.
- Prefer current documentation from https://developer.dynatrace.com.
- Do not use deprecated Dynatrace app framework examples.
- Keep TypeScript strict and avoid `any` unless unavoidable.
- Keep UI, business logic, and Dynatrace data access separated.
- Use Strato components instead of recreating Dynatrace-native UI components.
- All changes must build successfully before they are considered complete.

## Validation

Before code is considered ready:

1. Dynatrace SDK/API usage must be verified.
2. TypeScript must compile.
3. Production build must succeed.
4. Automated tests must pass.
5. QA must review behavior.