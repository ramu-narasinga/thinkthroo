!videoTitle Managing Text File Normalization with .gitattributes

## !!steps
!duration 180

!title 1. Introduction to .gitattributes

```ts ! project/.gitattributes
// The .gitattributes file helps manage 
// attributes for files in the repository.
// !callout[/txt/] Configures how Git treats specific file types, including handling line endings and diffing.
*.txt text
*.md text
*.sh text eol=lf
```

## !!steps
!duration 190

!title 2. Defining Text File Normalization

```ts ! project/.gitattributes
// Text file normalization ensures 
// consistent line endings across different operating systems.
// !callout[/eol/] Sets line endings for specific file types to avoid issues with cross-platform compatibility.
*.txt text eol=lf
```

## !!steps
!duration 180

!title 3. Configuring Binary Files

```ts ! project/.gitattributes
// Binary files should not 
// be altered for line endings or diffs.
// !callout[/binary/] Marks files as binary, preventing Git from attempting to normalize them.
*.jpg binary
*.png binary
```

## !!steps
!duration 210

!title 4. Using .gitattributes for Custom Diffing

```ts ! project/.gitattributes
// Custom diff configurations for specific 
// file types can enhance code reviews.
// !callout[/diff/] Sets a custom diff driver for specific file types, improving clarity in code reviews.
*.json diff=json
*.xml diff=xml
```

## !!steps
!duration 180

!title 5. Practical Example of .gitattributes

```ts ! project/.gitattributes
// Example of setting up a 
// .gitattributes file in your repository
// !callout[/touch/] Create a .gitattributes file to manage file attributes.
$ touch .gitattributes

// Adding attributes for various file types
*.txt text eol=lf
*.jpg binary
*.json diff=json
```