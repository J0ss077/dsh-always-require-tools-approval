# always-require-tools-approval

Plugin de DeepSeek Harness que detiene las herramientas vigiladas y espera la aprobación explícita del usuario antes de cada ejecución.

## Language

**Approval gate**:
La política que obliga a pedir aprobación antes de ejecutar una herramienta vigilada.
_Avoid_: permission gate, allow-list check

**Watchlist**:
El conjunto configurable de nombres de herramientas sujetos al approval gate.
_Avoid_: tool list, whitelist

**Gated tool**:
Una herramienta cuyo nombre está en la watchlist y que, por tanto, exige aprobación antes de ejecutarse.
_Avoid_: protected tool, restricted tool

**One-shot approval**:
Cada aprobación autoriza exactamente una ejecución; la siguiente llamada vuelve a preguntar.
_Avoid_: persistent grant, remembered permission

**Fail closed**:
Cuando no hay canal de aprobación disponible, la ejecución vigilada se deniega en lugar de permitirse.
_Avoid_: fail open

**Delegate**:
Para una herramienta fuera de la watchlist, no intervenir y ceder la decisión al siguiente eslabón.
_Avoid_: pass through, skip
