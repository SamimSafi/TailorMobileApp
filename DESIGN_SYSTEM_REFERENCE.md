# XposeMobileApp - Design System Quick Reference

---

## 🎨 Color Palette

### Primary Colors (Modern Blue)
```javascript
#0066FF   - Primary (Primary actions, links, active states)
#E3F2FD   - Primary Light (Backgrounds, subtle highlights)
#0052CC   - Primary Dark (Hover states, disabled)
```

### Secondary Colors (Teal)
```javascript
#00BCD4   - Secondary (Secondary actions, highlights)
#E0F7FA   - Secondary Light (Secondary backgrounds)
#00ACC1   - Secondary Dark (Secondary hover/disabled)
```

### Semantic Colors
```javascript
#4CAF50   - Success (Confirmations, positive actions)
#E8F5E9   - Success Light

#FFA726   - Warning (Cautions, warnings)
#FFF3E0   - Warning Light

#F44336   - Error (Errors, deletions, failures)
#FFEBEE   - Error Light

#2196F3   - Info (Information, alerts)
#E3F2FD   - Info Light
```

### Neutral Colors
```javascript
#FFFFFF   - White (Background, surfaces)
#F8F9FA   - Background (App background)
#F5F5F5   - Surface Variant (Cards, sections)
#E8E8E8   - Border (Lines, dividers)
#F0F0F0   - Divider (Visual separators)

#1A1A1A   - Text (Primary text)
#666666   - Text Secondary (Secondary text)
#999999   - Text Tertiary (Tertiary text)
#BDBDBD   - Disabled Text (Disabled state text)

#E0E0E0   - Disabled (Disabled components)
#000000   - Black (Pure black for contrast)
```

---

## 📏 Spacing System

| Token | Value | Use Case |
|-------|-------|----------|
| **xs** | 4px | Tight spacing, small gaps |
| **sm** | 8px | Small padding, icon spacing |
| **md** | 12px | Standard padding |
| **lg** | 16px | Large padding, section margins |
| **xl** | 20px | Extra large spacing |
| **xxl** | 24px | 2XL spacing |
| **xxxl** | 32px | 3XL spacing, major sections |

### Usage Examples:
```javascript
// padding
paddingHorizontal: spacing.md,     // 12px
paddingVertical: spacing.sm,       // 8px
padding: spacing.lg,                // 16px

// margin
marginBottom: spacing.md,           // 12px
marginHorizontal: spacing.lg,       // 16px

// gaps in flexbox
gap: spacing.sm,                    // 8px
```

---

## 🎭 Typography System

### Display (Headlines)
| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|------------|-----------------|
| Display Large | 36px | 700 | 44px | 0 |
| Display Medium | 28px | 700 | 36px | 0 |
| Display Small | 24px | 700 | 32px | 0 |

**Use for:** App title, major headlines

### Headline
| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|------------|-----------------|
| Headline Large | 22px | 700 | 28px | 0 |
| Headline Medium | 20px | 600 | 26px | 0 |
| Headline Small | 18px | 600 | 24px | 0 |

**Use for:** Section titles, screen headers

### Title
| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|------------|-----------------|
| Title Large | 18px | 600 | 24px | 0 |
| Title Medium | 16px | 600 | 22px | 0.15 |
| Title Small | 14px | 600 | 20px | 0.1 |

**Use for:** Card titles, form labels

### Body (Content)
| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|------------|-----------------|
| Body Large | 16px | 400 | 24px | 0.15 |
| Body Medium | 14px | 400 | 20px | 0.25 |
| Body Small | 12px | 400 | 16px | 0.4 |

**Use for:** Main content, descriptions

### Label (Button text, small labels)
| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|------------|-----------------|
| Label Large | 14px | 500 | 20px | 0.1 |
| Label Medium | 12px | 500 | 16px | 0.5 |
| Label Small | 11px | 500 | 16px | 0.5 |

**Use for:** Button text, form labels, badges

### Usage Example:
```javascript
import { modernTheme, typography } from '../theme/modernTheme';

<Text style={typography.titleLarge}>Customer Name</Text>
<Text style={typography.bodyMedium}>Phone: 0300-1234567</Text>
<Text style={typography.labelMedium}>BALANCE</Text>
```

---

## 🔲 Border Radius System

