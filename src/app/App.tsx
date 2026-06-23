"use client";
import { useState, useReducer } from "react";

// ── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  verde:   "#1B4332",
  menta:   "#40916C",
  lima:    "#74C69D",
  claro:   "#D8F3DC",
  creme:   "#F8FAF5",
  roxo:    "#6B21A8",
  roxoCl:  "#EDE9FE",
  laranja: "#C4622D",
  larCl:   "#FEE2D5",
  vermelho:"#B91C1C",
  verCl:   "#FEE2E2",
  azul:    "#1D4ED8",
  azulCl:  "#DBEAFE",
  cinza:   "#6B7280",
  cinzaCl: "#F3F4F6",
  branco:  "#FFFFFF",
  texto:   "#1C2B1A",
};

const PRODUTOS_BASE = [
  { id: 1, nome: "Morango",        emoji: "🍓", unidade: "cx" },
  { id: 2, nome: "Couve Picada",   emoji: "🥬", unidade: "cx" },
  { id: 3, nome: "Quiabo",         emoji: "🫛", unidade: "cx" },
  { id: 4, nome: "Vagem",          emoji: "🫘", unidade: "cx" },
  { id: 5, nome: "Repolho Verde",  emoji: "🥦", unidade: "cx" },
  { id: 6, nome: "Repolho Roxo",   emoji: "💜", unidade: "cx" },
  { id: 7, nome: "Pepino",         emoji: "🥒", unidade: "cx" },
  { id: 8, nome: "Pimenta",        emoji: "🌶️", unidade: "cx" },
  { id: 9, nome: "Hortaliças Mix", emoji: "🌿", unidade: "cx" },
];

const estadoInicial = {
  semana: semanaAtual(),
  compras: [],
  vendas: [],
  gastos: [],
  contatos: [],  // { id, nome, tipo: "fornecedor"|"cliente", telefone, obs }
};

function semanaAtual() {
  const hoje = new Date();
  const dia = hoje.getDay();
  const seg = new Date(hoje);
  seg.setDate(hoje.getDate() - (dia === 0 ? 6 : dia - 1));
  const sab = new Date(seg);
  sab.setDate(seg.getDate() + 6);
  return { inicio: fmtDate(seg), fim: fmtDate(sab) };
}

function fmtDate(d) { return d.toISOString().slice(0, 10); }
function fmtBRL(v) { return "R$ " + Number(v || 0).toFixed(2).replace(".", ","); }
function fmtDateBR(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

let nextId = 1000;
function uid() { return ++nextId; }

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "ADD_COMPRA":   return { ...state, compras:  [action.payload, ...state.compras] };
    case "DEL_COMPRA":   return { ...state, compras:  state.compras.filter(x => x.id !== action.id) };
    case "ADD_VENDA":    return { ...state, vendas:   [action.payload, ...state.vendas] };
    case "DEL_VENDA":    return { ...state, vendas:   state.vendas.filter(x => x.id !== action.id) };
    case "ADD_GASTO":    return { ...state, gastos:   [action.payload, ...state.gastos] };
    case "DEL_GASTO":    return { ...state, gastos:   state.gastos.filter(x => x.id !== action.id) };
    case "ADD_CONTATO":  return { ...state, contatos: [action.payload, ...state.contatos] };
    case "DEL_CONTATO":  return { ...state, contatos: state.contatos.filter(x => x.id !== action.id) };
    default: return state;
  }
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function TabBar({ aba, setAba }) {
  const tabs = [
    { id: "resumo",    icon: "📊", label: "Resumo" },
    { id: "compras",   icon: "📦", label: "Compras" },
    { id: "vendas",    icon: "💰", label: "Vendas" },
    { id: "gastos",    icon: "💸", label: "Gastos" },
    { id: "contatos",  icon: "👥", label: "Contatos" },
    { id: "relatorio", icon: "📄", label: "Relatório" },
    { id: "fechamento",icon: "📋", label: "Semana" },
  ];
  return (
    <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.branco, borderTop: `1px solid ${C.cinzaCl}`, display: "flex", zIndex: 200, boxShadow: "0 -2px 12px rgba(0,0,0,0.08)", overflowX: "auto" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setAba(t.id)} style={{ flex: "0 0 auto", minWidth: 52, border: "none", background: "none", padding: "8px 6px 5px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: aba === t.id ? C.menta : C.cinza, letterSpacing: 0.2 }}>{t.label}</span>
          {aba === t.id && <div style={{ width: 18, height: 3, borderRadius: 2, background: C.menta, marginTop: 1 }} />}
        </button>
      ))}
    </nav>
  );
}

function Card({ children, style }) {
  return <div style={{ background: C.branco, borderRadius: 16, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 12, ...style }}>{children}</div>;
}

