import { useMemo, useRef } from "react";
import { gsap } from "gsap";
import "./testimonials-ui.css";

function makeNodes(text) {
  return String(text)
    .split("")
    .map((char, index) => (
      <span className="hover-blur__char" key={`${char}-${index}`}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
}

export default function HoverBlur({ children }) {
  const rootRef = useRef(null);

  const text = useMemo(() => String(children ?? ""), [children]);
  const chars = useMemo(() => makeNodes(text), [text]);

  const handleEnter = () => {
    const root = rootRef.current;
    if (!root) return;
    const layers = root.querySelectorAll(".hover-blur__layer");
    gsap.to(layers, {
      y: -2,
      duration: 0.25,
      ease: "power2.out",
      stagger: 0.03,
    });
    gsap.to(root.querySelector(".hover-blur__clone"), {
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    const root = rootRef.current;
    if (!root) return;
    gsap.to(root.querySelectorAll(".hover-blur__layer"), {
      y: 0,
      duration: 0.25,
      ease: "power2.out",
      stagger: 0.03,
    });
    gsap.to(root.querySelector(".hover-blur__clone"), {
      opacity: 0,
      filter: "blur(10px)",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  return (
    <span
      ref={rootRef}
      className="hover-blur nav-link"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="hover-blur__original text-layer original">{chars}</span>
      <span className="hover-blur__clone text-layer clone" aria-hidden="true">
        {chars}
      </span>
    </span>
  );
}
