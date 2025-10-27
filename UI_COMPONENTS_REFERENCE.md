# 🎨 Modern UI Components - Visual Reference Card

## 📋 Quick Navigation

| Component | Type | Status |
|-----------|------|--------|
| [ModernButton](#modernbutton) | Action | ✅ Ready |
| [ModernInput](#moderninput) | Form | ✅ Ready |
| [ModernCard](#moderncard) | Display | ✅ Ready |
| [ModernModal](#modernmodal) | Overlay | ✅ Ready |
| [ModernBadge](#modernbadge) | Status | ✅ Ready |
| [ModernEmptyState](#modernemptystate) | Feedback | ✅ Ready |
| [ModernLoading](#modernloading) | Feedback | ✅ Ready |
| [ModernSearchBar](#modernsearchbar) | Input | ✅ Ready |
| [ModernToast](#moderntoast) | Notification | ✅ Ready |

---

## ModernButton

### Variants

```
┌─────────────────────────────────────────────────────────────────┐
│  PRIMARY           SECONDARY         OUTLINE         GHOST       │
│  [  Add  ]         [ Next ]          [ Cancel ]      Learn More  │
│  (Blue)            (Teal)            (Bordered)      (No BG)     │
│                                                                  │
│  DANGER                                                          │
│  [ Delete ]                                                      │
│  (Red)                                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Sizes

```
[Save]              [    Save    ]              [         Save         ]
 Small               Medium (default)           Large
```

### States

```
[  Save  ]          [⏳ Saving...]              [  Save  ]
Active              Loading                    Disabled
```

### Usage

```javascript
import { ModernButton } from '../components/ui';

// Basic
<ModernButton text="Save" onPress={handleSave} />

// With Icon
<ModernButton text="Add" icon={Plus} />

// Full Width
<ModernButton text="Continue" fullWidth variant="primary" />

// Loading
<ModernButton text="Saving" loading={isLoading} />

// Danger
<ModernButton text="Delete" variant="danger" />
```

---

## ModernInput

### Types

```
┌─────────────────────────────────────────────────────────────────┐
│  Text Input                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Email *                                                   │   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ Enter email address...                       [✓]  │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │ Password                                                  │   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ ••••••••••                                   [👁]  │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │ Notes                                                     │   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ Add any notes...                                  │   │   │
│  │ │ ...multiline support...                           │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │ Phone                                                     │   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ 0700123456                                         │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  │ ⚠ Phone number must be 10+ digits                       │   │
│  │                                                           │   │
│  │ Invalid Field                                             │   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ value                                    (ERROR)   │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  │ 🔴 This field is required                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### States

```
FOCUSED                 VALID                   ERROR
┌────────────┐          ┌────────────┐          ┌────────────┐
│ value [│]  │          │ value [✓]  │          │ value [✕]  │
└────────────┘          └────────────┘          └────────────┘
(Blue border)           (Green border)           (Red border)

DISABLED
┌────────────┐
│ value      │
└────────────┘
(Gray background)
```

### Usage

```javascript
import { ModernInput } from '../components/ui';

// Basic
<ModernInput
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
/>

// Password
<ModernInput
  label="Password"
  secureTextEntry
/>

// With Validation
<ModernInput
  label="Phone"
  value={phone}
  error={phoneError}
  errorText="Invalid phone"
/>

// Multiline
<ModernInput
  label="Notes"
  multiline
  numberOfLines={4}
/>
```

---

## ModernCard

### Variants

```
DEFAULT                OUTLINED                ELEVATED
┌─────────────────┐    ┏━━━━━━━━━━━━━━━━━┓    ┌─────────────────┐
│ Title           │    ┃ Title           ┃    │ Title           │
│ Subtitle        │    ┃ Subtitle        ┃    │ Subtitle        │
│ Description     │    ┃ Description     ┃    │ Description     │
│ Content area    │    ┃ Content area    ┃    │ Content area    │
└─────────────────┘    ┗━━━━━━━━━━━━━━━━━┛    └─────────────────┘
                                               (Shadow effect)
```

### With Elements

```
┌──────────────────────────────────────┐
│ 📦  Title               [Pending]     │
│     Subtitle                          │
│     Description text here...           │
│     ────────────────────────────────  │
│     [ Action Button ]                │
└──────────────────────────────────────┘
```

### Usage

```javascript
import { ModernCard } from '../components/ui';

// Basic
<ModernCard
  title="Invoice #123"
  subtitle="2024-01-15"
  description="Customer invoice details"
/>

// Pressable
<ModernCard
  title="Customer"
  onPress={() => navigate('Details')}
  pressable
/>

// With Badge
<ModernCard
  title="Measurement"
  badge="Pending"
  badgeColor={modernTheme.warning}
/>

// With Action
<ModernCard
  title="Payment Due"
  actionButton={<ModernButton text="Pay Now" />}
/>
```

---

## ModernModal

### Sizes

```
SMALL               MEDIUM              LARGE               FULLSCREEN
┌──────────────┐    ┌────────────────┐   ┌──────────────────┐ ┌───────┐
│ Title        │    │ Title          │   │ Title            │ │ Title │
│ ────────     │    │ ────────────   │   │ ──────────────── │ │ ────  │
│              │    │                │   │                  │ │       │
│ [Cancel] [OK]│    │ [Cancel] [ OK ]│   │ [Cancel]    [ OK ]│ │ [X]   │
└──────────────┘    └────────────────┘   └──────────────────┘ │ ────  │
                                                              │       │
                                                              │[Cancel]│
                                                              │   OK   │
                                                              └───────┘
```

### Usage

```javascript
import { ModernModal } from '../components/ui';

<ModernModal
  visible={isVisible}
  onClose={handleClose}
  title="Add Customer"
  subtitle="Enter details"
  size="md"
>
  <ModernInput label="Name" />
  <ModernButton text="Save" onPress={handleSave} fullWidth />
</ModernModal>
```

---

## ModernBadge

### Color Variants

```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Primary │ │Success │ │Warning │ │ Error  │ │ Info   │ │Secondary
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
  Blue      Green      Orange      Red      Light Blue  Teal

Outlined Variants:
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Primary │ │Success │ │Warning │ │ Error  │ │ Info   │ │Secondary
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

### Sizes

```
[Sm]          [ Medium ]          [    Large     ]
Small         Default             Large
```

### Usage

```javascript
import { ModernBadge } from '../components/ui';

// Color Variants
<ModernBadge text="Active" variant="success" />
<ModernBadge text="Pending" variant="warning" />
<ModernBadge text="Failed" variant="error" />

// Outlined
<ModernBadge text="New" outline />

// With Icon
<ModernBadge text="Premium" icon={<Star />} />
```

---

## ModernEmptyState

```
┌─────────────────────────────────────┐
│                                     │
│              🔍                     │
│          (Icon)                     │
│                                     │
│    No Results Found                 │
│    (Title)                          │
│                                     │
│   Try searching with a              │
│   different term                    │
│   (Description)                     │
│                                     │
│      [ Add Customer ]               │
│      (Action Button)                │
│                                     │
└─────────────────────────────────────┘
```

### Usage

```javascript
import { ModernEmptyState } from '../components/ui';
import { Search } from 'lucide-react-native';

<ModernEmptyState
  icon={<Search />}
  title="No Customers"
  description="Search or add a new customer"
  actionText="Add Customer"
  onActionPress={handleAdd}
/>
```

---

## ModernLoading

### Inline Mode
```
┌──────────────────────────┐
│    ⏳ Searching...      │
│                          │
└──────────────────────────┘
```

### Fullscreen Mode
```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│           ⏳                             │
│      Loading data...                     │
│                                          │
│                                          │
└──────────────────────────────────────────┘
(Semi-transparent white overlay)
```

### Usage

```javascript
import { ModernLoading } from '../components/ui';

// Inline
<ModernLoading visible={isLoading} message="Searching..." />

// Fullscreen
<ModernLoading
  visible={isLoading}
  fullscreen
  message="Loading..."
/>
```

---

## ModernSearchBar

```
┌────────────────────────────────────────────┐
│ 🔍 Search customers...  [X] [⚡]          │
└────────────────────────────────────────────┘
       ↑                     ↑    ↑
   Search Icon           Clear  Scan Button
                         Button

States:
┌────────────────────────────────────────────┐ Focused (Blue border)
│ 🔍 Search...                               │

┌────────────────────────────────────────────┐ Filled
│ 🔍 ahmad khan                          [X] │

┌────────────────────────────────────────────┐ Loading
│ 🔍 ahmad khan                          [⏳] │
```

### Usage

```javascript
import { ModernSearchBar } from '../components/ui';

<ModernSearchBar
  value={searchTerm}
  onChangeText={setSearchTerm}
  onSearch={handleSearch}
  onScanPress={handleScan}
  loading={isSearching}
  placeholder="Search customers..."
/>
```

---

## ModernToast

### Types

```
SUCCESS                    ERROR
┌──────────────────────┐   ┌──────────────────────┐
│ ✓ Success            │   │ ✕ Error              │
│   Customer added!    │   │   Failed to save     │
│                   [x]│   │                   [x]│
└──────────────────────┘   └──────────────────────┘
(Green left border)        (Red left border)

WARNING                    INFO
┌──────────────────────┐   ┌──────────────────────┐
│ ⚠ Warning            │   │ ℹ Information        │
│   Verify input       │   │   Operation done     │
│                   [x]│   │                   [x]│
└──────────────────────┘   └──────────────────────┘
(Orange left border)       (Blue left border)
```

### Auto-Dismiss Timing

```
SUCCESS     3 seconds
WARNING     3.5 seconds
ERROR       4 seconds
INFO        3 seconds

Positions:
Top         Center      Bottom
[Toast]
            [Toast]
                        [Toast]
```

### Usage

```javascript
import { 
  toastSuccess, 
  toastError, 
  toastWarning, 
  toastInfo 
} from '../utils/toastManager';

// Simple
toastSuccess('Saved!');
toastError('Something went wrong');

// With custom title
toastSuccess('Customer added successfully!', 'Success');

// Custom options
showToast({
  type: 'success',
  title: 'Payment Received',
  message: 'AFN 5000 from customer',
  duration: 4000,
  position: 'top'
});
```

---

## Color Palette

### Primary Colors
```
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Primary     │ │ Primary Light │ │ Primary Dark  │
│  #0066FF      │ │  #E3F2FD      │ │  #0052CC      │
│   (Blue)      │ │  (Very Light) │ │  (Very Dark)  │
└───────────────┘ └───────────────┘ └───────────────┘
```

### Semantic Colors
```
Success         Warning         Error           Info
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  #4CAF50    │ │  #FFA726    │ │  #F44336    │ │  #2196F3    │
│  (Green)    │ │  (Orange)   │ │  (Red)      │ │  (Blue)     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### Neutral Colors
```
Text Dark       Text Secondary  Text Tertiary   Background
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  #1A1A1A    │ │  #666666    │ │  #999999    │ │  #F8F9FA    │
│  (Dark)     │ │  (Gray)     │ │  (Light)    │ │  (Very Light)
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## Spacing System

```
xs: 4px
▪

sm: 8px
▪▪

md: 12px
▪▪▪

lg: 16px
▪▪▪▪

xl: 20px
▪▪▪▪▪

xxl: 24px
▪▪▪▪▪▪

xxxl: 32px
▪▪▪▪▪▪▪▪
```

---

## Button Variants Map

| Variant | Use Case | Color | Example |
|---------|----------|-------|---------|
| **Primary** | Main action | Blue | Save, Submit, Add |
| **Secondary** | Alternative | Teal | Next, Continue |
| **Outline** | Less emphasis | Border | Cancel, Skip |
| **Ghost** | Minimal | Text only | Learn More, Help |
| **Danger** | Destructive | Red | Delete, Logout |

---

## Component Import Reference

```javascript
// Import all
import { 
  ModernButton,
  ModernInput,
  ModernCard,
  ModernModal,
  ModernBadge,
  ModernEmptyState,
  ModernLoading,
  ModernSearchBar,
  ModernToast
} from '../components/ui';

// Import utilities
import { 
  toastSuccess, 
  toastError, 
  toastWarning, 
  toastInfo,
  showToast,
  showAlert,
  showConfirm
} from '../utils/toastManager';

// Import theme
import { modernTheme, typography, spacing, radius, shadows } from '../theme/modernTheme';
```

---

## Common Patterns

### Loading with Button
```javascript
<ModernButton
  text={loading ? "Saving..." : "Save"}
  loading={loading}
  onPress={handleSave}
  disabled={loading}
/>
```

### Form Field with Validation
```javascript
<ModernInput
  label="Email *"
  value={email}
  onChangeText={setEmail}
  error={emailError && !email}
  errorText={emailError}
/>
```

### Data Display Flow
```javascript
{isLoading ? (
  <ModernLoading />
) : data.length > 0 ? (
  <FlatList data={data} renderItem={renderItem} />
) : (
  <ModernEmptyState icon={<Search />} />
)}
```

### Success Notification
```javascript
try {
  await saveData();
  toastSuccess('Saved successfully!');
} catch (error) {
  toastError(error.message);
}
```

---

## Quick Dos and Don'ts

### ✅ DO
- Use theme colors
- Show loading states
- Provide toast feedback
- Add validation errors
- Use semantic variants

### ❌ DON'T
- Hardcode colors
- Skip loading states
- Use Alert.alert()
- Show generic errors
- Mix old/new components

---

## File Locations

```
src/theme/modernTheme.js          ← Design system
src/components/ui/                ← All components
src/components/ui/index.js        ← Exports
src/utils/toastManager.js         ← Toast utilities
src/screens/SearchScreenModern.js ← Example screen
```

---

## Next Steps

1. ✅ Review this reference card
2. ✅ Check MODERN_UI_GUIDE.md for detailed docs
3. ✅ See QUICK_START_MODERN_UI.md for examples
4. ✅ Copy components into your screens
5. ✅ Test on device
6. ✅ Deploy with confidence!

---

Made with ❤️ for Beautiful UX

**Version**: 1.0 | **Status**: ✅ Production Ready