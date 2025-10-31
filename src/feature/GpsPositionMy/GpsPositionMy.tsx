import { Locate } from "lucide-react";

type Props = {
  onPosition: (pos: GeolocationPosition) => void;
};

export default function GpsPositionMy({ onPosition }: Props) {
  const ClickHandler = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onPosition(pos),
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  };
  return (
    <button
      onClick={() => ClickHandler()}
      className=" z-10 rounded-full p-2 cursor-pointer active:bg-white bg-zinc-100/80 absolute right-10 bottom-10 hover:bg-zinc-100/90"
    >
      <Locate />
    </button>
  );
}
