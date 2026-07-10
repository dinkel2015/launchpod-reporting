export function SourceTag({ children }: { children: string }) {
  return (
    <p className="mt-3 font-mono text-[11px] leading-relaxed text-[#8b95a1]">
      SOURCE: {children}
    </p>
  );
}
