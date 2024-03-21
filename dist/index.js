const d = window.history;
let a;
const j = () => a, F = ".router-outlet", v = ({ target: t = F }, n) => {
  typeof t == "string" ? t = document.querySelector(t) : typeof t == "function" && (t = t()), t.replaceChildren(n);
}, S = async (t, n) => {
  var r, P;
  const [s, i = ""] = t.split("?"), o = Object.fromEntries(new URLSearchParams(i)), [, ...c] = s.split("/");
  for (const e of n) {
    let f = e.path;
    f.startsWith("/") && (f = f.slice(1));
    const p = f.split("/");
    let h = {};
    for (let l = 0; l < p.length; l++) {
      const q = l === p.length - 1, u = p[l], g = c[l];
      if (u.startsWith(":") && (h[u.slice(1)] = g), g !== u && e.path !== "*" && !u.startsWith(":"))
        break;
      if (q) {
        if (await ((r = e.before) == null ? void 0 : r.call(e, { params: h, query: o })) === !1)
          return;
        const C = await e.handler({ params: h, query: o });
        v(e, C), a = e, await ((P = e.after) == null ? void 0 : P.call(e, { params: h, query: o })), h = {};
        const E = c.slice(l);
        e.children && E.length && await S(E.join("/"), e.children);
        return;
      }
    }
  }
}, w = async () => {
  var t;
  (t = a == null ? void 0 : a.onRouteChange) == null || t.call(a, a), await L() !== !1 && (await S(window.location.pathname, y), await R());
}, m = async () => {
};
let y = [], L = m, R = m;
const I = (t) => L = t || m, M = (t) => R = t || m, N = async (t) => (y = t, window.removeEventListener("popstate", w), window.addEventListener("popstate", w), w()), U = (t, n = {}) => t.replace(/:([^/]+)/g, (s, i) => n[i].toString()), b = (t, n, s = "") => {
  for (const { name: i, path: o, children: c } of t) {
    if (i === n)
      return s + o;
    if (c) {
      const r = b(
        c,
        n,
        s + o
      );
      if (r)
        return r;
    }
  }
  throw new Error(`No route found with name ${name}`);
}, O = ({
  path: t = "",
  name: n = "",
  params: s,
  query: i = {},
  delta: o,
  replace: c
}) => {
  if (o)
    return d.go(o);
  t || (t = b(y, n)), t = U(t, s);
  const r = new URLSearchParams(i).toString();
  return t += r ? `?${r}` : "", c ? d.replaceState(null, "", t) : d.pushState(null, "", t), w();
};
export {
  M as afterEach,
  I as beforeEach,
  N as createRouter,
  j as getCurrentRoute,
  O as go
};
