!videoTitle How Tailwind CSS Detects Circular Dependency

## !!steps
!duration 180

!title 1. Introduction to Circular Dependency in Tailwind CSS

```ts ! apply.ts
// Error message thrown when circular 
// dependency is detected in Tailwind CSS
// !callout[/Error/] This error is triggered when `@apply` causes a circular dependency during utility application.
throw new Error(
  `You cannot \`@apply\` the \`${candidate}\` 
  utility here because it creates a circular dependency.`,
);
```

## !!steps
!duration 200

!title 2. Overview of walk Function

```ts ! ast.ts
// Definition of walk, a recursive function used to 
// traverse the AST (Abstract Syntax Tree) in Tailwind.
// !callout[/walk/] Walk function recursively processes AST nodes, checking for circular dependencies in rules and contexts.
export function walk(
  ast: AstNode[],
  visit: (node: AstNode, utils: {
    parent: AstNode | null;
    replaceWith(newNode: AstNode | AstNode[]): void;
    context: Record<string, string>;
  }) => void | WalkAction,
  parent: AstNode | null = null,
  context: Record<string, string> = {}
) {
  // ...
}
```

## !!steps
!duration 220

!title 3. Detecting Circular Dependencies in Tailwind

```ts ! apply.ts
// Example code checking for 
// circular dependency in apply.ts
// !callout[/walk/] The walk function traverses `newNodes` and `candidateAst` to identify circular references.
walk(newNodes, (child) => {
  if (child !== node) return;
  // Error is thrown when circular dependency is detected.
  throw new Error(
    `You cannot \`@apply\` the \`${candidate}\` 
    utility here because it creates a circular dependency.`,
  );
});
```

## !!steps

!duration 230

!title 4. Checking Candidates and Rules for Circular Dependency

```ts ! apply.ts
// Additional circular dependency 
// check inside the walk function.
// !callout[/candidate/] This loop ensures that each candidate’s AST is checked for circular dependencies.
for (let candidate of candidates) {
  let selector = `.${escape(candidate)}`;
  for (let rule of candidateAst) {
    if (rule.kind !== 'rule') continue;
    if (rule.selector !== selector) continue;
    walk(rule.nodes, (child) => {
      if (child !== node) return;
      // Circular dependency detected
      throw new Error(
        `You cannot \`@apply\` the \`${candidate}\` 
        utility here because it creates a circular dependency.`,
      );
    });
  }
}
```

## !!steps
!duration 250

!title 5. Conclusion and Final Thoughts on Circular Dependency Detection

```ts ! tailwind.js
// Summary and final thoughts on how 
// Tailwind CSS prevents circular dependencies.
// !callout[/walk/] Tailwind uses a recursive AST traversal mechanism to detect and prevent circular dependencies when using `@apply`.
walk()
```