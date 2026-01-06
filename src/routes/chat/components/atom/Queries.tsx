interface QueriesProps {
  queries: Record<string, any>;
  show?: boolean;
}

export const Queries = ({ queries, show }: QueriesProps) => {
  if (Object.keys(queries).length === 0) return null;
  return (
    <div
      style={{
        maxHeight: show ? "500px" : "0",
        opacity: show ? "1" : "0",
        overflow: "hidden",
        transition: "max-height 0.5s ease-in-out, opacity 0.5s ease-in-out",
      }}
    >
      <div className="w-full">
        <div className="flex flex-col flex-wrap gap-2">
          {Object.entries(queries).map(([_, v], queryIndex) => (
            <div
              key={queryIndex}
              style={{
                opacity: 0,
                animation: "fadeInUp 0.5s ease-out forwards",
                animationDelay: `${queryIndex * 0.1}s`,
              }}
              className="flex items-center gap-2 px-3 text-faded-grey text-sm"
            >
              <div className="flex items-center border p-1 border-dashed border-red-300 bg-red-100 gap-2" />
              <span className="text-left">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
