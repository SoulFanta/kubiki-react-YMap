import React from "react";
import { YMapMarker } from "../../../shared/lib/ymaps";
import clsx from "clsx";
import { api } from "../../../shared/api/client";
export type LngLat = [number, number];

export type CustomMarkerProps = {
  /** Идентификатор точки (для key и отладки) */
  _id: string | number;
  /** Координаты точки [lng, lat] — ВАЖНО: сначала долгота */
  coordinates: LngLat;

  /** Подсказка над меткой при наведении */
  title?: string;
  /** Текст во всплывающем попапе по клику */
  description?: string;
  /** Цвет «точки» маркера (HEX/CSS) */
  color?: string;
  price?: number;
  category?: string;
  MapMarker: typeof YMapMarker;
  status?: string;
  /** Доп. классы для корневого контейнера (необязательно) */
  className?: string;
  onDelete?: (id: string | number) => void;
};

type CustomMarkerState = {
  hover: boolean;
  open: boolean;
  visible: boolean;
};

export default class CustomMarker extends React.Component<
  CustomMarkerProps,
  CustomMarkerState
> {
  static defaultProps = {
    color: "#3b82f6", // blue-600
  };
  private _id: string | number;
  constructor(props: CustomMarkerProps) {
    super(props);
    this.state = { hover: false, open: false, visible: true };

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.close = this.close.bind(this);
    this.stop = this.stop.bind(this);
    this._id = props._id;
  }

  handleMouseEnter() {
    this.setState({ hover: true });
  }
  handleMouseLeave() {
    this.setState({ hover: false });
  }
  toggleOpen() {
    this.setState((s) => ({ open: !s.open }));
  }
  close(e?: React.MouseEvent) {
    e?.stopPropagation();
    this.setState({ open: false });
  }

  deleteMarker = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const id = this.props._id;
    if (id === undefined || id === null) return;

    try {
      await api.delete(`/MapPoints/${encodeURIComponent(String(id))}`);
      this.props.onDelete(id);
      this.setState({ visible: false, open: false });
    } catch (err) {
      console.error(err);
    }
  };
  /** Не даём клику по контенту всплыть и закрыть попап */
  stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  render() {
    const {
      coordinates,
      title,
      description,
      color,
      price,
      category,
      MapMarker,
      className,
      status
    } = this.props;
    const { hover, open, visible } = this.state;

    if (!visible) return null; // ← убираем из дерева вовсе

    const Root = MapMarker;
    return (
      <Root coordinates={coordinates}>
        <div
          className={clsx(
            "relative -translate-x-1/2 -translate-y-full cursor-pointer select-none",
            className
          )}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onClick={this.toggleOpen}
        >
          {title && (
            <div
              className={clsx(
                "absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-neutral-900 text-white text-xs px-2 py-1 whitespace-nowrap transition-opacity duration-150",
                hover ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              {title}
            </div>
          )}

          <div
            className="w-4 h-4 rounded-full ring-2 ring-white shadow-md"
            style={{ backgroundColor: color }}
          />

          {open && (
            <div
              className="absolute min-w-xs p-3  min-h-2xs -bottom-8 left-1/2 flex justify-between flex-col -translate-x-1/2 z-10 bg-white border border-black/30 text-neutral-900 rounded-sm shadow-xl px-3 py-2 max-w-3xs min-h-[100px]"
              onClick={this.stop}
            >
              <header>
                <h3 className="text-lg">{title}</h3>
              </header>
              <div className="text-md leading-snug pr-6">
                {"Описание: " + description}
              </div>
              <div className="text-md leading-snug pr-6">
                {"Тип: " + category}
              </div>
              <div className="text-md leading-snug pr-6">
                {"Статус: " + status}
              </div>
              <div className="w-full flex justify-between">
                <button
                  className="text-md text-neutral-500 cursor-pointer hover:text-neutral-800"
                  onClick={this.deleteMarker}
                  aria-label="Удалить"
                >
                  Удалить
                </button>
                <p className="text-md  cursor-pointer text-neutral-800">
                  {price} ₽
                </p>
              </div>
              <button
                className="absolute top-1.5 right-2 text-lg leading-none text-neutral-500 hover:text-neutral-800"
                onClick={this.close}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </Root>
    );
  }
}
