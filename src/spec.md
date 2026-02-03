# Specification

## Summary
**Goal:** Update the app’s thumbs-up and thumbs-down inline React icon components to exactly match the user-uploaded `thumb-up.svg` and `thumb-down.svg` designs, and ensure those components are used everywhere thumbs appear.

**Planned changes:**
- Replace the placeholder/generated SVG markup in `frontend/src/components/icons/ThumbsUpIcon.tsx` with the exact SVG markup from `thumb-up.svg`, preserving `className` support on the root `<svg>`.
- Replace the placeholder/generated SVG markup in `frontend/src/components/icons/ThumbsDownIcon.tsx` with the exact SVG markup from `thumb-down.svg`, preserving `className` support on the root `<svg>`.
- Verify the Today screen and History/Journal UI render thumbs exclusively via `ThumbsUpIcon` / `ThumbsDownIcon` (no fallback to older/generated thumb SVGs or image paths).

**User-visible outcome:** Thumbs icons on the Today screen and in History/Journal match the uploaded SVG designs and still respond to existing Tailwind sizing/color classes.
