# Title Management

## Defaults in Route Configuration

- Titles are defined centrally in the TitleGuard defaults map for top‑level routes.
- Nested routes inherit the most specific matching parent path.

## Dynamic Updates From Components

- Use `useTitle('Page Name')` to set titles dynamically.
- Titles are sanitized and formatted as `Page Name | APP_NAME`.

## Best Practices

- Prefer short descriptive titles.
- For nested pages, pass context in the dynamic title (e.g., `Users – Details`).
- Do not include HTML in titles; it will be stripped.

## Troubleshooting

- Missing defaults: The guard falls back to `/` or `App`.
- Unexpected title: Ensure `useTitle` is called only once per render cycle or memoize the value.

