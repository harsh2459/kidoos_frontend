import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
const SiteCtx = createContext(null);


export function SiteProvider({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [site, setSite] = useState({ title: "kiddos intellect", logoUrl: "", faviconUrl: "" });
  const [theme, setTheme] = useState({});
  const [homepage, setHomepage] = useState({ blocks: [] });
  const [payments, setPayments] = useState({ providers: [] });
  const [visibility, setVisibility] = useState({             // <-- NEW
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
          setVisibility(data.visibility || visibility);       // <-- NEW

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

  return (
    <SiteCtx.Provider value={{
      loaded, site, theme, homepage, payments, visibility,
      setSite, setTheme, setHomepage, setPayments, setVisibility
    }}>
      {children}
    </SiteCtx.Provider>
  );
}

export const useSite = () => useContext(SiteCtx);
