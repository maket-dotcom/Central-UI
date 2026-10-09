# Tailwind CSS Canonical Classes Rule

## Directive
Always write canonical Tailwind CSS classes instead of arbitrary pixel values in brackets `[...]`.
Whenever `pixel_value / 4` equals an integer or standard decimal (`.5`, `.25`, `.75`), you MUST use the canonical class.

## Examples
- Instead of `w-[150px]`, write `w-37.5`
- Instead of `min-w-[200px]`, write `min-w-50`
- Instead of `min-w-[220px]`, write `min-w-55`
- Instead of `w-[160px]`, write `w-40`
- Instead of `w-[140px]`, write `w-35`
- Instead of `w-[240px]`, write `w-60`
- Instead of `w-[300px]`, write `w-75`
- Instead of `h-[400px]`, write `h-100`

Do NOT use arbitrary bracket notation `[...]` for standard 4px multiples as it generates `tailwindcss(suggestCanonicalClasses)` IDE warnings.
