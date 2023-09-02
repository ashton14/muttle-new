import React, { useState } from 'react';

export default function ClickToCopy({ text }: {text: string}) {
  const [copied, setCopied] = useState<boolean>(false);

  const onCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  }

  const className = copied ?
    "bi bi-clipboard-check text-success" :
    "bi bi-clipboard";

  return (
    <>
      <i role="button"
        className={`${className} text-l`}
        onClick={onCopy}/>
        <style jsx>{`
        .bi {
          font-size: 1.2em;
        }
      `}</style>
    </>
  )
}
