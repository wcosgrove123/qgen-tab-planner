# Dashboard CSS Troubleshooting

## Step 1: Open Browser DevTools

1. Open your app at `http://localhost:5173/#/dashboard`
2. Press `F12` to open DevTools
3. Go to **Elements** tab
4. Find a metric card element

## Step 2: Check if Dashboard CSS is Loaded

In the **Elements** tab:
1. Find `<div class="metric-card">`
2. Look at the **Styles** panel on the right
3. Do you see these styles:
   - `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);`
   - `position: relative;`
   - `overflow: hidden;`

## Step 3: Test if Hover Works

In DevTools:
1. Right-click the `.metric-card` element
2. Select **Force State** → **:hover**
3. Watch if the card lifts up (translateY)

## Expected Behavior

**If styles ARE loaded:**
- You'll see the custom CSS in DevTools Styles panel
- Forcing :hover state will show the lift animation

**If styles are NOT loaded:**
- DevTools will show only basic styles
- No ::before pseudo-element
- No transform on hover

## Quick Fix Test

**Try this in browser console** (F12 → Console tab):

```javascript
// Check if dashboard rendered
console.log(document.querySelector('.dashboard-container'));

// Check if metric cards exist
console.log(document.querySelectorAll('.metric-card').length);

// Check computed styles
const card = document.querySelector('.metric-card');
console.log(window.getComputedStyle(card).transition);
```

**Expected output:**
- First line: Should show `<div class="dashboard-container">...</div>`
- Second line: Should show `4` (four metric cards)
- Third line: Should show `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

If third line shows `all 0.2s ease` or something different, the new CSS isn't loading.

## If CSS Isn't Loading

The problem is likely:
1. **Scoped styles**: The `<style>` tag in dashboard.js might be scoped
2. **CSS specificity**: Global styles in index.html are overriding
3. **Shadow DOM**: Something is isolating the styles

**Solution**: Move CSS to global stylesheet or increase specificity.