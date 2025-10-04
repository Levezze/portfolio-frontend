export const LinkifyText = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) =>
        part.match(urlRegex) ? (
          <a
            href={part}
            key={i}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline font-semibold"
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
};
