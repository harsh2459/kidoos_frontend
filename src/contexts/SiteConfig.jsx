import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { api } from "../api/client";
const SiteCtx = createContext(null);


const DEFAULT_TICKER = {
  enabled: true, speed: 30,
  items: [
    { id: "1", text: "⚡ Flash Deal", highlighted: true,  showTimer: false },
    { id: "2", text: "Ultimate Discount on All Books Here", highlighted: false, showTimer: false },
    { id: "3", text: "Purchase Now & Save Big", highlighted: true,  showTimer: false },
    { id: "4", text: "Offer Ends In", highlighted: false, showTimer: true  },
    { id: "5", text: "Kiddos Intellect Special Offer", highlighted: true,  showTimer: false },
    { id: "6", text: "Shop Smart, Grow Bright", highlighted: false, showTimer: false },
  ],
};

export function SiteProvider({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [site, setSite] = useState({ title: "kiddos intellect", logoUrl: "", faviconUrl: "" });
  const [theme, setTheme] = useState({});
  const [homepage, setHomepage] = useState({ blocks: [] });
  const [payments, setPayments] = useState({ providers: [] });
  const [ticker, setTicker] = useState(DEFAULT_TICKER);
  const [seo, setSeo] = useState({ globalKeywords: "", homepageTitle: "", homepageDescription: "", defaultDescription: "", defaultOgImage: "", googleVerification: "", extraMeta: [] });
  const [visibility, setVisibility] = useState({
    publicNav: ["kiddos intellect","theme","admin","cart"],
    pages: {}
  });

  useEffect(() => {
    (async ()=>{
      try {
        const { data } = await api.get("/settings/public");
        if (data.ok) {
          setSite(data.site);
          setTheme(data.theme || {});
          setHomepage(data.homepage || { blocks: [] });
          setPayments(data.payments || { providers: [] });
          setTicker(data.ticker || DEFAULT_TICKER);
          setSeo(data.seo || {});
          setVisibility(data.visibility || visibility);

          // apply theme tokens to CSS variables
          Object.entries(data.theme || {}).forEach(([k,v]) => {
            document.documentElement.style.setProperty(`--${k}`, v);
          });

          // favicon + title
          if (data.site?.faviconUrl) {
            let link = document.querySelector("link[rel='icon']");
            if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
            link.href = data.site.faviconUrl;
          }
          if (data.site?.title) document.title = data.site.title;
        }
      } finally { setLoaded(true); }
    })();
  }, []); // eslint-disable-line

  const value = useMemo(() => ({
    loaded, site, theme, homepage, payments, ticker, seo, visibility,
    setSite, setTheme, setHomepage, setPayments, setTicker, setSeo, setVisibility
  }), [loaded, site, theme, homepage, payments, ticker, seo, visibility]); // setters are stable, excluded from deps

  return (
    <SiteCtx.Provider value={value}>
      {children}
    </SiteCtx.Provider>
  );
}

export const useSite = () => useContext(SiteCtx);
