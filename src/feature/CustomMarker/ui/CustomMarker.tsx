import React from "react";
import { YMapMarker } from "../../../shared/lib/ymaps";
export type LngLat = [number, number];

export type CustomMarkerProps = {
  /** Идентификатор точки (для key и отладки) */
  id: string | number;
  /** Координаты точки [lng, lat] — ВАЖНО: сначала долгота */
  coordinates: LngLat;

  /** Подсказка над меткой при наведении */
  title?: string;
  /** Текст во всплывающем попапе по клику */
  description?: string;
  /** Цвет «точки» маркера (HEX/CSS) */
  color?: string;

  MapMarker: typeof YMapMarker;

  /** Доп. классы для корневого контейнера (необязательно) */
  className?: string;
};

type CustomMarkerState = {
  hover: boolean;
  open: boolean;
};

export default class CustomMarker extends React.Component<
  CustomMarkerProps,
  CustomMarkerState
> {
  static defaultProps = {
    color: "#3b82f6", // blue-600
  };

  constructor(props: CustomMarkerProps) {
    super(props);
    this.state = { hover: false, open: false };
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.close = this.close.bind(this);
    this.stop = this.stop.bind(this);
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
  /** Не даём клику по контенту всплыть и закрыть попап */
  stop(e: React.MouseEvent) {
    e.stopPropagation();
  }
  render() {
    const { coordinates, title, description, color, MapMarker, className } =
      this.props;
    const { hover, open } = this.state;
    const Root = MapMarker;

    return (
      <Root coordinates={coordinates}>
        {/* Якорим низ элемента в точке карты: translate-x-1/2 + translate-y-full */}
        <div
          className={[
            "relative -translate-x-1/2 -translate-y-full cursor-pointer select-none",
            className || "",
          ].join(" ")}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onClick={this.toggleOpen}
        >
          {/* Tooltip (title) — при наведении */}
          {title ? (
            <div
              className={[
                "absolute -bottom-6 left-1/2 -translate-x-1/2",
                "rounded-md bg-neutral-900 text-white text-xs px-2 py-1",
                "whitespace-nowrap transition-opacity duration-150",
                hover ? "opacity-100" : "opacity-0 pointer-events-none",
              ].join(" ")}
            >
              {title}
            </div>
          ) : null}

          {/* Цветная «точка» маркера */}
          <div
            className="w-4 h-4 rounded-full ring-2 ring-white shadow-md"
            style={{ backgroundColor: color }}
          />

          {/* Popup (description) — по клику */}
          {open && (
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10
                         bg-white text-neutral-900 rounded-lg shadow-xl
                         px-3 py-2 min-w-40 max-w-60"
              onClick={this.stop}
            >
              <div className="text-sm leading-snug pr-6">
                {description ?? "Нет описания"}
              </div>
              <button
                className="absolute top-1.5 right-2 text-lg leading-none
                           text-neutral-500 hover:text-neutral-800"
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
