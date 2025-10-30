import { useEffect, useState } from "react";
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
} from "./shared/lib/ymaps";
import type { YMapLocationRequest } from "ymaps3";
import "./App.css";

import CustomMarker from "./feature/CustomMarker/ui/CustomMarker";
import { Point } from "../entities/Point/model/types";
import { api } from "./shared/api/client";

function App() {
  const [location, setLocation] = useState<YMapLocationRequest>({
    center: [37.617635, 55.755814], // [lng, lat]
    zoom: 9,
  });

  const [isLoading, setLoading] = useState(true);
  const [items, setItems] = useState<Point[]>([]);

  // Грузим данные один раз при монтировании
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get<Point[]>("/MapPoints"); // Axios: Promise<AxiosResponse<Point[]>>
        if (!cancelled) setItems(res.data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setItems([]); // на ошибке — пустой список
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-screen h-screen">
      <YMap location={location}>
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />

        <nav className="w-[300px] bg-transparent backdrop-blur-sm border-r border-zinc-950/20 h-screen absolute z-20">
          {isLoading ? (
            <ul className="p-3 space-y-2">
              {/* skeleton-заглушки */}
              <li className="h-8 rounded-md bg-white/10 animate-pulse" />
              <li className="h-8 rounded-md bg-white/10 animate-pulse" />
              <li className="h-8 rounded-md bg-white/10 animate-pulse" />
            </ul>
          ) : (
            <ul className="p-3 space-y-1">
              <header>
                <h2 className="select-none">Menu</h2>
              </header>
              {(items ?? []).map((item) => (
                <li
                  onClick={() => {
                    setLocation({
                      center: [item.longitude, item.latitude], // [lng, lat]
                      zoom: 16,
                    });
                  }}
                  key={item.id}
                  className=" select-none rounded-md px-3 py-2 overscroll-y-auto hover:bg-white/50 cursor-pointer flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.color && (
                    <span
                      className="ml-2 inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white/40"
                      style={{ backgroundColor: item.color }}
                      aria-hidden
                    />
                  )}
                </li>
              ))}
              {(!items || items.length === 0) && (
                <li className="text-xs text-white/60 px-3 py-2">Нет точек</li>
              )}
            </ul>
          )}
        </nav>

        {items &&
          items.map((item) => {
            return (
              <CustomMarker
                id={item.id}
                coordinates={[item.longitude, item.latitude]}
                title={item.title}
                description={item.description}
                MapMarker={YMapMarker}
              />
            );
          })}
      </YMap>
    </div>
  );
}

export default App;
