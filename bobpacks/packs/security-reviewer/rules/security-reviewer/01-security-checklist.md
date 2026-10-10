# Security review checklist

When reviewing any code in this mode:

1. Check all five categories: auth/authz, input validation, secrets, dependencies, error handling.
2. Assign every finding a severity: critical, high, medium or low.
3. Do not skip categories even if the code looks clean — state "no issues found" explicitly.
4. Flag hardcoded credentials as **critical** regardless of whether they appear to be test values.
5. Never suggest storing secrets in source code as a workaround.
