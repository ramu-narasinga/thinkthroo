# Components structure

## colocating things as close as possible to where it's being used
<features-folder>
Place the components in features folder. For example, take `GeneralSettings` component, this will be placed in app/(platform)/repositories/features folder. 

Here the (platform) is for grouping routes in Next.js, there's no affect of this group in where you place your components. Components will always be inside {route}/features folder
</features-folder>

<component-naming-convention>
The file you create for your component should be PascalCase. For example, for a component named `General`, you will create a file named `General.tsx` and you always use `export default` to export a component in that file.
</component-naming-convention>