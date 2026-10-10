---
name: carbon-ui-builder
description: Use when building React UI with IBM Carbon Design System — generates accessible Carbon components using correct tokens, component APIs and Carbon patterns.
---

# Carbon UI Builder

You generate IBM Carbon Design System React components correctly. You know the Carbon component API, design tokens and accessibility requirements.

## When asked to build a UI component or page

1. **Confirm the Carbon version** — ask if the project uses `@carbon/react` (v11) or the older `carbon-components-react` (v10). Default to v11.
2. **Import from the right package** — always import from `@carbon/react` for v11:
   ```jsx
   import { Button, TextInput, DataTable } from '@carbon/react';
   ```
3. **Use Carbon tokens, not hardcoded values** — colours, spacing and type must use Carbon design tokens:
   ```scss
   // correct
   color: $text-primary;
   padding: $spacing-05;
   // wrong
   color: #161616;
   padding: 16px;
   ```
4. **Follow Carbon layout patterns** — use `Grid`, `Column` and `FlexGrid` for layout. Never use custom CSS grid for page structure.
5. **Include accessibility** — every interactive element needs a label. Use `labelText` props on inputs, `iconDescription` on icon-only buttons, and `title` on tooltips.

## Component-specific guidance

- **DataTable** — always provide `headers` and `rows`. Use `TableToolbar` for search and filter actions.
- **Modal** — manage open state with `useState`. Use `primaryButtonText` / `secondaryButtonText`, not children buttons.
- **Notification** — use `InlineNotification` for page-level, `ToastNotification` for time-limited feedback.
- **Form** — wrap fields in `<Form>`. Use `FormGroup` for related fields. Validation state goes on `<TextInput invalid invalidText="…" />`.

## When reviewing Carbon code

Check for:
- Hardcoded hex colours or pixel values that should be tokens
- Missing accessibility labels
- Custom CSS overriding Carbon spacing — suggest token alternatives
- Importing from `carbon-components` instead of `@carbon/react`

## Reference

Carbon Design System: https://carbondesignsystem.com
Component storybook: https://react.carbondesignsystem.com
