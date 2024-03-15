let a;
const W = () => a, C = ".router-outlet", F = ({ target: t = C }, n) => {
  typeof t == "string" ? t = document.querySelector(t) : typeof t == "function" && (t = t()), t.replaceChildren(n);
}, E = async (t, n) => {
  var r, y;
  const [s, i = ""] = t.split("?"), o = Object.fromEntries(new URLSearchParams(i)), [, ...c] = s.split("/");
  for (const e of n) {
    let f = e.path;
    f.startsWith("/") && (f = f.slice(1));
    const p = f.split("/");
    let h = {};
    for (let l = 0; l < p.length; l++) {
      const b = l === p.length - 1, u = p[l], P = c[l];
      if (u.startsWith(":") && (h[u.slice(1)] = P), P !== u && e.path !== "*" && !u.startsWith(":"))
        break;
      if (b) {
        if (await ((r = e.before) == null ? void 0 : r.call(e, { params: h, query: o })) === !1)
          return;
        const q = await e.handler({ params: h, query: o });
        F(e, q), a = e, await ((y = e.after) == null ? void 0 : y.call(e, { params: h, query: o })), h = {};
        const g = c.slice(l);
        e.children && g.length && await E(g.join("/"), e.children);
        return;
      }
    }
  }
}, w = async () => {
  var t;
  (t = a == null ? void 0 : a.onRouteChange) == null || t.call(a, a), await S() !== !1 && (await E(window.location.pathname, d), await L());
}, m = async () => {
};
let d = [], S = m, L = m;
const j = (t) => S = t || m, I = (t) => L = t || m, M = async (t) => (d = t, window.removeEventListener("popstate", w), window.addEventListener("popstate", w), w()), v = (t, n = {}) => t.replace(/:([^/]+)/g, (s, i) => n[i].toString()), R = (t, n, s = "") => {
  for (const { name: i, path: o, children: c } of t) {
    if (i === n)
      return s + o;
    if (c) {
      const r = R(
        c,
        n,
        s + o
      );
      if (r)
        return r;
    }
  }
  throw new Error(`No route found with name ${name}`);
}, N = ({
  path: t = "",
  name: n = "",
  params: s,
  query: i = {},
  delta: o,
  replace: c
}) => {
  if (o)
    return window.history.go(o);
  t || (t = R(d, n)), t = v(t, s);
  const r = new URLSearchParams(i).toString();
  return t += r ? `?${r}` : "", c ? window.history.replaceState(null, "", t) : window.history.pushState(null, "", t), w();
};
export {
  I as afterEach,
  j as beforeEach,
  M as createRouter,
  W as getCurrentRoute,
  N as go
};
