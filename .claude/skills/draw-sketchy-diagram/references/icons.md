# Icon catalog

Every panel in a `comparison` layout **must** declare an `icon`. The icon is
drawn as a hand-drawn (Rough.js) mini-illustration above the panel title in
the panel's accent stroke color. There are no fills, so icons read on both
the `paper` and `chalkboard` themes.

If `icon` is missing, the renderer throws and exits with code `4`. If
`icon` is set to a value not in this catalog, `drawIcon` falls back to a
placeholder square with `?` and logs `console.warn` (visible in stderr on
exit-code-4 paths, or silently passes if everything else is fine).

## Catalog

### Double-LASSO / selection family

| `icon`           | Visual                                                  | Use it for                                                     |
|------------------|----------------------------------------------------------|----------------------------------------------------------------|
| `kitchen-sink`   | Trapezoid basin with chaotic dots falling in            | A method that throws in many inputs without selection           |
| `funnel`         | Single downward trapezoid with a narrow stem            | A one-stage filtering / selection method                        |
| `double-funnel`  | Two funnels side-by-side, stems converging              | A two-stage / orthogonal selection method (e.g. Double LASSO)   |

### Data / chart family

| `icon`        | Visual                                | Use it for                                          |
|---------------|----------------------------------------|-----------------------------------------------------|
| `bar-chart`   | Three vertical bars on a baseline      | Aggregated / grouped comparisons                    |
| `scatter`     | Frame with several scattered dots      | Bivariate relationships, correlation                |
| `line-chart`  | Frame with a rising zigzag line        | Time series, growth, trajectories                   |
| `histogram`   | Five bars in a bell-ish distribution   | Distributions, density, empirical Bayes             |

### Decision / verdict family

| `icon`         | Visual                       | Use it for                                       |
|----------------|------------------------------|--------------------------------------------------|
| `check`        | Large checkmark stroke       | A recommended / verified / passes-the-test method |
| `x-mark`       | Two crossed strokes          | A failed / rejected / "do not use" method         |
| `exclamation`  | Vertical stroke + dot below  | A caution / fragile / sensitive method            |
| `target`       | Three concentric circles + center dot | An exact / unbiased / gold-standard estimator     |

### Modeling family

| `icon`   | Visual                                                  | Use it for                                                |
|----------|----------------------------------------------------------|-----------------------------------------------------------|
| `tree`   | Triangle canopy + trunk                                  | Decision trees, random forests, boosted trees             |
| `brain`  | Two lobed circles with internal squiggles                | Neural networks, deep learning, complex non-linear models |
| `gears`  | Outer circle + small inner circle + six tooth lines     | Pipelines, ML systems, multi-stage processes              |
| `scale`  | Horizontal beam with two hanging pans                   | Comparison / balance / matching / trade-off               |

## Naming convention

- Lowercase
- Kebab-case
- Semantically descriptive of what it *means*, not how it looks
  (`scale` for a balance icon, not `balance-beam`; `kitchen-sink` for
  "throws everything in", not `chaos-bucket`)

## Adding a new icon

1. Drop a new `case "<name>":` branch into `drawIcon()` inside
   `templates/comparison.html`. Use Rough.js primitives (`rc.line`,
   `rc.rectangle`, `rc.circle`, `rc.ellipse`, `rc.path`) and the helper
   `opts({...})` so the new icon picks up the panel's accent stroke and
   the template's `roughness`/`bowing` defaults automatically. Seed
   variations per stroke (e.g. `baseSeed + 1`, `baseSeed + 2`) so the
   icon doesn't look like a single stamped shape.

2. Document the icon here under the right family, with a one-line
   "use it for" gloss.

3. The icon box is `(size × size)` centered at `(cx, cy)`. Use the
   provided `half`, `eighth`, `L`, `R`, `T`, `B` shorthands inside
   `drawIcon` so the icon scales correctly if anyone changes `iconSize`
   in `render()`.

4. Pick a placement that reads at ~56 px on a 1400 × 900 canvas — the
   icon will be ~28 px after JPEG rescale on a typical blog post. Test
   with `--scale 1` to confirm legibility at small sizes.

## Why hand-drawn, not Font Awesome / SVG file icons?

The skill's signature aesthetic is "marker + handwritten notebook." Clean
Font Awesome glyphs are crisp, but they fight the Rough.js wobble in the
rest of the diagram and read as an alien element. Drawing each icon out
of the same `rc.line` / `rc.rectangle` calls as the panel itself keeps
the entire diagram in one visual language. The trade-off is finite
catalog size — `draw-sketchy-diagram` ships ~15 icons, not Font
Awesome's 2,000. For a topic that needs an icon outside the catalog,
either add a case branch (one-time cost) or pick the closest match.
