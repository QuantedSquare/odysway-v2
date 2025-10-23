# Troubleshooting: Dataset Returning Null

## Problem
When switching to the `preprod` dataset, queries return `null` even though content exists.

## Common Causes

### 1. The `published` Field Issue ⭐ Most Likely
Your query uses `published == true` as a filter, but:
- The `published` field might not be set in the preprod dataset
- The field might be `false` or `undefined` in preprod
- The field structure might be different between datasets

**Solution:** Check if voyages in preprod have `published: true` set.

### 2. Dataset Permissions
The preprod dataset might require authentication/token.

### 3. Different Content Structure
Preprod might have different field names or structure.

## Debugging Steps (Now in /test Page)

### Step 1: Check Console Logs
Open your browser console and switch datasets. You'll see:
```
🔧 Creating Sanity client with config: {...}
📊 Fetching from dataset: preprod
📝 Query: *[_type == "voyage" && published == true]...
✅ Data received: null
⚠️ Query returned null/empty for dataset: preprod
```

### Step 2: Check "All Voyages" Section
The test page now shows TWO queries:
1. **With published filter** - Returns only `published == true` voyages
2. **Without filter** - Returns ALL voyages

If you see voyages in the "All Voyages" section but not in the filtered section:
→ **The issue is the `published` field!**

### Step 3: Use "Test Sanity Connection" Button
Click the "Test Sanity Connection" button to see:
- Total voyages in dataset
- Published voyages count
- First voyage data

Example output:
```json
{
  "success": true,
  "dataset": "preprod",
  "totalVoyages": 45,
  "publishedVoyages": 0,  // ← This tells you the problem!
  "firstVoyage": {
    "_id": "abc123",
    "title": "My Voyage",
    "published": false  // ← Not published!
  }
}
```

## Solutions

### Solution 1: Publish Content in Preprod (Recommended)
Go to Sanity Studio, switch to preprod dataset, and publish your voyages.

### Solution 2: Remove the `published` Filter
If preprod is for testing and you want to see all content:

```javascript
// Instead of:
const query = `*[_type == "voyage" && published == true][0]`

// Use:
const query = `*[_type == "voyage"][0]`
```

### Solution 3: Use Different Queries per Dataset
```javascript
const query = currentDataset.value === 'production'
  ? `*[_type == "voyage" && published == true][0]`
  : `*[_type == "voyage"][0]` // No filter for non-production
```

### Solution 4: Add Fallback Logic
```javascript
const voyageQuery = /* groq */`
  *[_type == "voyage"] | order(
    coalesce(published, false) desc,  // Published first
    title asc
  )[0] {
    ...
  }
`
```

## Checking in Sanity Studio

### Via Vision Tool (Sanity Studio)
1. Open your Sanity Studio (`/cms` folder)
2. Go to Vision tool (usually in the toolbar)
3. **Switch dataset** using the dropdown at the top
4. Run these queries:

```groq
// Check total voyages
count(*[_type == "voyage"])

// Check published voyages  
count(*[_type == "voyage" && published == true])

// See all voyages with published status
*[_type == "voyage"]{ _id, title, published }

// Find unpublished voyages
*[_type == "voyage" && !published]{ _id, title }
```

### Via Sanity CLI
```bash
cd cms
npx sanity documents query '*[_type == "voyage"]{ _id, title, published }' --dataset preprod
```

## Quick Fix for Testing

If you just want to test the dataset switcher and don't care about the published state:

1. Open `pages/test.vue`
2. Change the query:
   ```javascript
   const voyageQuery = /* groq */`
     *[_type == "voyage"] | order(title asc)[0] {
       ...
     }
   `
   ```
3. Remove `&& published == true` from the filter

## Understanding the Console Logs

When you switch datasets, look for these patterns:

### ✅ Working:
```
🔧 Creating Sanity client with config: { dataset: "preprod", ... }
📊 Fetching from dataset: preprod
✅ Data received: single item
```

### ⚠️ No Published Content:
```
🔧 Creating Sanity client with config: { dataset: "preprod", ... }
📊 Fetching from dataset: preprod
✅ Data received: null
⚠️ Query returned null/empty for dataset: preprod
```

### ❌ Connection Error:
```
❌ Error fetching data from dataset: preprod
Error: [Details about the error]
```

## Prevention

To avoid this in the future:

1. **Use the same content structure** across all datasets
2. **Automate content sync** between datasets (if needed)
3. **Add default values** in your schema:
   ```javascript
   // In schema
   {
     name: 'published',
     type: 'boolean',
     initialValue: true  // ← Default to true
   }
   ```
4. **Use conditional queries** based on dataset
5. **Add warnings** when switching to non-production datasets

## Still Not Working?

Check these additional issues:

1. **Dataset doesn't exist**: Verify the dataset name is correct
2. **Network issues**: Check browser network tab
3. **API version mismatch**: Ensure `apiVersion` is compatible
4. **Token/permissions**: Some datasets might need authentication
5. **CORS issues**: Check if the domain is allowed in Sanity CORS settings

## Getting More Information

Add this to see the exact client configuration:
```javascript
const { sanityClient } = useSanityDataset()
console.log('Client config:', sanityClient.value.config())
```

