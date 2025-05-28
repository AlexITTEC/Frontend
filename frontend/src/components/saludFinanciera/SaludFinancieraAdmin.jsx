import React, { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";

// Herramientas oficiales
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";
import Table from "@editorjs/table";
import LinkTool from "@editorjs/link";
import ImageTool from "@editorjs/image";
import Embed from "@editorjs/embed";
import InlineCode from "@editorjs/inline-code";
import Delimiter from "@editorjs/delimiter";
import Warning from "@editorjs/warning";

import "./SaludFinancieraAdmin.css";

const SaludFinancieraAdmin = () => {
  const editorRef = useRef(null);
  const [guardado, setGuardado] = useState(false);
  const [contenidoInicial, setContenidoInicial] = useState(null);
const [indiceBloques, setIndiceBloques] = useState([]);

  useEffect(() => {
    const obtenerContenido = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/salud");
        const data = await res.json();
        setContenidoInicial(data);
      } catch (error) {
        console.warn("No se encontró contenido previo o error al cargar:", error);
      }
    };

    obtenerContenido();
  }, []);

 useEffect(() => {
  const holder = document.getElementById("editorjs");
  if (!holder || editorRef.current || !contenidoInicial) return;

const obtenerTextoResumen = (bloque) => {
  const tipo = bloque.type || "bloque";

  if (!bloque.data || typeof bloque.data !== "object") {
    return `📦 ${tipo}`;
  }

  try {
    switch (tipo) {
      case 'header':
      case 'paragraph':
      case 'quote':
        return "📝 " + extraerTexto(bloque.data.text);

      case 'list':
        return "📋 Lista: " + extraerTexto(bloque.data.items?.[0]);

      case 'checklist':
        return "✅ Checklist: " + extraerTexto(bloque.data.items?.[0]?.text);

      case 'table':
        return "📊 Tabla";

      case 'code':
        return "⌨️ Código: " + extraerTexto(bloque.data.code);

      case 'image':
        return "🖼️ Imagen";

      case 'embed':
        return `🎥 Embed: ${bloque.data?.service || "Multimedia"}`;

      case 'warning':
        return "⚠️ Alerta: " + extraerTexto(bloque.data?.title);

      case 'delimiter':
        return "⎯ Separador";

      case 'linkTool':
        return "🔗 Enlace: " + extraerTexto(bloque.data?.link);

      default:
        return `📦 ${tipo}`;
    }
  } catch {
    return `📦 ${tipo}`;
  }
};

const extraerTexto = (valor) => {
  if (typeof valor !== "string") return "[sin texto]";
  return valor.replace(/<[^>]+>/g, "").slice(0, 40) + "...";
};


const limpiarTexto = (input) => {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]+>/g, "").slice(0, 40) + "...";
};


  const editor = new EditorJS({
    holder: "editorjs",
    autofocus: true,
    placeholder: "✍️ Escribe contenido para la sección de Salud Financiera...",
    data: contenidoInicial,
     tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          },
          toolbox: {
            title: 'Heading',
            icon: 'H'
          }
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
          toolbox: {
            title: 'Text',
            icon: '📝'
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
          toolbox: {
            title: 'List',
            icon: '🔢'
          }
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
          toolbox: {
            title: 'Checklist',
            icon: '✅'
          }
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: "Escribe una cita",
            captionPlaceholder: "Autor"
          },
          toolbox: {
            title: 'Quote',
            icon: '❝'
          }
        },
        code: {
          class: CodeTool,
          toolbox: {
            title: 'Code',
            icon: '⌨️'
          }
        },
        inlineCode: {
          class: InlineCode,
          toolbox: {
            title: 'Inline Code',
            icon: '🔤'
          }
        },
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3
          },
          toolbox: {
            title: 'Table',
            icon: '📊'
          }
        },
        delimiter: {
          class: Delimiter,
          toolbox: {
            title: 'Separator',
            icon: '⎯'
          }
        },
        warning: {
          class: Warning,
          inlineToolbar: true,
          config: {
            titlePlaceholder: "Título",
            messagePlaceholder: "Mensaje"
          },
          toolbox: {
            title: 'Warning',
            icon: '⚠️'
          }
        },
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: "http://localhost:3000/api/fetch-url"
          },
          toolbox: {
            title: 'Link',
            icon: '🔗'
          }
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: "http://localhost:3000/api/upload-image",
              byUrl: "http://localhost:3000/api/fetch-image"
            }
          },
          toolbox: {
            title: 'Image',
            icon: '🖼️'
          }
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              vimeo: true,
              codepen: true,
              instagram: true,
              twitter: true
            }
          },
          toolbox: {
            title: 'Embed',
            icon: '🎥'
          }
        }
     
      },
