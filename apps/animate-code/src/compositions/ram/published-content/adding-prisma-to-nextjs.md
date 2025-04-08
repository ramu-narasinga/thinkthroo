```markdown
## !!steps

!duration 100

```bash ! /project-root
# !callout[/@prisma/client/] Install Prisma CLI and client packages.
npm install @prisma/client
npm install prisma --save-dev
```

## !!steps

!duration 100

```bash ! /project-root
# !callout[/prisma init/] Initialize Prisma in your project and generate the initial setup files.
npx prisma init
```

## !!steps

!duration 100

```prisma ! /prisma/schema.prisma
// Define your data model in the `schema.prisma` file.
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String
}
```

## !!steps

!duration 100

```bash ! /project-root
# !callout[/migrate dev/] Apply the schema changes to your database by running migrations.
npx prisma migrate dev --name init
```

## !!steps

!duration 100

```ts ! /lib/prisma.ts
// !callout[/PrismaClient/] Create and use the Prisma Client to interact with your database.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```
