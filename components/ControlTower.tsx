"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Box,
  ClipboardList,
  Factory,
  PackageCheck,
  Scissors,
  Shirt,
  Truck,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { orders, material, production, money } from "@/lib/data";

const nav = [
  ["Management View", "home"],
  ["Orders", "orders"],
  ["Material Control", "material"],
  ["Cutting", "cutting"],
  ["Sewing", "sewing"],
  ["Finishing", "finishing"],
  ["FG / Packing", "fg"],
  ["Shipment", "shipment"],
  ["Action Required", "alerts"],
  ["Analytics", "analytics"],
] as const;

const icons: any = {
  home: Factory,
  orders: ClipboardList,
  material: Box,
  cutting: Scissors,
  sewing: Shirt,
  finishing: PackageCheck,
  fg: PackageCheck,
  shipment: Truck,
  alerts: AlertTriangle,
  analytics: Factory,
};

export default function ControlTower() {
  const [page, setPage] = useState("home");
  const [mobile, setMobile] = useState(false);

  const totalOrder = orders.reduce((s, o) => s + o.orderQty, 0);

  const totalRequired = material.reduce((s, m) => s + m.required, 0);

  const matReady =
    totalRequired > 0
      ? Math.round(
        (material.reduce(
          (s, m) => s + Math.min(m.received, m.required),
          0
        ) /
          totalRequired) *
        100
      )
      : 0;

  const cut = production.reduce((s, p) => s + p.cut, 0);
  const fg = production.reduce((s, p) => s + p.fg, 0);
  const shipped = production.reduce((s, p) => s + p.ship, 0);

  const alerts = useMemo(
    () =>
      orders
        .map((o) => {
          const p = production.find((x) => x.po === o.po);

          const days = Math.ceil(
            (new Date(o.shipDate).getTime() - Date.now()) / 86400000
          );

          const m = material.filter((x) => x.po === o.po);

          const shortage = m.reduce(
            (s, x) => s + Math.max(0, x.required - x.received),
            0
          );

          const balance = p ? o.orderQty - p.ship : o.orderQty;

          return {
            o,
            p,
            days,
            shortage,
            balance,
          };
        })
        .filter(
          (x) =>
            x.shortage > 0 ||
            x.days <= 3 ||
            x.balance > x.o.orderQty * 0.35
        ),
    []
  );

  const content = () => {
    if (page === "home") {
      return (
        <ManagementView
          totalOrder={totalOrder}
          matReady={matReady}
          cut={cut}
          fg={fg}
          shipped={shipped}
          alerts={alerts}
        />
      );
    }

    if (page === "orders") {
      return (
        <TablePage
          title="Orders"
          columns={[
            "Buyer",
            "PO",
            "Style",
            "Color",
            "Order Qty",
            "Ship Date",
            "Factory",
            "Priority",
          ]}
          rows={orders.map((o) => [
            o.buyer,
            o.po,
            o.style,
            o.color,
            money(o.orderQty),
            o.shipDate,
            o.factory,
            o.priority,
          ])}
        />
      );
    }

    if (page === "material") {
      return (
        <TablePage
          title="Material Control"
          columns={[
            "PO",
            "Style",
            "Material",
            "Required",
            "PO Qty",
            "Received",
            "Balance",
            "Status",
          ]}
          rows={material.map((m) => [
            m.po,
            m.style,
            m.material,
            money(m.required),
            money(m.poQty),
            money(m.received),
            money(Math.max(0, m.required - m.received)),
            m.received >= m.required ? "READY" : "SHORT",
          ])}
        />
      );
    }

    if (page === "alerts") {
      return (
        <TablePage
          title="Action Required"
          columns={[
            "PO",
            "Style",
            "Problem",
            "Qty / Balance",
            "Days Left",
            "Suggested Action",
          ]}
          rows={alerts.map((a) => [
            a.o.po,
            a.o.style,
            a.shortage
              ? "Material shortage"
              : "Shipment / production risk",
            money(a.shortage || a.balance),
            a.days,
            a.shortage
              ? "Follow supplier"
              : "Increase production / priority finishing",
          ])}
        />
      );
    }

    return (
      <TablePage
        title={nav.find((x) => x[1] === page)?.[0] || "Analytics"}
        columns={[
          "PO",
          "Style",
          "Factory",
          "Order Qty",
          "Cut",
          "Sewing",
          "Finishing",
          "FG",
          "Shipped",
          "Balance",
        ]}
        rows={production.map((p) => {
          const o = orders.find((x) => x.po === p.po);

          if (!o) {
            return [
              p.po,
              p.style,
              "N/A",
              0,
              money(p.cut),
              money(p.sewingOutput),
              money(p.finish),
              money(p.fg),
              money(p.ship),
              0,
            ];
          }

          return [
            p.po,
            p.style,
            o.factory,
            money(o.orderQty),
            money(p.cut),
            money(p.sewingOutput),
            money(p.finish),
            money(p.fg),
            money(p.ship),
            money(o.orderQty - p.ship),
          ];
        })}
      />
    );
  };

  return (
    <div className="shell">
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <div className="brand">
          <div className="brandmark">B</div>

          <div>
            <b>BENCHMARK GROUP</b>
            <small>Material & Production</small>
          </div>

          <button
            className="close"
            onClick={() => setMobile(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <div className="nav">
          {nav.map(([label, id]) => {
            const I = icons[id];

            return (
              <button
                key={id}
                className={page === id ? "active" : ""}
                onClick={() => {
                  setPage(id);
                  setMobile(false);
                }}
              >
                <I size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="sidefoot">
          Single source of truth
          <br />
          Order → Material → Production → Shipment
        </div>
      </aside>

      {mobile && (
        <div
          className="overlay"
          onClick={() => setMobile(false)}
        />
      )}

      <main className="main">
        <header>
          <button
            className="menu"
            onClick={() => setMobile(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div>
            <div className="eyebrow">
              BENCHMARK GROUP • RMG OPERATIONS
            </div>

            <h1>
              {page === "home"
                ? "Management View"
                : nav.find((x) => x[1] === page)?.[0]}
            </h1>
          </div>

          <div className="date">
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </header>

        {content()}
      </main>
    </div>
  );
}

function ManagementView({
  totalOrder,
  matReady,
  cut,
  fg,
  shipped,
  alerts,
}: any) {
  const pct = (n: number) =>
    totalOrder > 0 ? Math.round((n / totalOrder) * 100) : 0;

  const sewing = production.reduce(
    (s, p) => s + p.sewingOutput,
    0
  );

  const finish = production.reduce(
    (s, p) => s + p.finish,
    0
  );

  const materialQty = Math.round(
    (totalOrder * matReady) / 100
  );

  const cards = [
    ["ORDER QTY", totalOrder, "Total confirmed orders"],
    ["MATERIAL READY", matReady + "%", "Required vs in-house"],
    ["CUTTING", pct(cut) + "%", "Cut quantity / order"],
    ["FG READY", pct(fg) + "%", "Finished goods"],
    ["SHIPPED", pct(shipped) + "%", "Order shipped"],
  ];

  return (
    <div className="page">
      <div className="cards">
        {cards.map(([a, b, c]) => (
          <div className="card" key={a}>
            <span>{a}</span>
            <strong>
              {typeof b === "number" ? money(b) : b}
            </strong>
            <small>{c}</small>
          </div>
        ))}
      </div>

      <section className="panel pipeline">
        <div className="paneltitle">
          <div>
            <h2>End-to-End Order Flow</h2>
            <p>Live reconciliation by PO / style / color</p>
          </div>

          <span className="pill">CONTROL TOWER</span>
        </div>

        <div className="flow">
          {[
            ["ORDER", totalOrder],
            ["MATERIAL", materialQty],
            ["CUTTING", cut],
            ["SEWING", sewing],
            ["FINISH", finish],
            ["FG", fg],
            ["SHIP", shipped],
          ].map(([k, v], i) => (
            <div className="flowitem" key={k}>
              <div className="flowbox">
                <b>{k}</b>
                <strong>{money(v as number)}</strong>
                <small>{pct(v as number)}%</small>
              </div>

              {i < 6 && (
                <ChevronRight className="arrow" />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid2">
        <section className="panel">
          <div className="paneltitle">
            <div>
              <h2>Factory / Order Status</h2>
              <p>Production position by PO</p>
            </div>
          </div>

          {orders.map((o) => {
            const p = production.find(
              (x) => x.po === o.po
            );

            if (!p) {
              return (
                <div className="statusrow" key={o.po}>
                  <div>
                    <b>{o.po}</b>
                    <span>
                      {o.style} • {o.factory}
                    </span>
                  </div>

                  <div className="bar">
                    <i style={{ width: "0%" }} />
                  </div>

                  <strong>0%</strong>
                </div>
              );
            }

            const progress =
              o.orderQty > 0
                ? (p.fg / o.orderQty) * 100
                : 0;

            return (
              <div
                className="statusrow"
                key={o.po}
              >
                <div>
                  <b>{o.po}</b>
                  <span>
                    {o.style} • {o.factory}
                  </span>
                </div>

                <div className="bar">
                  <i
                    style={{
                      width:
                        Math.min(100, progress) + "%",
                    }}
                  />
                </div>

                <strong>
                  {Math.round(progress)}%
                </strong>
              </div>
            );
          })}
        </section>

        <section className="panel">
          <div className="paneltitle">
            <div>
              <h2>Action Required</h2>
              <p>Automatically identified risks</p>
            </div>

            <AlertTriangle size={20} />
          </div>

          {alerts.slice(0, 5).map((a: any) => (
            <div className="alert" key={a.o.po}>
              <div
                className={
                  a.shortage
                    ? "dot red"
                    : "dot amber"
                }
              />

              <div>
                <b>
                  {a.o.po} • {a.o.style}
                </b>

                <span>
                  {a.shortage
                    ? `Material shortage: ${money(
                      a.shortage
                    )}`
                    : `Shipment balance: ${money(
                      a.balance
                    )}`}
                </span>
              </div>

              <small>{a.days}d</small>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function TablePage({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: any[][];
}) {
  return (
    <div className="page">
      <section className="panel tablepanel">
        <div className="paneltitle">
          <div>
            <h2>{title}</h2>
            <p>
              Transaction-driven view • values calculate
              from source inputs
            </p>
          </div>

          <span className="pill">
            {rows.length} RECORDS
          </span>
        </div>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => (
                    <td key={j}>{String(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}