function Stat({ label, valor, cor, icon }) {
  return (
    <div style={{ background: C.branco, borderRadius: 14, padding: "14px 12px", flex: 1, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", borderTop: `4px solid ${cor}` }}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: cor, marginTop: 6 }}>{valor}</div>
      <div style={{ fontSize: 10, color: C.cinza, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SelectProduto({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.cinzaCl}`, fontSize: 14, background: C.branco, color: C.texto, marginBottom: 10 }}>
      <option value="">Selecionar produto...</option>
      {PRODUTOS_BASE.map(p => <option key={p.id} value={p.nome}>{p.emoji} {p.nome}</option>)}
    </select>
  );
}

function SelectContato({ value, onChange, contatos, tipo }) {
  const filtrados = contatos.filter(c => c.tipo === tipo);
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.cinzaCl}`, fontSize: 14, background: C.branco, color: C.texto, marginBottom: 10 }}>
      <option value="">Selecionar {tipo === "fornecedor" ? "fornecedor" : "cliente"}...</option>
      {filtrados.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
      <option value="__avulso__">✏️ Digitar nome manualmente</option>
    </select>
  );
}

function Inp({ label, ...props }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 4 }}>{label}</div>}
      <input {...props} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.cinzaCl}`, fontSize: 14, color: C.texto, background: C.branco, outline: "none", ...props.style }} />
    </div>
  );
}

function Btn({ children, onClick, cor, outline }) {
  return (
    <button onClick={onClick} style={{ width: "100%", padding: "13px", borderRadius: 12, border: outline ? `2px solid ${cor || C.menta}` : "none", background: outline ? "transparent" : (cor || C.menta), color: outline ? (cor || C.menta) : C.branco, fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
      {children}
    </button>
  );
}

function ItemLista({ emoji, titulo, sub, valor, corValor, onDel, tag }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: `1px solid ${C.cinzaCl}` }}>
      <div style={{ fontSize: 26, flexShrink: 0 }}>{emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.texto, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titulo}</div>
        <div style={{ fontSize: 11, color: C.cinza, marginTop: 1 }}>{sub}</div>
        {tag && <div style={{ fontSize: 10, fontWeight: 700, color: tag.cor, background: tag.bg, borderRadius: 6, padding: "1px 6px", display: "inline-block", marginTop: 3 }}>{tag.label}</div>}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {valor !== undefined && <div style={{ fontWeight: 800, fontSize: 14, color: corValor || C.texto }}>{fmtBRL(valor)}</div>}
        <button onClick={onDel} style={{ background: "none", border: "none", color: C.vermelho, fontSize: 11, cursor: "pointer", padding: 0, marginTop: 2 }}>remover</button>
      </div>
    </div>
  );
}

// ── Tela Resumo ───────────────────────────────────────────────────────────────
function TelaResumo({ state }) {
  const totalCompras = state.compras.reduce((a, x) => a + x.total, 0);
  const totalVendas  = state.vendas.reduce((a, x) => a + x.total, 0);
  const totalGastos  = state.gastos.reduce((a, x) => a + x.valor, 0);
  const lucro        = totalVendas - totalCompras - totalGastos;
  const porProd = {};
  state.vendas.forEach(v => { porProd[v.produto] = (porProd[v.produto] || 0) + v.total; });
  const topProd = Object.entries(porProd).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${C.verde}, ${C.menta})`, padding: "20px 20px 28px", marginBottom: -16 }}>
        <div style={{ fontSize: 11, color: C.lima, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>HortaFresh · Gestão</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.branco, marginTop: 4 }}>Visão Geral</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Semana {fmtDateBR(state.semana.inicio)} – {fmtDateBR(state.semana.fim)}</div>
      </div>
      <div style={{ padding: "24px 16px 0" }}>
        <Card style={{ background: lucro >= 0 ? `linear-gradient(135deg, ${C.verde}, ${C.menta})` : `linear-gradient(135deg, #7f1d1d, ${C.vermelho})`, color: C.branco, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 1, textTransform: "uppercase" }}>Lucro da semana</div>
          <div style={{ fontSize: 36, fontWeight: 900, marginTop: 6 }}>{fmtBRL(lucro)}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{lucro >= 0 ? "✅ No positivo" : "⚠️ No negativo"}</div>
        </Card>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <Stat label="Compras"  valor={fmtBRL(totalCompras)} cor={C.roxo}    icon="📦" />
          <Stat label="Vendas"   valor={fmtBRL(totalVendas)}  cor={C.menta}   icon="💰" />
          <Stat label="Gastos"   valor={fmtBRL(totalGastos)}  cor={C.laranja} icon="💸" />
        </div>
        {topProd && (
          <Card>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.cinza, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Produto em destaque</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 36 }}>{PRODUTOS_BASE.find(p => p.nome === topProd[0])?.emoji || "🌿"}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.texto }}>{topProd[0]}</div>
                <div style={{ fontSize: 13, color: C.menta, fontWeight: 700 }}>{fmtBRL(topProd[1])} em vendas</div>
              </div>
            </div>
          </Card>
        )}
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.cinza, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Contatos cadastrados</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: C.roxoCl, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.roxo }}>{state.contatos.filter(c => c.tipo === "fornecedor").length}</div>
              <div style={{ fontSize: 11, color: C.roxo, fontWeight: 600 }}>Fornecedores</div>
            </div>
            <div style={{ flex: 1, background: C.claro, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.menta }}>{state.contatos.filter(c => c.tipo === "cliente").length}</div>
              <div style={{ fontSize: 11, color: C.menta, fontWeight: 600 }}>Clientes</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Tela Compras ──────────────────────────────────────────────────────────────