onReady: async () => {
  const salida = await editor.save();
  const encabezados = salida.blocks

.filter(b => !!b.data && Object.keys(b.data).length > 0)

 .map(b => ({
  id: b.id || Math.random().toString(36).substr(2, 9),
  texto: obtenerTextoResumen(b)
}));


  setIndiceBloques(encabezados);

  // Asignar `data-bid` a cada bloque en el DOM
  const bloquesDOM = document.querySelectorAll(".ce-block");
  bloquesDOM.forEach((bloqueDOM, index) => {
    const id = encabezados[index]?.id;
    if (id) bloqueDOM.setAttribute("data-bid", id);
  });
},
onChange: async () => {
  try {
    const salida = await editor.save();

    const encabezados = salida.blocks
      .filter(b => b?.data && Object.keys(b.data).length > 0)
      .map(b => ({
        id: b.id || Math.random().toString(36).substr(2, 9),
        texto: obtenerTextoResumen(b)
      }));

    setIndiceBloques(encabezados);

    // Esperamos a que el DOM se actualice
    setTimeout(() => {
      const bloquesDOM = document.querySelectorAll(".ce-block");
      bloquesDOM.forEach((bloqueDOM, index) => {
        const id = encabezados[index]?.id;
        if (id) bloqueDOM.setAttribute("data-bid", id);
      });
    }, 100); // suficiente para esperar renderizado
  } catch (e) {
    console.warn("No se pudo actualizar el índice dinámicamente:", e);
  }
  
},





      
  });

  editorRef.current = editor;
}, [contenidoInicial]);


  const guardarContenido = async () => {
    try {
      if (!editorRef.current) return;
      const salida = await editorRef.current.save();
      const token = localStorage.getItem("token");

      await fetch("http://localhost:3000/api/salud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ contenido: salida })
      });

      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    
  <div className="admin-salud-panel">
  <h2>🛠 Editor Visual Profesional (FinTrack)</h2>

  <div className="editor-contenedor-completo">
    <div className="editor-central">
      <div id="editorjs" className="editor-contenedor" />
      <div className="acciones-panel">
        <button className="btn-guardar" onClick={guardarContenido}>💾 Guardar</button>
        <a href="/inicio" className="btn-volver-inicio" title="Volver al inicio">Volver al inicio</a>
        {guardado && <p className="mensaje-exito">Contenido guardado ✅</p>}
      </div>
    </div>

    <aside className="indice-lateral">
      <h4>📌 Índice</h4>
      <ul>
        {indiceBloques.map((bloque, i) => (
          <li key={i}>
            <button
  onClick={() => {
    const target = document.querySelector(`[data-bid='${bloque.id}']`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });

      // Quita clase si ya está
      target.classList.remove("bloque-resaltado");

      // Forzar reflow para reiniciar animación (hack necesario)
      void target.offsetWidth;

      // Agrega la clase
      target.classList.add("bloque-resaltado");

      // Quitarla después de 1 segundo
      setTimeout(() => {
        target.classList.remove("bloque-resaltado");
      }, 1000);
    }
  }}
>
  {bloque.texto}
</button>

          </li>
        ))}
      </ul>
    </aside>
  </div>
</div>

  );
};

export default SaludFinancieraAdmin;

