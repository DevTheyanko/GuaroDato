import { useState, useEffect, useRef, useCallback } from "react";
import Papa from "papaparse";

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbaXTZBFebJyM8XHyK-Jmcfsg_Xm4pVfHHYg_5cuAaBM_2_vbi9hmdvR0ETlvGMKAizxbaRYccRrb-/pub?output=csv";

const PAGE_SIZE = 15;

const DEMO_STORES = [
  { id:"1",  name:"Frutas & Verduras Don Carlos", category:"Mercado",    emoji:"🥦", rating:"4.8", reviews:"312", address:"Av. Libertador, Centro",      phone:"0412-432-1890", hours:"Lun–Sáb: 6am–6pm",        description:"El mejor mercado de productos frescos de la región.",           tags:"Orgánico,Fresco,Local",          color:"#16a34a", accent:"#dcfce7", image:"🌿", open:"true",  lat:"10.0678", lng:"-69.3474" },
  { id:"2",  name:"Panadería La Esperanza",        category:"Panadería",  emoji:"🥐", rating:"4.9", reviews:"541", address:"Calle 26 con Carrera 17",     phone:"0412-874-5566", hours:"Todos los días: 5am–8pm", description:"Desde 1987 horneando el sabor de nuestra ciudad.",               tags:"Artesanal,Tradicional,Café",     color:"#b45309", accent:"#fef3c7", image:"🍞", open:"true",  lat:"10.0712", lng:"-69.3521" },
  { id:"3",  name:"Ferretería El Tornillo",        category:"Ferretería", emoji:"🔧", rating:"4.6", reviews:"189", address:"Av. Venezuela, Los Leones",   phone:"0414-123-9988", hours:"Lun–Vie: 7am–6pm",       description:"Todo lo que necesitas para tu hogar y construcción.",            tags:"Construcción,Hogar,Herramientas",color:"#1d4ed8", accent:"#dbeafe", image:"🔩", open:"true",  lat:"10.0598", lng:"-69.3389" },
  { id:"4",  name:"Boutique Mariana Style",        category:"Ropa",       emoji:"👗", rating:"4.7", reviews:"228", address:"C.C. Las Trinitarias",        phone:"0416-667-4422", hours:"Lun–Sáb: 10am–7pm",      description:"Moda femenina con estilo propio y las últimas tendencias.",      tags:"Moda,Femenina,Tendencia",        color:"#be185d", accent:"#fce7f3", image:"👠", open:"true",  lat:"10.0751", lng:"-69.3612" },
  { id:"5",  name:"Farmacia Salud Total",          category:"Farmacia",   emoji:"💊", rating:"4.5", reviews:"405", address:"Av. Florencio Jiménez",       phone:"0424-990-2233", hours:"24 horas — 7 días",       description:"Medicamentos, vitaminas y productos de salud todo el día.",      tags:"Salud,24H,Domicilio",            color:"#0e7490", accent:"#cffafe", image:"🏥", open:"true",  lat:"10.0634", lng:"-69.3558" },
  { id:"6",  name:"Miscelánea El Estudiante",      category:"Papelería",  emoji:"📚", rating:"4.4", reviews:"167", address:"Urb. El Ujano",               phone:"0426-334-8821", hours:"Lun–Sáb: 7am–7pm",       description:"Útiles escolares, papelería y fotocopias al instante.",          tags:"Papelería,Fotocopias,Escolar",   color:"#7c3aed", accent:"#ede9fe", image:"✏️", open:"false", lat:"10.0692", lng:"-69.3430" },
  { id:"7",  name:"Carnicería Los Hermanos",       category:"Carnicería", emoji:"🥩", rating:"4.8", reviews:"376", address:"Mercado Mayorista",           phone:"0412-221-7743", hours:"Lun–Sáb: 5am–3pm",       description:"Carnes frescas de res, cerdo y pollo. Cortes especiales.",       tags:"Fresco,Domicilio,Cortes",        color:"#dc2626", accent:"#fee2e2", image:"🔪", open:"false", lat:"10.0723", lng:"-69.3495" },
  { id:"8",  name:"Tech Zona Accesorios",          category:"Tecnología", emoji:"📱", rating:"4.6", reviews:"294", address:"C.C. Metrópolis",             phone:"0414-885-3310", hours:"Lun–Sáb: 9am–7pm",       description:"Accesorios para celulares y servicio técnico especializado.",     tags:"Celulares,Accesorios,Servicio",  color:"#475569", accent:"#e2e8f0", image:"💻", open:"true",  lat:"10.0660", lng:"-69.3580" },
  { id:"9",  name:"Jugos Naturales El Tropicano",  category:"Cafetería",  emoji:"🥤", rating:"4.7", reviews:"213", address:"Av. Rotaria, Barquisimeto",   phone:"0412-555-1122", hours:"Lun–Dom: 7am–8pm",        description:"Jugos frescos, batidos y ensaladas saludables.",                 tags:"Jugos,Natural,Saludable",        color:"#0d9488", accent:"#f0fdfa", image:"🍹", open:"true",  lat:"10.0690", lng:"-69.3503" },
  { id:"10", name:"Zapatería El Paso Firme",       category:"Ropa",       emoji:"👟", rating:"4.5", reviews:"178", address:"Calle Real, Centro",          phone:"0416-444-3322", hours:"Lun–Sáb: 9am–7pm",       description:"Calzado para toda la familia: sport, formal y casual.",          tags:"Zapatos,Calzado,Familia",        color:"#7c3aed", accent:"#ede9fe", image:"👞", open:"true",  lat:"10.0715", lng:"-69.3461" },
  { id:"11", name:"Gym Power Lara",                category:"Deporte",    emoji:"💪", rating:"4.8", reviews:"390", address:"Av. Los Leones",              phone:"0424-777-8899", hours:"Lun–Vie: 5am–10pm",       description:"Gimnasio equipado con pesas, cardio y clases grupales.",         tags:"Gimnasio,Pesas,Cardio",          color:"#ea580c", accent:"#fff7ed", image:"🏋️", open:"true",  lat:"10.0623", lng:"-69.3412" },
  { id:"12", name:"Veterinaria El Animalito",      category:"Mascotas",   emoji:"🐾", rating:"4.9", reviews:"311", address:"Urb. Santa Elena",            phone:"0416-222-4433", hours:"Lun–Sáb: 8am–6pm",       description:"Consultas veterinarias, vacunas y cirugías para tus mascotas.",  tags:"Veterinario,Vacunas,Mascotas",   color:"#16a34a", accent:"#dcfce7", image:"🐶", open:"true",  lat:"10.0612", lng:"-69.3512" },
];

