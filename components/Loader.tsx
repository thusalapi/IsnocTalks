const Loader = () => {
  return (
    <div className="flex-center h-[60vh] w-full">
      <div className="relative size-12">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/40" />
        <span className="absolute inset-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  );
};

export default Loader;
