import { useEffect, useMemo, useRef } from "react";
import "./testimonials-ui.css";

function splitWords(text) {
  return String(text)
    .split(" ")
    .filter(Boolean)
    .map((word, index) => (
      <span className="word" key={`${word}-${index}`}>
        {word}
      </span>
    ));
}

export default function WordShiftButton({
  text,
  href = "#",
  target,
  customClass = "",
}) {
  const rootRef = useRef(null);
  const words = useMemo(() => splitWords(text), [text]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const setHovered = (hovered) => node.classList.toggle("is-hovered", hovered);
    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);

    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);
    node.addEventListener("touchstart", onEnter, { passive: true });
    node.addEventListener("touchend", onLeave);
    node.addEventListener("touchcancel", onLeave);

    return () => {
      node.removeEventListener("mouseenter", onEnter);
      node.removeEventListener("mouseleave", onLeave);
      node.removeEventListener("touchstart", onEnter);
      node.removeEventListener("touchend", onLeave);
      node.removeEventListener("touchcancel", onLeave);
    };
  }, []);

  const content = (
    <span ref={rootRef} className={`button_wrapper ${customClass}`.trim()}>
      <span className="text">{words}</span>
    </span>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={target === "_blank" ? "noreferrer" : undefined}>
        {content}
      </a>
    );
  }

  return content;
}
