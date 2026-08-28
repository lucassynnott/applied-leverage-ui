import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({plugins:[react()],test:{exclude:['dist/**','node_modules/**']},build:{emptyOutDir:false,lib:{entry:resolve(import.meta.dirname,'src/index.ts'),name:'ALUI',fileName:'al-ui'},rollupOptions:{external:['react','react-dom','react/jsx-runtime'],output:{globals:{react:'React','react-dom':'ReactDOM','react/jsx-runtime':'jsxRuntime'}}}}});