function TelaCompras({ state, dispatch }) {
  const [form, setForm] = useState({ data: fmtDate(new Date()), produto: "", qtdCx: "", precoCx: "", fornecedor: "", fornecedorManual: "" });
  const [avulso, setAvulso] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const totalForm = (Number(form.qtdCx) || 0) * (Number(form.precoCx) || 0);

  const handleFornecedor = (v) => {
    if (v === "__avulso__") { setAvulso(true); set("fornecedor", ""); }
    else { setAvulso(false); set("fornecedor", v); }
  };

  const salvar = () => {
    const forn = avulso ? form.fornecedorManual : form.fornecedor;
    if (!form.produto || !form.qtdCx || !form.precoCx) return;
    dispatch({ type: "ADD_COMPRA", payload: { id: uid(), data: form.data, produto: form.produto, qtdCx: Number(form.qtdCx), precoCx: Number(form.precoCx), total: totalForm, fornecedor: forn } });
    setForm(f => ({ ...f, produto: "", qtdCx: "", precoCx: "", fornecedor: "", fornecedorManual: "" }));
    setAvulso(false);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 90 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: C.verde, marginBottom: 16 }}>📦 Registrar Compra</div>
      <Card>
        <Inp label="Data" type="date" value={form.data} onChange={e => set("data", e.target.value)} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 4 }}>Produto</div>
        <SelectProduto value={form.produto} onChange={v => set("produto", v)} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 4 }}>Comprado de (fornecedor)</div>
        <SelectContato value={avulso ? "__avulso__" : form.fornecedor} onChange={handleFornecedor} contatos={state.contatos} tipo="fornecedor" />
        {avulso && <Inp label="Nome do fornecedor" placeholder="Ex: Zé da Roça" value={form.fornecedorManual} onChange={e => set("fornecedorManual", e.target.value)} />}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Inp label="Qtd (caixas)" type="number" placeholder="0" value={form.qtdCx} onChange={e => set("qtdCx", e.target.value)} /></div>
          <div style={{ flex: 1 }}><Inp label="Preço / caixa (R$)" type="number" placeholder="0,00" value={form.precoCx} onChange={e => set("precoCx", e.target.value)} /></div>
        </div>
        {totalForm > 0 && (
          <div style={{ background: C.roxoCl, borderRadius: 10, padding: "8px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.roxo, fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: C.roxo }}>{fmtBRL(totalForm)}</span>
          </div>
        )}
        <Btn onClick={salvar} cor={C.roxo}>Registrar Compra</Btn>
      </Card>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Histórico</div>
      {state.compras.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 24, fontSize: 13 }}>Nenhuma compra registrada</div>}
      <Card style={{ padding: "4px 16px" }}>
        {state.compras.map(c => {
          const prod = PRODUTOS_BASE.find(p => p.nome === c.produto);
          return <ItemLista key={c.id} emoji={prod?.emoji || "📦"} titulo={c.produto} sub={`${fmtDateBR(c.data)} · ${c.qtdCx} cx × ${fmtBRL(c.precoCx)}${c.fornecedor ? " · " + c.fornecedor : ""}`} valor={c.total} corValor={C.roxo} onDel={() => dispatch({ type: "DEL_COMPRA", id: c.id })} />;
        })}
      </Card>
    </div>
  );
}

