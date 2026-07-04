export function TextReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="mr-[0.25em] inline-block">
          {word}
        </span>
      ))}
    </span>
  );
}
