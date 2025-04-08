## !!steps

!duration 100

```tsx ! /app/lib/data.ts
// !callout[/fetchCustomers/] Fetch a list of customers from the database.
export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return data.rows;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}
```

## !!steps

!duration 100

```tsx ! /app/dashboard/invoices/create/page.tsx
// !callout[/fetchCustomers Usage/] Fetch customer data and pass it to the `Form` component.
export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <main>
      <Form customers={customers} />
    </main>
  );
}
```