export default function AdSenseSlot({ slot, format = "auto" }: { slot: string; format?: string }) {
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm" style={{ minHeight: format === "vertical" ? 250 : 90 }}>
        <div className="text-center p-4">
          <p className="font-semibold">AdSense Slot</p>
          <p className="text-xs">ID: {slot}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adsense-container" style={{ minHeight: format === "vertical" ? 250 : 90 }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_ID || "placeholder"}`}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
