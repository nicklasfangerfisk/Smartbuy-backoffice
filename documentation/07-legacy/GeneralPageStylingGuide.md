# General Page Styling Guide

This guide outlines the standard styling conventions for content areas and page titles across all desktop pages in the application. Following these guidelines ensures consistency and a cohesive user experience.

## Content Area Styling

- **Padding**:
  - **Top**: Apply a consistent top padding of `24px`.
  - **Left**: Apply a consistent left padding of `24px`.
  - **Right**: Apply a consistent right padding of `24px`.
  - **Bottom**: Bottom padding is defined by the specific page. Pages that require scrolling should ensure sufficient bottom padding to avoid content being cut off.

- **Background**:
  - Use the `background.body` color from the theme for the content area background.

- **Minimum Height**:
  - Set the minimum height of the content area to `100dvh` to ensure full viewport coverage.

- **Border Radius**:
  - No border radius is applied to the content area.

- **Box Shadow**:
  - No box shadow is applied to the content area.

## Page Title Styling

- **Placement**:
  - The page title should be placed at the top of the content area, aligned to the left.

- **Font**:
  - Use the `Typography` component with the `level="h2"` property.

- **Font Size**:
  - Use the `xlarge` font size from the theme.

- **Margin**:
  - Apply a bottom margin of `16px` (`mb: 2`) to the title to create spacing between the title and subsequent content.

## Consistency Between Pages

- Ensure consistent padding across pages by aligning the `Box` padding styles.
  - For pages like `PageOrderDesktop`, use `pl: 0, pr: 0` to remove left and right padding.
  - Avoid using `p: 4` if it creates visual inconsistencies with other pages.

- Always verify padding alignment visually to maintain a cohesive layout.

## Use of the General PageLayout Component

- Always wrap the main content of a page with the `PageLayout` component to ensure consistent outer padding and alignment across all pages.
- The `PageLayout` component automatically applies:
  - **Padding**: Standardized outer padding for left, right, and top.
  - **Background**: The `background.body` color from the theme.
  - **Full Height**: Ensures the content area spans the full viewport height (`100dvh`).

- Example:

```tsx
<PageLayout>
  <Box
    sx={{
      width: '100%',
      minHeight: '100dvh',
      bgcolor: 'background.body',
      borderRadius: 0,
      boxShadow: 'none',
      pl: 0,
      pr: 0,
    }}
  >
    <Typography level="h2" sx={{ mb: 2, fontSize: 'xlarge' }}>
      Page Title
    </Typography>
    {/* Content goes here */}
  </Box>
</PageLayout>
```

## Example Usage

```tsx
<Box
  sx={{
    width: '100%',
    minHeight: '100dvh',
    bgcolor: 'background.body',
    borderRadius: 0,
    boxShadow: 'none',
    p: 0,
  }}
>
  <Typography level="h2" sx={{ mb: 2, fontSize: 'xlarge' }}>
    Page Title
  </Typography>
  {/* Content goes here */}
</Box>
```
