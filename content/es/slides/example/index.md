---
title: Diapositivas
summary: Una introducción al uso de la función de diapositivas de Wowchemy.
authors: []
tags: []
categories: []
date: "2019-02-05T00:00:00Z"
slides:
  # Choose a theme from https://github.com/hakimel/reveal.js#theming
  theme: black
  # Choose a code highlighting style (if highlighting enabled in `params.toml`)
  #   Light style: github. Dark style: dracula (default).
  highlight_style: dracula
---

# Cree diapositivas en Markdown con Wowchemy

[Wowchemy](https://wowchemy.com/) | [Documentación](https://owchemy.com/docs/managing-content/#create-slides)

---

## Características

- Escriba diapositivas de forma eficiente en Markdown
- 3 en 1: cree, presente y publique sus diapositivas
- Admite notas del orador
- Diapositivas adaptadas a dispositivos móviles

---

## Controles

- Siguiente: `Right Arrow` o `Space`
- Anterior: `Left Arrow`
- Inicio: `Home`
- Fin: `End`
- Vista general: `Esc`
- Notas del orador: `S`
- Pantalla completa: `F`
- Zoom: `Alt + Click`
- [Exportar a PDF](https://github.com/hakimel/reveal.js#pdf-export): `E`

---

## Resaltado de código

Código en línea: `variable`

Bloque de código:
```python
porridge = "blueberry"
if porridge == "blueberry":
    print("Eating...")
```

---

## Matemáticas

Matemáticas en línea: $x + y = z$

Matemáticas en bloque:

$$
f\left( x \right) = \;\frac{{2\left( {x + 4} \right)\left( {x - 4} \right)}}{{\left( {x + 4} \right)\left( {x + 1} \right)}}
$$

---

## Fragmentos

Haga que el contenido aparezca de forma incremental

```
{{%/* fragment */%}} Uno {{%/* /fragment */%}}
{{%/* fragment */%}} **Dos** {{%/* /fragment */%}}
{{%/* fragment */%}} Tres {{%/* /fragment */%}}
```

¡Presione `Space` para reproducir!

{{% fragment %}} Uno {{% /fragment %}}
{{% fragment %}} **Dos** {{% /fragment %}}
{{% fragment %}} Tres {{% /fragment %}}

---

Un fragmento admite dos parámetros opcionales:

- `class`: use un estilo personalizado (requiere definición en CSS personalizado)
- `weight`: define el orden en que aparece un fragmento

---

## Notas del orador

Agregue notas del orador a su presentación

```markdown
{{%/* speaker_note */%}}
- Only the speaker can read these notes
- Press `S` key to view
{{%/* /speaker_note */%}}
```

¡Presione la tecla `S` para ver las notas del orador!

{{< speaker_note >}}
- Solo el orador puede leer estas notas
- Presione la tecla `S` para verlas
{{< /speaker_note >}}

---

## Temas

- black: fondo negro, texto blanco, enlaces azules (predeterminado)
- white: fondo blanco, texto negro, enlaces azules
- league: fondo gris, texto blanco, enlaces azules
- beige: fondo beige, texto oscuro, enlaces marrones
- sky: fondo azul, texto oscuro fino, enlaces azules

---

- night: fondo negro, texto blanco grueso, enlaces naranjas
- serif: fondo capuchino, texto gris, enlaces marrones
- simple: fondo blanco, texto negro, enlaces azules
- solarized: fondo color crema, texto verde oscuro, enlaces azules

---

{{< slide background-image="/media/boards.jpg" >}}

## Diapositiva personalizada

Personalice el estilo y el fondo de la diapositiva

```markdown
{{</* slide background-image="/media/boards.jpg" */>}}
{{</* slide background-color="#0000FF" */>}}
{{</* slide class="my-style" */>}}
```

---

## Ejemplo de CSS personalizado

Hagamos que los encabezados sean de color azul marino.

Cree `assets/css/reveal_custom.css` con:

```css
.reveal section h1,
.reveal section h2,
.reveal section h3 {
  color: navy;
}
```

---

# ¿Preguntas?

[Preguntar](https://github.com/wowchemy/wowchemy-hugo-modules/discussions)

[Documentación](https://wowchemy.com/docs/managing-content/#create-slides)
