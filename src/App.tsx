import { useEffect, useState } from "react";
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
} from "./shared/lib/ymaps";
import type { YMapLocationRequest } from "ymaps3";
import "./App.css";
import { Menu } from "lucide-react";

import CustomMarker from "./feature/CustomMarker/ui/CustomMarker";
import clsx from "clsx";
import GpsPositionMy from "./feature/GpsPositionMy/GpsPositionMy";
import { usePointsStore } from "./entities/Point/model/usePointsStore";
import { api } from "./shared/api/client";

function App() {
  const [location, setLocation] = useState<YMapLocationRequest>({
    center: [37.617635, 55.755814], // [lng, lat]
    zoom: 9,
  });

  const [category, setCategory] = useState<string[]>(["Билборд", "Фасад"]);
  const { items, isLoading, fetch, removeById } = usePointsStore();
  // Грузим данные один раз при монтировании
  useEffect(() => {
    fetch();
    api.get("categories").then((items) => setCategory(items.data));
  }, [fetch]);

  const [isOpen, setOpen] = useState(false);

  return (
    <div className="w-screen h-screen">
      <GpsPositionMy
        onPosition={(pos) =>
          setLocation((prev) => ({
            ...prev,
            center: [pos.coords.longitude, pos.coords.latitude] as [
              number,
              number
            ],
          }))
        }
      />
      <YMap location={location}>
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />

        <nav
          className={clsx(
            "w-[300px] transition-all bg-transparent backdrop-blur-sm border-r border-zinc-950/20 h-screen absolute z-20",
            {
              "-translate-x-[300px]": isOpen,
            }
          )}
        >
          {isLoading ? (
            <ul className="p-3 space-y-2">
              {/* skeleton-заглушки */}
              <li className="h-8 rounded-md bg-white/10 animate-pulse" />
              <li className="h-8 rounded-md bg-white/10 animate-pulse" />
              <li className="h-8 rounded-md bg-white/10 animate-pulse" />
            </ul>
          ) : (
            <ul className="p-3 space-y-1">
              <header className="border-black/30 border-b relative select-none gap-2 flex ">
                <h2 className="  pb-2 ">Список точек</h2>
                <select
                  name=""
                  className="min-w-30 h-7 border bg-white/70  border-black/30 rounded-sm"
                >
                  {category.map((item) => {
                    return <option value={item}>{item}</option>;
                  })}
                </select>
                <button
                  className="bg-white/40 cursor-pointer absolute  right-2 -top-0.5 rounded-sm  border border-black/30 p-0.5"
                  onClick={() => {
                    setOpen(!isOpen);
                  }}
                >
                  <Menu
                    className={clsx(" transition-all ", {
                      "translate-x-13": isOpen,
                    })}
                  />
                </button>
              </header>
              {(items ?? []).map((item) => (
                <li
                  key={item.id}
                  onClick={() =>
                    setLocation({
                      center: [item.longitude, item.latitude],
                      zoom: 16,
                    })
                  }
                  className="select-none rounded-md px-3 py-2 hover:bg-white/50 cursor-pointer flex items-center justify-between"
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
                <li className="text-sm text-black/60  px-3 py-2">Нет точек</li>
              )}
            </ul>
          )}
        </nav>

        {items &&
          items.map((item) => {
            return (
              <CustomMarker
                key={item.id}
                _id={item.id}
                coordinates={[item.longitude, item.latitude]}
                title={item.title}
                description={item.description}
                MapMarker={YMapMarker}
                category={item.category}
                price={item.price}
                onDelete={(id) => removeById(id)}
              />
            );
          })}
      </YMap>
    </div>
  );
}

export default App;