// ── Tela Vendas ───────────────────────────────────────────────────────────────
function TelaVendas({ state, dispatch }) {
  const [form, setForm] = useState({ data: fmtDate(new Date()), produto: "", qtdCx: "", precoCx: "", cliente: "", clienteManual: "" });
  const [avulso, setAvulso] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const totalForm = (Number(form.qtdCx) || 0) * (Number(form.precoCx) || 0);

  const handleCliente = (v) => {
    if (v === "__avulso__") { setAvulso(true); set("cliente", ""); }
    else { setAvulso(false); set("cliente", v); }
  };

  const salvar = () => {
    const cli = avulso ? form.clienteManual : form.cliente;
    if (!form.produto || !form.qtdCx || !form.precoCx) return;
    dispatch({ type: "ADD_VENDA", payload: { id: uid(), data: form.data, produto: form.produto, qtdCx: Number(form.qtdCx), precoCx: Number(form.precoCx), total: totalForm, cliente: cli } });
    setForm(f => ({ ...f, produto: "", qtdCx: "", precoCx: "", cliente: "", clienteManual: "" }));
    setAvulso(false);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 90 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: C.verde, marginBottom: 16 }}>💰 Registrar Venda</div>
      <Card>
        <Inp label="Data" type="date" value={form.data} onChange={e => set("data", e.target.value)} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 4 }}>Produto</div>
        <SelectProduto value={form.produto} onChange={v => set("produto", v)} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 4 }}>Vendido para (cliente)</div>
        <SelectContato value={avulso ? "__avulso__" : form.cliente} onChange={handleCliente} contatos={state.contatos} tipo="cliente" />
        {avulso && <Inp label="Nome do cliente" placeholder="Ex: Mercado do João" value={form.clienteManual} onChange={e => set("clienteManual", e.target.value)} />}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><Inp label="Qtd (caixas)" type="number" placeholder="0" value={form.qtdCx} onChange={e => set("qtdCx", e.target.value)} /></div>
          <div style={{ flex: 1 }}><Inp label="Preço / caixa (R$)" type="number" placeholder="0,00" value={form.precoCx} onChange={e => set("precoCx", e.target.value)} /></div>
        </div>
        {totalForm > 0 && (
          <div style={{ background: C.claro, borderRadius: 10, padding: "8px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.menta, fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: C.menta }}>{fmtBRL(totalForm)}</span>
          </div>
        )}
        <Btn onClick={salvar} cor={C.menta}>Registrar Venda</Btn>
      </Card>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Histórico</div>
      {state.vendas.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 24, fontSize: 13 }}>Nenhuma venda registrada</div>}
      <Card style={{ padding: "4px 16px" }}>
        {state.vendas.map(v => {
          const prod = PRODUTOS_BASE.find(p => p.nome === v.produto);
          return <ItemLista key={v.id} emoji={prod?.emoji || "💰"} titulo={v.produto} sub={`${fmtDateBR(v.data)} · ${v.qtdCx} cx × ${fmtBRL(v.precoCx)}${v.cliente ? " · " + v.cliente : ""}`} valor={v.total} corValor={C.menta} onDel={() => dispatch({ type: "DEL_VENDA", id: v.id })} />;
        })}
      </Card>
    </div>
  );
}

// ── Tela Gastos ───────────────────────────────────────────────────────────────
const CATS_GASTO = ["Transporte", "Embalagem", "Funcionário", "Frete", "Alimentação", "Outros"];
const EMOJI_CAT = { Transporte: "🚛", Embalagem: "📦", Funcionário: "👷", Frete: "🚚", Alimentação: "🍽️", Outros: "💸" };

