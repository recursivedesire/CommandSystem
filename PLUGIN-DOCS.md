## Custom Babel Inline Plugin: Detailed Mechanics

The `devportal-compat-plugin` is tailored for the DevPortal, optimizing the bundling process to suit the limitations and features of the Chaturbate App v2 API.

### API and sharedCode.ts Imports Stripping

The DevPortal's real API doesn't need explicit references to its API methods or sharedCode functionality during runtime. To mirror this behavior:

1. **API Imports**: These are placeholders in the development environment, granting typed access to globals offered by the actual API. They're stripped away in the bundled code.

   **Example**:
   
   ```javascript
   import { SomeAPIType } from '/api/SomeAPIFile'; // Stripped by the plugin
   ```

2. **sharedCode.ts Imports**: Similar to API imports, any references to `sharedCode.ts` are stripped by the plugin, as the real API has its own mechanism for handling `sharedCode.ts`.

   ```javascript
   import { SharedFunction } from 'sharedCode.ts'; // Stripped by the plugin
   ```

### Inlining Modules

Given the real API doesn't support traditional module loading, this plugin offers a solution to ensure all necessary code is available in a single bundled file:

1. **Full File Inlining**: If an import doesn't specify any members, the entire content of the module is inlined.
  
   **Example**:
   
   ```javascript
   import './MyModule'; // Whole content of MyModule is inlined
   ```

2. **Partial Inlining**: If an import specifies particular module members, only those members are inlined.

   **Example**:

   ```javascript
   import { SpecificFunction } from './MyModule'; // Only SpecificFunction is inlined
   ```

### Stripping Exports

Exports are introduced during development to structure the modules, especially for testing, and facilitate inlining. However, since the real API doesn't support traditional modules or file loading, these exports have no place in the final bundled code. As a result, the plugin strips them.

**Example**:

```javascript
export const SomeFunction = () => { ... }; // The export keyword is stripped
```

### Integration with Testing

Despite the transformations applied to the codebase, its integrity for testing purposes remains intact. Using AVA, developers can still execute unit tests efficiently, even with the unique code transformations introduced by the plugin.