// ── Helpers imagen
function normalizeImageUrl(val) {
  if (!val) return null;
  const v = val.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/")) return null;
  if (v.length <= 10 && !/[./]/.test(v)) return null;
  if (/^[a-z0-9-]+\.[a-z]{2,}\//i.test(v)) return `https://${v}`;
  return null;
}
function isImageUrl(val) {
  if (!val) return false;
  const v = val.trim();
  if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|avif|bmp)(\?.*)?$/i.test(v)) return true;
  if (/^https?:\/\/(i\.imgur\.com|img\.|cdn\.|lh\d\.googleusercontent\.com|res\.cloudinary\.com|imgbb\.com|ibb\.co)/i.test(v)) return true;
  if (/^https?:\/\/drive\.google\.com\/(file|uc|thumbnail)/i.test(v)) return true;
  if (/^https?:\/\/.+#/.test(v)) return false;
  return normalizeImageUrl(v) !== null && /\.(jpg|jpeg|png|gif|webp|svg|avif)/i.test(v);
}
function getImageSrc(val) {
  if (!val) return null;
  const v = val.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return normalizeImageUrl(v);
}
function parseRow(row) {
  return {
    id:          String(row.id || row.ID || Math.random()),
    name:        row.name        || row.nombre      || "",
    category:    row.category    || row.categoria   || "General",
    emoji:       row.emoji       || "🏪",
    rating:      parseFloat(row.rating || row.calificacion || "4.5"),
    reviews:     parseInt(row.reviews  || row.resenas     || "0"),
    address:     row.address     || row.direccion   || "",
    phone:       row.phone       || row.telefono    || "",
    hours:       row.hours       || row.horario     || "",
    description: row.description || row.descripcion || "",
    tags:        (row.tags || row.etiquetas || "").split(",").map(t => t.trim()).filter(Boolean),
    color:       row.color  || "#2563eb",
    accent:      row.accent || "#dbeafe",
    image:       row.image || row.imagen || row.emoji || "🏪",
    open:        String(row.open || row.abierto || "true").toLowerCase() === "true",
    lat:         parseFloat(row.lat || row.latitud  || "10.0678"),
    lng:         parseFloat(row.lng || row.longitud || "-69.3474"),
  };
}