function TelaGastos({ state, dispatch }) {
  const [form, setForm] = useState({ data: fmtDate(new Date()), descricao: "", valor: "", categoria: "Outros" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const salvar = () => {
    if (!form.descricao || !form.valor) return;
    dispatch({ type: "ADD_GASTO", payload: { id: uid(), ...form, valor: Number(form.valor) } });
    setForm(f => ({ ...f, descricao: "", valor: "" }));
  };

  return (
    <div style={{ padding: 16, paddingBottom: 90 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: C.verde, marginBottom: 16 }}>💸 Registrar Gasto</div>
      <Card>
        <Inp label="Data" type="date" value={form.data} onChange={e => set("data", e.target.value)} />
        <Inp label="Descrição" type="text" placeholder="Ex: Frete do mercado..." value={form.descricao} onChange={e => set("descricao", e.target.value)} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 4 }}>Categoria</div>
        <select value={form.categoria} onChange={e => set("categoria", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.cinzaCl}`, fontSize: 14, background: C.branco, color: C.texto, marginBottom: 10 }}>
          {CATS_GASTO.map(c => <option key={c} value={c}>{EMOJI_CAT[c]} {c}</option>)}
        </select>
        <Inp label="Valor (R$)" type="number" placeholder="0,00" value={form.valor} onChange={e => set("valor", e.target.value)} />
        <Btn onClick={salvar} cor={C.laranja}>Registrar Gasto</Btn>
      </Card>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Histórico</div>
      {state.gastos.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 24, fontSize: 13 }}>Nenhum gasto registrado</div>}
      <Card style={{ padding: "4px 16px" }}>
        {state.gastos.map(g => (
          <ItemLista key={g.id} emoji={EMOJI_CAT[g.categoria] || "💸"} titulo={g.descricao} sub={`${fmtDateBR(g.data)} · ${g.categoria}`} valor={g.valor} corValor={C.laranja} onDel={() => dispatch({ type: "DEL_GASTO", id: g.id })} />
        ))}
      </Card>
    </div>
  );
}

// ── Tela Contatos ─────────────────────────────────────────────────────────────
function TelaContatos({ state, dispatch }) {
  const [form, setForm] = useState({ nome: "", tipo: "fornecedor", telefone: "", obs: "" });
  const [filtro, setFiltro] = useState("todos");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const salvar = () => {
    if (!form.nome) return;
    dispatch({ type: "ADD_CONTATO", payload: { id: uid(), ...form } });
    setForm({ nome: "", tipo: "fornecedor", telefone: "", obs: "" });
  };

  const fornecedores = state.contatos.filter(c => c.tipo === "fornecedor");
  const clientes     = state.contatos.filter(c => c.tipo === "cliente");
  const lista = filtro === "todos" ? state.contatos : state.contatos.filter(c => c.tipo === filtro);

  // Histórico por contato
  const gastosPorContato = (nome, tipo) => {
    if (tipo === "fornecedor") return state.compras.filter(c => c.fornecedor === nome).reduce((a, x) => a + x.total, 0);
    return state.vendas.filter(v => v.cliente === nome).reduce((a, x) => a + x.total, 0);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 90 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: C.verde, marginBottom: 16 }}>👥 Contatos</div>

      {/* Mini estatísticas */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, background: C.roxoCl, borderRadius: 12, padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.roxo }}>{fornecedores.length}</div>
          <div style={{ fontSize: 11, color: C.roxo, fontWeight: 700 }}>🚜 Fornecedores</div>
        </div>
        <div style={{ flex: 1, background: C.claro, borderRadius: 12, padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.menta }}>{clientes.length}</div>
          <div style={{ fontSize: 11, color: C.menta, fontWeight: 700 }}>🛒 Clientes</div>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.texto, marginBottom: 12 }}>Adicionar contato</div>

        {/* Toggle fornecedor/cliente */}
        <div style={{ display: "flex", background: C.cinzaCl, borderRadius: 10, padding: 3, marginBottom: 12 }}>
          {[{ val: "fornecedor", label: "🚜 Fornecedor" }, { val: "cliente", label: "🛒 Cliente" }].map(op => (
            <button key={op.val} onClick={() => set("tipo", op.val)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", background: form.tipo === op.val ? C.branco : "transparent", color: form.tipo === op.val ? C.texto : C.cinza, boxShadow: form.tipo === op.val ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
              {op.label}
            </button>
          ))}
        </div>

        <Inp label="Nome" type="text" placeholder={form.tipo === "fornecedor" ? "Ex: Zé da Roça" : "Ex: Mercado do João"} value={form.nome} onChange={e => set("nome", e.target.value)} />
        <Inp label="Telefone (opcional)" type="tel" placeholder="(00) 00000-0000" value={form.telefone} onChange={e => set("telefone", e.target.value)} />
        <Inp label="Observação (opcional)" type="text" placeholder="Ex: entrega toda segunda" value={form.obs} onChange={e => set("obs", e.target.value)} />
        <Btn onClick={salvar} cor={form.tipo === "fornecedor" ? C.roxo : C.menta}>
          Salvar {form.tipo === "fornecedor" ? "Fornecedor" : "Cliente"}
        </Btn>
      </Card>

      {/* Filtro lista */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[["todos", "Todos"], ["fornecedor", "Fornecedores"], ["cliente", "Clientes"]].map(([val, label]) => (
          <button key={val} onClick={() => setFiltro(val)} style={{ padding: "5px 12px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", background: filtro === val ? C.menta : C.branco, color: filtro === val ? C.branco : C.cinza, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            {label}
          </button>
        ))}
      </div>

      {lista.length === 0 && <div style={{ textAlign: "center", color: C.cinza, padding: 24, fontSize: 13 }}>Nenhum contato cadastrado</div>}

      {lista.map(c => {
        const total = gastosPorContato(c.nome, c.tipo);
        const isForn = c.tipo === "fornecedor";
        return (
          <Card key={c.id} style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>{isForn ? "🚜" : "🛒"}</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: C.texto }}>{c.nome}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, background: isForn ? C.roxoCl : C.claro, color: isForn ? C.roxo : C.menta, borderRadius: 6, padding: "1px 7px" }}>
                    {isForn ? "Fornecedor" : "Cliente"}
                  </span>
                </div>
                {c.telefone && <div style={{ fontSize: 12, color: C.cinza, marginLeft: 30 }}>📞 {c.telefone}</div>}
                {c.obs && <div style={{ fontSize: 12, color: C.cinza, marginLeft: 30, marginTop: 2 }}>💬 {c.obs}</div>}
                {total > 0 && (
                  <div style={{ marginLeft: 30, marginTop: 6, fontSize: 12, fontWeight: 700, color: isForn ? C.roxo : C.menta }}>
                    {isForn ? `Total comprado: ${fmtBRL(total)}` : `Total vendido: ${fmtBRL(total)}`}
                  </div>
                )}
              </div>
              <button onClick={() => dispatch({ type: "DEL_CONTATO", id: c.id })} style={{ background: "none", border: "none", color: C.vermelho, fontSize: 12, cursor: "pointer", padding: 0, flexShrink: 0 }}>remover</button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Tela Relatório Diário ─────────────────────────────────────────────────────
function TelaRelatorio({ state }) {
  const [dataSel, setDataSel] = useState(fmtDate(new Date()));
  const [copiado, setCopiado] = useState(false);

  const comprasDia  = state.compras.filter(x => x.data === dataSel);
  const vendasDia   = state.vendas.filter(x => x.data === dataSel);
  const gastosDia   = state.gastos.filter(x => x.data === dataSel);

  const totalCompras = comprasDia.reduce((a, x) => a + x.total, 0);
  const totalVendas  = vendasDia.reduce((a, x) => a + x.total, 0);
  const totalGastos  = gastosDia.reduce((a, x) => a + x.valor, 0);
  const lucro        = totalVendas - totalCompras - totalGastos;

  const gerarTexto = () => {
    const linhas = [];
    linhas.push(`🌿 RELATÓRIO DIÁRIO — HORTAFRESH`);
    linhas.push(`📅 Data: ${fmtDateBR(dataSel)}`);
    linhas.push(`${"─".repeat(32)}`);

    if (comprasDia.length > 0) {
      linhas.push(`\n📦 COMPRAS`);
      comprasDia.forEach(c => {
        linhas.push(`  • ${c.produto}: ${c.qtdCx} cx × ${fmtBRL(c.precoCx)} = ${fmtBRL(c.total)}${c.fornecedor ? ` (${c.fornecedor})` : ""}`);
      });
      linhas.push(`  Total compras: ${fmtBRL(totalCompras)}`);
    }

    if (vendasDia.length > 0) {
      linhas.push(`\n💰 VENDAS`);
      vendasDia.forEach(v => {
        linhas.push(`  • ${v.produto}: ${v.qtdCx} cx × ${fmtBRL(v.precoCx)} = ${fmtBRL(v.total)}${v.cliente ? ` (${v.cliente})` : ""}`);
      });
      linhas.push(`  Total vendas: ${fmtBRL(totalVendas)}`);
    }

    if (gastosDia.length > 0) {
      linhas.push(`\n💸 GASTOS`);
      gastosDia.forEach(g => {
        linhas.push(`  • ${g.descricao} [${g.categoria}]: ${fmtBRL(g.valor)}`);
      });
      linhas.push(`  Total gastos: ${fmtBRL(totalGastos)}`);
    }

    linhas.push(`\n${"─".repeat(32)}`);
    linhas.push(`📊 RESULTADO DO DIA`);
    linhas.push(`  Vendas:   ${fmtBRL(totalVendas)}`);
    linhas.push(`  Compras:  - ${fmtBRL(totalCompras)}`);
    linhas.push(`  Gastos:   - ${fmtBRL(totalGastos)}`);
    linhas.push(`  ──────────────────`);
    linhas.push(`  Lucro:    ${fmtBRL(lucro)} ${lucro >= 0 ? "✅" : "⚠️"}`);

    return linhas.join("\n");
  };

  const copiar = () => {
    const texto = gerarTexto();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      });
    } else {
      // fallback
      const el = document.createElement("textarea");
      el.value = texto;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const temDados = comprasDia.length + vendasDia.length + gastosDia.length > 0;

  return (
    <div style={{ padding: 16, paddingBottom: 90 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: C.verde, marginBottom: 4 }}>📄 Relatório Diário</div>
      <div style={{ fontSize: 12, color: C.cinza, marginBottom: 16 }}>Selecione o dia para gerar e exportar o relatório</div>

      <Card>
        <Inp label="Data do relatório" type="date" value={dataSel} onChange={e => setDataSel(e.target.value)} />
      </Card>

      {!temDados ? (
        <div style={{ textAlign: "center", color: C.cinza, padding: "32px 20px" }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <div style={{ fontWeight: 700, marginTop: 12 }}>Sem movimentações</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Nenhum dado para {fmtDateBR(dataSel)}</div>
        </div>
      ) : (
        <>
          {/* Cards resumo do dia */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <Stat label="Compras"  valor={fmtBRL(totalCompras)} cor={C.roxo}    icon="📦" />
            <Stat label="Vendas"   valor={fmtBRL(totalVendas)}  cor={C.menta}   icon="💰" />
            <Stat label="Gastos"   valor={fmtBRL(totalGastos)}  cor={C.laranja} icon="💸" />
          </div>

          <Card style={{ background: lucro >= 0 ? C.claro : C.verCl, border: `2px solid ${lucro >= 0 ? C.menta : C.vermelho}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: C.texto }}>Lucro do dia</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: lucro >= 0 ? C.menta : C.vermelho }}>{fmtBRL(lucro)}</span>
            </div>
          </Card>

          {/* Compras do dia */}
          {comprasDia.length > 0 && (
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.roxo, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>📦 Compras</div>
              {comprasDia.map(c => {
                const prod = PRODUTOS_BASE.find(p => p.nome === c.produto);
                return (
                  <div key={c.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.cinzaCl}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{prod?.emoji} {c.produto}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.roxo }}>{fmtBRL(c.total)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.cinza }}>{c.qtdCx} cx × {fmtBRL(c.precoCx)}{c.fornecedor ? ` · ${c.fornecedor}` : ""}</div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.cinza }}>Total compras</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: C.roxo }}>{fmtBRL(totalCompras)}</span>
              </div>
            </Card>
          )}

          {/* Vendas do dia */}
          {vendasDia.length > 0 && (
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.menta, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>💰 Vendas</div>
              {vendasDia.map(v => {
                const prod = PRODUTOS_BASE.find(p => p.nome === v.produto);
                return (
                  <div key={v.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.cinzaCl}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{prod?.emoji} {v.produto}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.menta }}>{fmtBRL(v.total)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.cinza }}>{v.qtdCx} cx × {fmtBRL(v.precoCx)}{v.cliente ? ` · ${v.cliente}` : ""}</div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.cinza }}>Total vendas</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: C.menta }}>{fmtBRL(totalVendas)}</span>
              </div>
            </Card>
          )}

          {/* Gastos do dia */}
          {gastosDia.length > 0 && (
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.laranja, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>💸 Gastos</div>
              {gastosDia.map(g => (
                <div key={g.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.cinzaCl}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{g.descricao}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.laranja }}>{fmtBRL(g.valor)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.cinza }}>{g.categoria}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.cinza }}>Total gastos</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: C.laranja }}>{fmtBRL(totalGastos)}</span>
              </div>
            </Card>
          )}

          {/* Preview texto */}
          <Card style={{ background: "#1C2B1A" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.lima, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Prévia do relatório</div>
            <pre style={{ fontSize: 11, color: "#a3e6b3", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6, fontFamily: "monospace" }}>
              {gerarTexto()}
            </pre>
          </Card>

          {/* Botão copiar */}
          <button onClick={copiar} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: copiado ? C.menta : C.verde, color: C.branco, fontWeight: 800, fontSize: 16, cursor: "pointer", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.3s" }}>
            {copiado ? "✅ Copiado! Cole no WhatsApp" : "📋 Copiar relatório"}
          </button>
          <div style={{ textAlign: "center", fontSize: 11, color: C.cinza, marginTop: 8 }}>Cole direto no WhatsApp, e-mail ou anotações</div>
        </>
      )}
    </div>
  );
}