| Token | Value | Use Case |
|-------|-------|----------|
| **none** | 0px | Squared corners |
| **xs** | 4px | Small radius (buttons, small elements) |
| **sm** | 8px | Standard radius |
| **md** | 12px | Medium radius (cards, modals) |
| **lg** | 16px | Large radius (large modals, sections) |
| **xl** | 20px | Extra large radius |
| **full** | 9999px | Perfect circles |

### Usage Examples:
```javascript
import { modernTheme, radius } from '../theme/modernTheme';

// Button with small radius
borderRadius: radius.xs,            // 4px

// Card with medium radius
borderRadius: radius.md,            // 12px

// Avatar circle
width: 50,
height: 50,
borderRadius: radius.full,          // Circle
```

---

## 🌑 Shadow/Elevation System

### Small Shadow
```javascript
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 2,
```
**Use for:** Hover states, subtle layers

### Medium Shadow
```javascript
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,
shadowRadius: 8,
elevation: 4,
```
**Use for:** Cards, modals, standard elevation

### Large Shadow
```javascript
shadowColor: '#000',
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.2,
shadowRadius: 12,
elevation: 8,
```
**Use for:** Floating action buttons, overlays, prominent elements

### Usage Example:
```javascript
import { shadows } from '../theme/modernTheme';

<View style={[styles.card, shadows.medium]}>
  {/* Card content */}
</View>
```

---

## 🧩 Component Styling Examples

### ModernButton

**Primary Button:**
```javascript
<ModernButton
  title="Submit"
  onPress={handleSubmit}
  variant="primary"
/>
// Styling:
// - Background: #0066FF
// - Text: white, labelLarge
// - Padding: md horizontal, sm vertical
// - Radius: xs (4px)
// - Shadow: medium
```

**Secondary Button:**
```javascript
<ModernButton
  title="Cancel"
  variant="secondary"
/>
// Styling:
// - Background: transparent
// - Border: 1px #0066FF
// - Text: #0066FF, labelLarge
```

### ModernCard

```javascript
<ModernCard>
  <Text style={typography.titleMedium}>Customer Name</Text>
  <Text style={typography.bodyMedium}>Details...</Text>
</ModernCard>
// Styling:
// - Background: #FFFFFF
// - Border radius: md (12px)
// - Shadow: medium
// - Padding: lg (16px)
// - Margin bottom: md (12px)
```

### ModernInput

```javascript
<ModernInput
  placeholder="Enter customer name..."
  value={name}
  onChangeText={setName}
/>
// Styling:
// - Background: #F5F5F5
// - Border: 1px #E8E8E8
// - Border radius: sm (8px)
// - Padding: md (12px)
// - Text: bodyLarge
// - Placeholder: textTertiary
```

### ModernBadge (Status Indicators)

```javascript
<ModernBadge status="success" text="Paid" />
// Green (#4CAF50) background with white text

<ModernBadge status="warning" text="Pending" />
// Orange (#FFA726) background with white text

<ModernBadge status="error" text="Overdue" />
// Red (#F44336) background with white text

<ModernBadge status="info" text="Active" />
// Blue (#2196F3) background with white text
```

### ModernModal

```javascript
<ModernModal
  visible={isOpen}
  onClose={handleClose}
  title="Add Customer"
>
  <ModernInput placeholder="Name" />
  <ModernButton title="Add" onPress={handleAdd} />
</ModernModal>
// Styling:
// - Background: white with overlay
// - Border radius: lg (16px)
// - Shadow: large
// - Title: headlineSmall
```

---

## 📐 Layout Patterns

### Card Layout
```javascript
<View style={{
  backgroundColor: modernTheme.white,
  borderRadius: radius.md,
  padding: spacing.lg,
  marginBottom: spacing.md,
  ...shadows.medium,
}}>
  <Text style={typography.titleMedium}>Title</Text>
  <Text style={typography.bodySmall}>Content</Text>
</View>
```

### List Item Layout
```javascript
<TouchableOpacity style={{
  flexDirection: 'row',
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: modernTheme.divider,
  alignItems: 'center',
}}>
  <View style={{ flex: 1 }}>
    <Text style={typography.titleMedium}>Primary</Text>
    <Text style={[typography.bodySmall, { color: modernTheme.textSecondary }]}>
      Secondary
    </Text>
  </View>
  <View style={{ padding: spacing.md }}>
    {/* Action or badge */}
  </View>
</TouchableOpacity>
```

