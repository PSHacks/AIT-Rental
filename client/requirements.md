## Packages
date-fns | Date formatting and manipulation
react-day-picker | Optional dependency for standard date pickers (using native for minimal design but good to have)

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  display: ["var(--font-display)"],
}
API uses /api/v1 prefix as defined in routes manifest
Dates are passed as YYYY-MM-DD strings
