import React, { useEffect, useState } from "react";
import edjsHTML from "editorjs-html";
import "./SaludFinancieraPanel.css";

const SaludFinancieraPanel = () => {
  const [contenidoHTML, setContenidoHTML] = useState("");

  useEffect(() => {
    const fetchContenido = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/salud");
        if (!res.ok) throw new Error("No se pudo cargar el contenido");

        const data = await res.json();
        if (!data || !Array.isArray(data.blocks)) {
          throw new Error("Contenido inválido");
        }

        const edjsParser = edjsHTML({
          paragraph: (block) => `<p class="render-texto">${block.data.text}</p>`,
          header: (block) => `<h${block.data.level} class="render-header">${block.data.text}</h${block.data.level}>`,
          checklist: (block) => {
            const items = block.data.items
              .map(
                (item) =>
                  `<li class="checklist-item">
                    <input type="checkbox" disabled ${item.checked ? "checked" : ""} />
                    <span>${item.text}</span>
                  </li>`
              )
              .join("");
            return `<ul class="checklist-block">${items}</ul>`;
          },
          image: (block) => {
            const { file, width, height, withBorder, withBackground, stretched } = block.data;
            const classNames = ["img-block"];
            if (withBorder) classNames.push("img-border");
            if (withBackground) classNames.push("img-bg");
            if (stretched) classNames.push("img-stretch");
            const style = `style=\"width: ${width || 'auto'}; height: ${height || 'auto'};\"`;
            return `<div class="${classNames.join(" ")}">
              <img src="${file.url}" ${style} alt="Imagen" />
            </div>`;
          },
          embed: (block) => {
            return `<div class="video-embed">
              <iframe width="100%" height="315" src="${block.data.embed}" frameborder="0" allowfullscreen></iframe>
            </div>`;
          },
          quote: (block) => {
            return `<blockquote class="custom-quote">
              <p>“${block.data.text}”</p>
              <cite>- ${block.data.caption}</cite>
            </blockquote>`;
          },
          warning: (block) => {
            return `<div class="custom-warning">
              <strong>${block.data.title}</strong><br />
              <span>${block.data.message}</span>
            </div>`;
          },
          table: (block) => {
            const rows = block.data.content
              .map(
                (row) =>
                  `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`
              )
              .join("");
            return `<table class="custom-table">${rows}</table>`;
          },
          linkTool: (block) => {
            const meta = block.data.meta;
            return `<a class="custom-link" href="${block.data.link}" target="_blank">
              <strong>${meta.title || block.data.link}</strong><br />
              <span>${meta.description || ""}</span>
            </a>`;
          }
        });

        const bloques = edjsParser.parse(data);
        const html = Object.values(bloques).flat().join("");
        setContenidoHTML(html);
      } catch (error) {
        console.error("Error al cargar contenido de salud financiera:", error);
      }
    };

    fetchContenido();
  }, []);

  return (
    <div className="salud-financiera-blog">
      <div className="presentacion-blog">
        <h1 className="titulo-blog">Consejos de Salud Financiera</h1>
        <p className="subtitulo-blog">Actualizado semanalmente por el equipo de <strong>FinTrack</strong></p>
        <div className="linea-decorativa" />
      </div>
      <div className="contenido-blog" dangerouslySetInnerHTML={{ __html: contenidoHTML }} />
      <div className="linea-decorativa" />
      <footer className="footer-fintrack">
  <p>&copy; {new Date().getFullYear()} FinTrack. Todos los derechos reservados.</p>
</footer>

<a href="/inicio" className="btn-volver-inicio" title="Volver al inicio"> Volver al inicio</a>

    </div>
  );
};

export default SaludFinancieraPanel;