// ── Highlight texto
function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "#fef08a", borderRadius: 3, padding: "0 1px", color: "inherit" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Imagen segura
function StoreImage({ image, size = 56, radius = 16, accent = "#e2e8f0" }) {
  const [err, setErr] = useState(false);
  const src = getImageSrc(image);
  if (src && isImageUrl(image) && !err) {
    return <img src={src} alt="" onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", display: "block", flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: accent,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.44, flexShrink: 0 }}>
      {image || "🏪"}
    </div>
  );
}

function Stars({ rating, size = 11 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}

// ── Card con highlights
function StoreCard({ store, onClick, index, searchQuery }) {
  return (
    <div onClick={onClick} className="scard" style={{ animationDelay: `${Math.min(index * 30, 250)}ms` }}>
      <StoreImage image={store.image} size={58} radius={14} accent={store.accent} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
          <span style={{ fontWeight: 800, fontSize: 14.5, color: "#0f172a", lineHeight: 1.25,
            overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
            WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
            <Highlight text={store.name} query={searchQuery} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: store.color, flexShrink: 0,
            background: store.accent, padding: "2px 9px", borderRadius: 99, lineHeight: 1.7 }}>
            ★ {store.rating}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: store.color, fontWeight: 700,
            background: store.accent, padding: "1px 8px", borderRadius: 99 }}>
            <Highlight text={store.category} query={searchQuery} />
          </span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>·</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: store.open ? "#16a34a" : "#94a3b8" }}>
            {store.open ? "● Abierto" : "● Cerrado"}
          </span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>·</span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>{store.reviews} reseñas</span>
        </div>
        <p style={{ fontSize: 11.5, color: "#64748b", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          📍 <Highlight text={store.address} query={searchQuery} />
        </p>
      </div>
    </div>
  );
}