// ── Tela Fechamento ───────────────────────────────────────────────────────────
function TelaFechamento({ state }) {
  const totalCompras = state.compras.reduce((a, x) => a + x.total, 0);
  const totalVendas  = state.vendas.reduce((a, x) => a + x.total, 0);
  const totalGastos  = state.gastos.reduce((a, x) => a + x.valor, 0);
  const lucro        = totalVendas - totalCompras - totalGastos;
  const margem       = totalVendas > 0 ? (lucro / totalVendas * 100).toFixed(1) : 0;

  const porProd = {};
  PRODUTOS_BASE.forEach(p => { porProd[p.nome] = { compras: 0, vendas: 0, cxComp: 0, cxVend: 0, emoji: p.emoji }; });
  state.compras.forEach(c => { if (porProd[c.produto]) { porProd[c.produto].compras += c.total; porProd[c.produto].cxComp += c.qtdCx; } });
  state.vendas.forEach(v => { if (porProd[v.produto]) { porProd[v.produto].vendas += v.total; porProd[v.produto].cxVend += v.qtdCx; } });
  const prodAtivos = Object.entries(porProd).filter(([, v]) => v.compras > 0 || v.vendas > 0);

  const porCat = {};
  state.gastos.forEach(g => { porCat[g.categoria] = (porCat[g.categoria] || 0) + g.valor; });

  // Top clientes
  const porCliente = {};
  state.vendas.forEach(v => { if (v.cliente) porCliente[v.cliente] = (porCliente[v.cliente] || 0) + v.total; });
  const topClientes = Object.entries(porCliente).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Top fornecedores
  const porForn = {};
  state.compras.forEach(c => { if (c.fornecedor) porForn[c.fornecedor] = (porForn[c.fornecedor] || 0) + c.total; });
  const topForn = Object.entries(porForn).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div style={{ padding: 16, paddingBottom: 90 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: C.verde, marginBottom: 4 }}>📋 Fechamento Semanal</div>
      <div style={{ fontSize: 12, color: C.cinza, marginBottom: 16 }}>{fmtDateBR(state.semana.inicio)} – {fmtDateBR(state.semana.fim)}</div>

      <Card style={{ background: lucro >= 0 ? `linear-gradient(135deg, ${C.verde}, ${C.menta})` : `linear-gradient(135deg, #7f1d1d, ${C.vermelho})`, color: C.branco }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: 1.5, textTransform: "uppercase" }}>Resultado da semana</div>
        <div style={{ fontSize: 40, fontWeight: 900, marginTop: 6, letterSpacing: -1 }}>{fmtBRL(lucro)}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Margem de {margem}% sobre as vendas</div>
      </Card>

      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Resumo financeiro</div>
        {[
          { label: "Total de Vendas",  valor: totalVendas,  cor: C.menta,   sinal: "+" },
          { label: "Total de Compras", valor: totalCompras, cor: C.roxo,    sinal: "−" },
          { label: "Total de Gastos",  valor: totalGastos,  cor: C.laranja, sinal: "−" },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.cinzaCl}` }}>
            <span style={{ fontSize: 13, color: C.texto }}>{r.label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: r.cor }}>{r.sinal} {fmtBRL(r.valor)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: C.texto }}>Lucro líquido</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: lucro >= 0 ? C.menta : C.vermelho }}>{fmtBRL(lucro)}</span>
        </div>
      </Card>

      {topClientes.length > 0 && (
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.menta, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🛒 Melhores clientes</div>
          {topClientes.map(([nome, val], i) => (
            <div key={nome} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.cinzaCl}` }}>
              <span style={{ fontSize: 13, color: C.texto }}>{["🥇","🥈","🥉"][i]} {nome}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.menta }}>{fmtBRL(val)}</span>
            </div>
          ))}
        </Card>
      )}

      {topForn.length > 0 && (
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.roxo, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🚜 Principais fornecedores</div>
          {topForn.map(([nome, val]) => (
            <div key={nome} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.cinzaCl}` }}>
              <span style={{ fontSize: 13, color: C.texto }}>{nome}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.roxo }}>{fmtBRL(val)}</span>
            </div>
          ))}
        </Card>
      )}

      {prodAtivos.length > 0 && (
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Por produto</div>
          {prodAtivos.map(([nome, v]) => {
            const saldo = v.vendas - v.compras;
            return (
              <div key={nome} style={{ padding: "10px 0", borderBottom: `1px solid ${C.cinzaCl}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{v.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.texto }}>{nome}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: saldo >= 0 ? C.menta : C.vermelho }}>{fmtBRL(saldo)}</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 3, marginLeft: 28 }}>
                  <span style={{ fontSize: 11, color: C.cinza }}>Comprou {v.cxComp} cx</span>
                  <span style={{ fontSize: 11, color: C.cinza }}>Vendeu {v.cxVend} cx</span>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {Object.keys(porCat).length > 0 && (
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.cinza, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Gastos por categoria</div>
          {Object.entries(porCat).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.cinzaCl}` }}>
              <span style={{ fontSize: 13, color: C.texto }}>{EMOJI_CAT[cat]} {cat}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.laranja }}>{fmtBRL(val)}</span>
            </div>
          ))}
        </Card>
      )}

      {!temDados(state) && (
        <div style={{ textAlign: "center", color: C.cinza, padding: "40px 20px" }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <div style={{ fontWeight: 700, marginTop: 12 }}>Nenhum dado ainda</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Registre compras, vendas e gastos para ver o fechamento</div>
        </div>
      )}
    </div>
  );
}

function temDados(state) {
  return state.compras.length > 0 || state.vendas.length > 0 || state.gastos.length > 0;
}

// ── App Principal ─────────────────────────────────────────────────────────────
export default function App() {
  const [aba, setAba] = useState("resumo");
  const [state, dispatch] = useReducer(reducer, estadoInicial);

  const telas = {
    resumo:    TelaResumo,
    compras:   TelaCompras,
    vendas:    TelaVendas,
    gastos:    TelaGastos,
    contatos:  TelaContatos,
    relatorio: TelaRelatorio,
    fechamento:TelaFechamento,
  };
  const Tela = telas[aba];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.creme, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <div style={{ paddingBottom: 70 }}>
        <Tela state={state} dispatch={dispatch} />
      </div>
      <TabBar aba={aba} setAba={setAba} />
    </div>
  );
}
