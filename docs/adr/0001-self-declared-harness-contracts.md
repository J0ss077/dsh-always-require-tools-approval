# Self-declared harness contracts

El plugin necesita `PreToolDecision`, `ToolExecution` y el seam de settings del harness. Decidimos **auto-declarar espejos mínimos en `src/contracts.ts`** en vez de importar `@deepseek-ai/dsh-tools` / `@deepseek-ai/dsh-settings`, porque esos paquetes no instalan limpio desde npm (la dependencia transitiva `@deepseek-ai/dsh-type-meta` no está publicada) y el plugin solo necesita dos tipos y un método en runtime.

## Considered Options

- **Importar `@deepseek-ai/dsh-tools` / `@deepseek-ai/dsh-settings`.** Tipos exactos, pero arrastra un árbol de peer-dependencies del monorepo del harness y falla la instalación por `@deepseek-ai/dsh-type-meta` no publicado. Rechazada.
- **Auto-declarar espejos mínimos.** Solo lo que se usa, instalación limpia, a cambio del riesgo de desincronización con el contrato real (mitigado centralizándolo en un solo archivo y documentándolo aquí). Elegida.