// ── Modal tienda
function StoreModal({ store, onClose }) {
  const [imgErr, setImgErr] = useState(false);
  const src = getImageSrc(store.image);
  const hasImg = !!src && isImageUrl(store.image) && !imgErr;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex",
      alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,8,23,0.72)",
        backdropFilter: "blur(8px)", animation: "fd 0.2s ease" }} />
      <div onClick={e => e.stopPropagation()}
        style={{ position: "relative", background: "#fff", borderRadius: "24px 24px 0 0",
          width: "100%", maxWidth: 520, maxHeight: "93vh", overflowY: "auto",
          boxShadow: "0 -24px 70px rgba(0,0,0,0.3)", animation: "su 0.3s cubic-bezier(.22,.68,0,1.15)" }}>

        <div style={{ position: "relative", height: hasImg ? 200 : 140, flexShrink: 0,
          background: hasImg ? "#0f172a" : `linear-gradient(145deg, ${store.color}18 0%, ${store.accent} 100%)`,
          borderRadius: "24px 24px 0 0", overflow: "hidden" }}>
          {hasImg && (
            <>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${src})`,
                backgroundSize: "cover", backgroundPosition: "center",
                filter: "blur(22px) brightness(0.28)", transform: "scale(1.2)" }} />
              <img src={src} alt="" onError={() => setImgErr(true)}
                style={{ position: "relative", zIndex: 1, width: "100%", height: "100%",
                  objectFit: "contain", padding: "16px" }} />
            </>
          )}
          {!hasImg && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
              height: "100%", fontSize: 72 }}>{store.image}</div>
          )}
          <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
            width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.35)" }} />
          <button onClick={onClose}
            style={{ position: "absolute", top: 14, right: 14, zIndex: 10, width: 34, height: 34,
              borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.38)",
              color: "#fff", fontSize: 14, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", fontWeight: 800,
              backdropFilter: "blur(6px)" }}>✕</button>
          <span style={{ position: "absolute", bottom: 14, right: 16, zIndex: 10,
            background: store.open ? "#16a34a" : "#64748b", color: "#fff",
            fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 99, letterSpacing: 0.4 }}>
            {store.open ? "● ABIERTO" : "● CERRADO"}
          </span>
        </div>

        <div style={{ padding: "20px 20px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ background: store.accent, color: store.color, fontSize: 11,
              fontWeight: 800, padding: "3px 11px", borderRadius: 99 }}>
              {store.emoji} {store.category}
            </span>
            <Stars rating={store.rating} />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{store.rating}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>({store.reviews})</span>
          </div>
          <h2 style={{ fontSize: 23, fontWeight: 900, color: "#0f172a", marginBottom: 8,
            fontFamily: "'Georgia', serif", lineHeight: 1.2 }}>{store.name}</h2>
          <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
            {store.description}
          </p>
          {store.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {store.tags.map(t => (
                <span key={t} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px",
                  borderRadius: 99, background: store.accent, color: store.color }}>{t}</span>
              ))}
            </div>
          )}
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #f1f5f9", marginBottom: 20 }}>
            {[
              { icon: "📍", label: "Dirección", val: store.address },
              { icon: "📞", label: "Teléfono",  val: store.phone },
              { icon: "🕐", label: "Horario",   val: store.hours },
            ].map(({ icon, label, val }, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 13,
                padding: "13px 15px", background: i % 2 === 0 ? "#fff" : "#f8fafc",
                borderBottom: i < 2 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: store.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: 0.9, margin: "0 0 2px" }}>{label}</p>
                  <p style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 600, margin: 0 }}>{val}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: "16px",
            border: "1.5px solid #f1f5f9", marginBottom: 20, display: "flex", gap: 18, alignItems: "center" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <p style={{ fontSize: 42, fontWeight: 900, color: store.color, margin: 0, lineHeight: 1 }}>{store.rating}</p>
              <Stars rating={store.rating} size={13} />
              <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0", fontWeight: 700 }}>{store.reviews} reseñas</p>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              {[[5,72],[4,20],[3,8]].map(([n, pct]) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "#64748b", width: 8, fontWeight: 700 }}>{n}</span>
                  <span style={{ fontSize: 10, color: "#f59e0b" }}>★</span>
                  <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: store.color, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#94a3b8", width: 28, textAlign: "right" }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={`tel:${store.phone.replace(/[\s\-()\+]/g, "")}`}
              style={{ flex: 1, padding: "15px", borderRadius: 14, background: store.color,
                color: "#fff", textAlign: "center", textDecoration: "none",
                fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 7 }}>
              📞 Llamar
            </a>
            <a href={`https://www.google.com/maps?q=${store.lat},${store.lng}`}
              target="_blank" rel="noreferrer"
              style={{ padding: "15px 20px", borderRadius: 14, background: "#f1f5f9",
                color: "#334155", textDecoration: "none", fontSize: 22,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              🗺️
            </a>
            <button onClick={onClose}
              style={{ padding: "15px 20px", borderRadius: 14, background: "#f1f5f9",
                color: "#334155", border: "none", fontSize: 13, fontWeight: 800,
                cursor: "pointer", fontFamily: "inherit" }}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Config Modal
function ConfigModal({ sheetUrl, onConnect, onDemo, onClose }) {
  const [url, setUrl] = useState(sheetUrl.includes("TU_ID") ? "" : sheetUrl);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex",
      alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,8,23,0.75)",
        backdropFilter: "blur(8px)", animation: "fd 0.2s ease" }} />
      <div onClick={e => e.stopPropagation()}
        style={{ position: "relative", background: "#fff", borderRadius: "24px 24px 0 0",
          width: "100%", maxWidth: 520, padding: "24px 20px 40px",
          boxShadow: "0 -24px 60px rgba(0,0,0,0.25)", animation: "su 0.3s cubic-bezier(.22,.68,0,1.15)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#e2e8f0", margin: "0 auto 20px" }} />
        <h3 style={{ fontSize: 21, fontWeight: 900, color: "#0f172a", marginBottom: 6, fontFamily: "'Georgia', serif" }}>
          🔗 Conectar Google Sheet
        </h3>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 18, lineHeight: 1.6 }}>
          Publica tu hoja de cálculo como CSV y conecta aquí.
        </p>
        {["Archivo → Compartir → Publicar en la web",
          "Elige la hoja y formato CSV (.csv)",
          "Haz clic en Publicar y copia el enlace"].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0f172a",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.55, margin: 0 }}>{s}</p>
          </div>
        ))}
        <div style={{ background: "#f8fafc", borderRadius: 14, padding: "12px 14px",
          marginBottom: 16, marginTop: 8, border: "1.5px solid #f1f5f9" }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#64748b", marginBottom: 8,
            textTransform: "uppercase", letterSpacing: 0.8 }}>Columnas requeridas</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["id","name","category","emoji","image","rating","reviews","address","phone","hours","description","tags","color","accent","open","lat","lng"]
              .map(c => (
                <span key={c} style={{ background: "#e2e8f0", color: "#475569",
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{c}</span>
              ))}
          </div>
          <p style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginTop: 8 }}>
            💡 image acepta URLs https:// o emojis
          </p>
        </div>
        <input type="url" placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
          value={url} onChange={e => setUrl(e.target.value)}
          style={{ width: "100%", padding: "13px 15px", borderRadius: 13, fontSize: 13,
            border: "2px solid #e2e8f0", outline: "none", color: "#334155",
            marginBottom: 12, boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { if (url.trim()) onConnect(url.trim()); else onClose(); }}
            style={{ flex: 1, padding: "14px", background: "#0f172a", color: "#fff",
              border: "none", borderRadius: 14, fontSize: 14, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit" }}>
            ✓ Conectar Sheet
          </button>
          <button onClick={onDemo}
            style={{ padding: "14px 20px", background: "#f1f5f9", color: "#64748b",
              border: "none", borderRadius: 14, fontSize: 13, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit" }}>
            Demo
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
//  APP PRINCIPAL
// ════════════════════════════════════════
export default function App() {
  const [stores, setStores]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDemo, setUsingDemo]   = useState(false);
  const [sheetUrl, setSheetUrl]     = useState(GOOGLE_SHEET_CSV_URL);
  const [showConfig, setShowConfig] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [filtro, setFiltro]         = useState("Todos");
  const [busqueda, setBusqueda]     = useState("");
  const [soloAbiertos, setSoloAbiertos] = useState(false);
  const [searchMode, setSearchMode] = useState("todo"); // "todo" | "nombre" | "direccion" | "categoria"
  const [page, setPage]             = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);
  const mainRef   = useRef(null);

  const loadData = (url) => {
    setLoading(true);
    setPage(1);
    if (!url || url.includes("TU_ID_AQUI")) {
      setTimeout(() => { setStores(DEMO_STORES.map(parseRow)); setUsingDemo(true); setLoading(false); }, 650);
      return;
    }
    Papa.parse(url, {
      download: true, header: true, skipEmptyLines: true,
      complete: r => {
        if (r.data?.length > 0) { setStores(r.data.map(parseRow)); setUsingDemo(false); }
        else { setStores(DEMO_STORES.map(parseRow)); setUsingDemo(true); }
        setLoading(false);
      },
      error: () => { setStores(DEMO_STORES.map(parseRow)); setUsingDemo(true); setLoading(false); },
    });
  };

  useEffect(() => { loadData(sheetUrl); }, [sheetUrl]);

  // Resetear página cuando cambian filtros
  useEffect(() => { setPage(1); }, [busqueda, filtro, soloAbiertos, searchMode]);

  const categories = ["Todos", ...Array.from(new Set(stores.map(s => s.category)))];

  // Filtrado con modo de búsqueda
  const filtered = stores.filter(s => {
    if (filtro !== "Todos" && s.category !== filtro) return false;
    if (soloAbiertos && !s.open) return false;
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    switch (searchMode) {
      case "nombre":    return s.name.toLowerCase().includes(q);
      case "direccion": return s.address.toLowerCase().includes(q);
      case "categoria": return s.category.toLowerCase().includes(q) ||
                               s.tags.some(t => t.toLowerCase().includes(q));
      default: // "todo"
        return s.name.toLowerCase().includes(q) ||
               s.address.toLowerCase().includes(q) ||
               s.category.toLowerCase().includes(q) ||
               s.tags.some(t => t.toLowerCase().includes(q)) ||
               s.description.toLowerCase().includes(q);
    }
  });

  // Paginación
  const visibleStores = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visibleStores.length < filtered.length;

  // Scroll infinito con IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setPage(p => p + 1);
            setLoadingMore(false);
          }, 400);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore]);

  // Scroll al top cuando cambian filtros
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [busqueda, filtro, soloAbiertos, searchMode]);

  const SEARCH_MODES = [
    { id: "todo",      label: "Todo",       icon: "🔍" },
    { id: "nombre",    label: "Nombre",     icon: "🏪" },
    { id: "direccion", label: "Dirección",  icon: "📍" },
    { id: "categoria", label: "Categoría",  icon: "📂" },
  ];

  const placeholders = {
    todo:      "Buscar por nombre, dirección, categoría…",
    nombre:    "Buscar por nombre del local…",
    direccion: "Buscar por calle, av., urb., c.c…",
    categoria: "Buscar por categoría o etiqueta…",
  };

  const clearAll = () => { setBusqueda(""); setFiltro("Todos"); setSoloAbiertos(false); };
  const hasFilters = busqueda || filtro !== "Todos" || soloAbiertos;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw",
      overflow: "hidden", background: "#f8fafc", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:0;height:0;}
        @keyframes su{from{transform:translateY(56px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fd{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}

        .scard{
          display:flex;align-items:center;gap:14px;
          padding:13px 16px;cursor:pointer;
          border-bottom:1px solid #f1f5f9;
          transition:background 0.12s,transform 0.12s;
          animation:fadeSlide 0.32s ease both;
          background:#fff;
        }
        .scard:hover{background:#f8fafc;transform:translateX(3px);}
        .scard:active{background:#f1f5f9;transform:translateX(0);}

        .chip{padding:7px 15px;border-radius:99px;border:none;white-space:nowrap;
          font-weight:700;cursor:pointer;font-size:12px;transition:all 0.15s;
          flex-shrink:0;font-family:inherit;}
        .chip:hover{filter:brightness(1.07);transform:scale(1.03);}

        .smode-btn{
          display:flex;align-items:center;gap:5px;
          padding:6px 12px;border-radius:99px;border:none;
          font-size:11.5px;font-weight:700;cursor:pointer;
          transition:all 0.15s;white-space:nowrap;flex-shrink:0;
          font-family:inherit;
        }
        .smode-btn:hover{transform:scale(1.04);}

        .si:focus{
          border-color:#fff !important;
          box-shadow:0 0 0 3px rgba(255,255,255,0.25) !important;
          outline:none;
        }

        mark{background:#fef08a;border-radius:3px;padding:0 1px;}
      `}</style>

      {/* ══ HEADER ══ */}
      <header style={{ background: "linear-gradient(150deg, #0f172a 0%, #1e3a8a 100%)",
        padding: "14px 16px 0", flexShrink: 0,
        boxShadow: "0 8px 32px rgba(15,23,42,0.22)" }}>

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 11 }}>
          <div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 1.4,
              textTransform: "uppercase", marginBottom: 3, fontWeight: 600 }}>
              📍 Barquisimeto, Venezuela
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <h1 style={{ color: "#fff", fontSize: 27, fontWeight: 900,
                fontFamily: "'Georgia', serif", letterSpacing: "-0.5px", lineHeight: 1 }}>
                GuaroDato
              </h1>
              {usingDemo && (
                <span style={{ background: "#fbbf24", color: "#78350f", fontSize: 9,
                  fontWeight: 900, padding: "2px 8px", borderRadius: 99, letterSpacing: 0.6 }}>DEMO</span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={() => loadData(sheetUrl)}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff", padding: "8px 13px", borderRadius: 11, cursor: "pointer",
                fontSize: 15, fontWeight: 700 }}>↻</button>
            <button onClick={() => setShowConfig(true)}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff", padding: "8px 12px", borderRadius: 11, cursor: "pointer",
                fontSize: 12, fontWeight: 700 }}>⚙ Sheet</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {[
            `🏪 ${stores.length} locales`,
            `✅ ${stores.filter(s=>s.open).length} abiertos`,
            `📂 ${Math.max(0, categories.length-1)} categorías`,
          ].map(s => (
            <div key={s} style={{ background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 99, padding: "4px 11px", fontSize: 11,
              color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{s}</div>
          ))}
        </div>

        {/* Modos de búsqueda */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {SEARCH_MODES.map(m => (
            <button key={m.id} className="smode-btn" onClick={() => setSearchMode(m.id)}
              style={{
                background: searchMode === m.id ? "#fff" : "rgba(255,255,255,0.1)",
                color: searchMode === m.id ? "#0f172a" : "rgba(255,255,255,0.75)",
                border: searchMode === m.id ? "none" : "1px solid rgba(255,255,255,0.15)",
                boxShadow: searchMode === m.id ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
              }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          {/* Icono según modo */}
          <span style={{ position: "absolute", left: 13, top: "50%",
            transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none",
            opacity: 0.7 }}>
            {SEARCH_MODES.find(m => m.id === searchMode)?.icon}
          </span>
          <input className="si" type="text"
            placeholder={placeholders[searchMode]}
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ width: "100%", padding: "11px 40px 11px 38px", borderRadius: 12,
              border: "2px solid rgba(255,255,255,0.2)", boxSizing: "border-box", outline: "none",
              fontSize: 13.5, color: "#0f172a", background: "#fff",
              fontFamily: "inherit", fontWeight: 500, transition: "all 0.2s" }} />
          {busqueda && (
            <button onClick={() => setBusqueda("")}
              style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)",
                border: "none", background: "#e2e8f0", cursor: "pointer",
                borderRadius: "50%", width: 22, height: 22, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "#64748b", fontWeight: 900 }}>✕</button>
          )}
        </div>

        {/* Filtros de categoría */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <button key={cat} className="chip" onClick={() => setFiltro(cat)}
              style={{ background: filtro === cat ? "#fff" : "rgba(255,255,255,0.11)",
                color: filtro === cat ? "#0f172a" : "rgba(255,255,255,0.85)",
                border: filtro === cat ? "none" : "1px solid rgba(255,255,255,0.15)",
                boxShadow: filtro === cat ? "0 2px 8px rgba(0,0,0,0.15)" : "none" }}>
              {cat}
            </button>
          ))}
          <button className="chip" onClick={() => setSoloAbiertos(x => !x)}
            style={{ background: soloAbiertos ? "#22c55e" : "rgba(255,255,255,0.11)",
              color: soloAbiertos ? "#fff" : "rgba(255,255,255,0.85)",
              border: soloAbiertos ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
            {soloAbiertos ? "✅ Abiertos" : "🕐 Solo abiertos"}
          </button>
        </div>
      </header>

      {/* ══ LISTA ══ */}
      <main ref={mainRef} style={{ flex: 1, overflowY: "auto", background: "#fff" }}>

        {/* Barra de resultados */}
        {!loading && (
          <div style={{ padding: "10px 16px 4px", display: "flex",
            alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #f8fafc", position: "sticky", top: 0,
            background: "#fff", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 0.7 }}>
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </p>
              {busqueda && (
                <span style={{ fontSize: 11, background: "#f1f5f9", color: "#475569",
                  borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
                  {SEARCH_MODES.find(m => m.id === searchMode)?.icon} "{busqueda}"
                </span>
              )}
              {/* Indicador paginación */}
              {filtered.length > 0 && (
                <span style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 600 }}>
                  {visibleStores.length}/{filtered.length}
                </span>
              )}
            </div>
            {hasFilters && (
              <button onClick={clearAll}
                style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9",
                  border: "none", borderRadius: 99, padding: "3px 10px",
                  cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
                Limpiar ✕
              </button>
            )}
          </div>
        )}

        {/* Loading inicial */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 20px", gap: 14 }}>
            <div style={{ width: 38, height: 38, border: "4px solid #e2e8f0",
              borderTopColor: "#0f172a", borderRadius: "50%",
              animation: "spin 0.75s linear infinite" }} />
            <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>Cargando tiendas…</p>
          </div>
        )}

        {/* Banner demo */}
        {usingDemo && !loading && (
          <div onClick={() => setShowConfig(true)}
            style={{ margin: "10px 14px", background: "linear-gradient(135deg,#fef9c3,#fef3c7)",
              border: "1.5px solid #fde68a", borderRadius: 14, padding: "11px 14px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#78350f", margin: "0 0 1px" }}>
                Modo demo activo
              </p>
              <p style={{ fontSize: 11, color: "#92400e", margin: 0 }}>
                Toca aquí para conectar tu Google Sheet →
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 24px" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>
              {searchMode === "direccion" ? "🗺️" : "🔍"}
            </div>
            <p style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
              {busqueda
                ? searchMode === "direccion"
                  ? `No hay locales en "${busqueda}"`
                  : `Sin resultados para "${busqueda}"`
                : "Sin resultados"}
            </p>
            <p style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 18 }}>
              {searchMode === "direccion"
                ? "Prueba con otra calle, avenida o urbanización"
                : "Prueba con otro término o quita los filtros"}
            </p>
            <button onClick={clearAll}
              style={{ padding: "11px 22px", background: "#0f172a", color: "#fff",
                border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800,
                cursor: "pointer", fontFamily: "inherit" }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && visibleStores.map((s, i) => (
          <StoreCard key={s.id} store={s} index={i % PAGE_SIZE}
            onClick={() => setSelected(s)}
            searchQuery={busqueda} />
        ))}

        {/* ── SCROLL INFINITO: trigger + loader ── */}
        {!loading && hasMore && (
          <div ref={loaderRef} style={{ padding: "20px 16px", display: "flex",
            flexDirection: "column", alignItems: "center", gap: 8 }}>
            {loadingMore ? (
              <>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%",
                      background: "#cbd5e1", animation: `blink 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                  Cargando más locales…
                </p>
              </>
            ) : (
              <p style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600 }}>↓ desliza para más</p>
            )}
          </div>
        )}

        {/* Footer cuando ya no hay más */}
        {!loading && !hasMore && filtered.length > 0 && (
          <div style={{ padding: "20px 16px", textAlign: "center",
            borderTop: "1px solid #f8fafc", marginTop: 4 }}>
            <p style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 600 }}>
              ✓ {filtered.length} locales · Barquisimeto
            </p>
          </div>
        )}
      </main>

      {selected && <StoreModal store={selected} onClose={() => setSelected(null)} />}
      {showConfig && (
        <ConfigModal sheetUrl={sheetUrl}
          onConnect={url => { setSheetUrl(url); setShowConfig(false); }}
          onDemo={() => { loadData(null); setShowConfig(false); }}
          onClose={() => setShowConfig(false)} />
      )}
    </div>
  );
}