# Guide: Creating a New Supabase Table

This guide outlines the steps to create a new Supabase table, including setting up a UUID row ID, implementing Row-Level Security (RLS) roles, adding an auto-number field with a prefix, and displaying the table in the frontend.

---

## 1. Table Creation Script with UUID Row ID

Use the following SQL template to create a new table with a UUID primary key:

```sql
CREATE TABLE table_name (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    autonumber_field TEXT UNIQUE NOT NULL,
    column1 DATA_TYPE NOT NULL,
    column2 DATA_TYPE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Notes:
- Replace `table_name` with the desired table name.
- Replace `column1`, `column2`, and `DATA_TYPE` with the appropriate column names and data types.
- The `id` column is a UUID primary key.
- The `autonumber_field` will store the auto-generated number with a prefix.

---

## 2. Row-Level Security (RLS) Role for SQL Functions

To allow all users to access specific SQL functions, create an RLS policy:

```sql
CREATE POLICY "Allow all users for function_name" ON table_name
FOR SELECT
USING (auth.role() = 'authenticated');
```

### Steps:
1. Replace `function_name` with the name of the SQL function.
2. Replace `table_name` with the name of the table.
3. Ensure the `auth.role()` matches the role you want to allow (e.g., `authenticated`).

---

## 3. Auto-Number Field with Prefix

To create an auto-number field with a prefix, use the following SQL:

```sql
CREATE SEQUENCE table_name_autonumber_seq;

ALTER TABLE table_name
ADD COLUMN autonumber_field TEXT UNIQUE NOT NULL DEFAULT (
    'PREFIX-' || LPAD(nextval('table_name_autonumber_seq')::TEXT, 6, '0')
);
```

### Notes:
- Replace `table_name` with the desired table name.
- Replace `PREFIX-` with the desired prefix.
- The `LPAD` function ensures the number is zero-padded to 6 digits.

---

## 4. Display in Frontend

To display the table in the frontend:

1. **Fetch Data from Supabase**:
   Use the Supabase client to fetch data from the table:

   ```tsx
   import { supabase } from '../utils/supabaseClient';

   async function fetchData() {
       const { data, error } = await supabase
           .from('table_name')
           .select('*');

       if (error) {
           console.error('Error fetching data:', error);
       } else {
           console.log('Data:', data);
       }
   }

   fetchData();
   ```

2. **Render Data in a Component**:
   Use a React component to display the data:

   ```tsx
   import React, { useEffect, useState } from 'react';
   import { supabase } from '../utils/supabaseClient';

   const TableDisplay = () => {
       const [data, setData] = useState([]);

       useEffect(() => {
           async function fetchData() {
               const { data, error } = await supabase
                   .from('table_name')
                   .select('*');

               if (error) {
                   console.error('Error fetching data:', error);
               } else {
                   setData(data);
               }
           }

           fetchData();
       }, []);

       return (
           <div>
               <h1>Table Data</h1>
               <ul>
                   {data.map((item) => (
                       <li key={item.id}>{JSON.stringify(item)}</li>
                   ))}
               </ul>
           </div>
       );
   };

   export default TableDisplay;
   ```

3. **Integrate into the Application**:
   Import and use the `TableDisplay` component in your application:

   ```tsx
   import TableDisplay from './components/TableDisplay';

   function App() {
       return (
           <div>
               <TableDisplay />
           </div>
       );
   }

   export default App;
   ```

---

By following these steps, you can create a new Supabase table, secure it with RLS, add an auto-number field, and display its data in the frontend.