### Header Layout
```javascript
<View style={{
  backgroundColor: modernTheme.primary,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xl,
  paddingTop: spacing.xxxl,
}}>
  <Text style={[typography.displayMedium, { color: modernTheme.white }]}>
    App Title
  </Text>
</View>
```

### Form Layout
```javascript
<View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
  <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
    Form Title
  </Text>
  
  <ModernInput placeholder="Field 1" style={{ marginBottom: spacing.md }} />
  <ModernInput placeholder="Field 2" style={{ marginBottom: spacing.lg }} />
  
  <ModernButton title="Submit" onPress={handleSubmit} />
</View>
```

---

## 🎯 Component Variants & States

### Button States
```javascript
// Normal
background: #0066FF, opacity: 1

// Hover/Pressed
background: #0052CC (darker), opacity: 0.9

// Disabled
background: #E0E0E0, opacity: 0.5

// Loading
background: #0066FF, shows spinner
```

### Input States
```javascript
// Default
border: 1px #E8E8E8
background: #F5F5F5
textColor: #1A1A1A

// Focused
border: 2px #0066FF
background: #FFFFFF

// Error
border: 2px #F44336
background: #FFEBEE

// Disabled
border: 1px #E0E0E0
background: #F0F0F0
textColor: #BDBDBD
```

### Badge Variants
| Status | Background | Text Color |
|--------|-----------|-----------|
| **success** | #4CAF50 | white |
| **warning** | #FFA726 | white |
| **error** | #F44336 | white |
| **info** | #2196F3 | white |
| **default** | #E0E0E0 | #1A1A1A |

---

## 🚀 Implementation Checklist

When building new screens:

- [ ] Import `modernTheme, typography, spacing, radius, shadows`
- [ ] Use spacing scale for all paddings/margins
- [ ] Apply typography styles from system
- [ ] Use color tokens from modernTheme
- [ ] Add shadows for elevation
- [ ] Use radius for rounded corners
- [ ] Follow component patterns
- [ ] Test on light theme
- [ ] Verify color contrast (WCAG AA minimum)
- [ ] Check mobile and tablet layouts

---

## 🔗 Import Statements

```javascript
// Always import the theme system
import { 
  modernTheme,    // Colors, text colors, disabled states
  typography,     // Font sizes, weights, line heights
  spacing,        // Padding, margin scale
  radius,         // Border radius values
  shadows,        // Elevation system
} from '../theme/modernTheme';

// Use in StyleSheet
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: modernTheme.background,
  },
  card: {
    backgroundColor: modernTheme.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.medium,
  },
  title: typography.titleLarge,
  subtitle: [typography.bodyMedium, { color: modernTheme.textSecondary }],
});
```

---

## 💡 Design Tips

1. **Consistency:** Always use the spacing scale, never hardcode values
2. **Hierarchy:** Use typography system to create visual hierarchy
3. **Color Contrast:** Ensure text has sufficient contrast (WCAG AA)
4. **Whitespace:** Use spacing scale to create breathing room
5. **Shadows:** Use shadows to indicate interactivity and depth
6. **Border Radius:** Keep consistent with the design system
7. **Touch Targets:** Minimum 44px height for buttons/interactive elements
8. **Responsive:** Test layouts on different device sizes

---

## 📱 Responsive Design

The spacing and typography scale work across all device sizes because they use absolute pixels. Test on:

- Small phones: 320px width
- Standard phones: 375-412px width
- Large phones: 480px+ width
- Tablets: 600px+ width

Adjust layouts using flexbox and percentage-based widths as needed.

---

## 🎯 Quick Start Example

```javascript
import { View, Text, StyleSheet } from 'react-native';
import ModernButton from '../components/ui/ModernButton';
import { modernTheme, typography, spacing, radius, shadows } from '../theme/modernTheme';

export default function ExampleScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Customer Details</Text>
        <Text style={styles.subtitle}>Phone: 0300-1234567</Text>
        <Text style={styles.body}>Balance: Rs. 5,000</Text>
      </View>
      
      <ModernButton 
        title="Edit Customer" 
        onPress={() => {}} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    backgroundColor: modernTheme.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  title: typography.titleLarge,
  subtitle: [typography.bodyMedium, { color: modernTheme.textSecondary }],
  body: typography.bodyMedium,
});
```

This design system ensures consistency, maintainability, and a professional appearance across the entire app!