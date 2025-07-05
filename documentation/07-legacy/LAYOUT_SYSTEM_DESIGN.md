# Rock-Solid Layout System Design

## 🎯 Core Principles

### 1. **Single Source of Truth**
- App.tsx controls ALL layout logic
- Pages are pure content containers 
- No layout logic in individual pages

### 2. **LLM-Friendly Contract**
```tsx
// RULE: All page components follow this exact pattern
const PageExample = () => {
  return (
    <PageContainer>
      <PageHeader title="Page Title" />
      <PageContent>
        {/* All page content goes here */}
        {/* Never add Box, padding, width, height, overflow */}
        {/* Just focus on business logic */}
      </PageContent>
    </PageContainer>
  );
};
```

### 3. **Zero Layout Confusion**
- `PageContainer` = Handles ALL layout (padding, width, scroll, responsive)
- `PageHeader` = Consistent header with title + optional actions
- `PageContent` = Pure content area, no layout concerns

## 🏗️ Implementation

### Layout Components (src/layouts/)

1. **PageContainer.tsx** - Master layout controller
2. **PageHeader.tsx** - Consistent page headers  
3. **PageContent.tsx** - Content area wrapper

### App.tsx Changes
- Remove all conditional padding logic
- Remove PageLayout completely
- Simplify to just Sidebar + PageContainer routing

### Page Component Rules
- ✅ DO: Use PageContainer/PageHeader/PageContent
- ❌ DON'T: Add Box, sx props, padding, width, overflow
- ❌ DON'T: Import PageLayout or create custom containers

## 🤖 LLM Benefits

1. **Predictable Pattern**: Every page looks identical in structure
2. **No Layout Decisions**: LLM never needs to think about layout
3. **Zero Breaking**: Impossible to break layout by mistake  
4. **Consistent Behavior**: All pages behave identically
5. **Easy Debugging**: Single place to fix layout issues

## 📱 Responsive Handling

PageContainer automatically handles:
- Desktop: Sidebar + content area
- Mobile: Full width + bottom navigation
- Tablet: Adaptive behavior
- Scroll: Single scroll container, no conflicts

## 🔧 Migration Path

1. Create new layout components
2. Update App.tsx to use new system
3. Convert one page at a time 
4. Remove old PageLayout
5. Update all pages to new pattern

This system eliminates ALL layout confusion and makes it impossible for LLMs to break the layout.
