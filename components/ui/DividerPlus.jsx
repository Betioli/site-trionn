import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./testimonials-ui.css";

export default function DividerPlus({
  customClass = "",
  lineClass = "",
  plusClass = "",
  iconColor = "#272727",
}) {
  const rootRef = useRef(null);
  const lineRef = useRef(null);
  const plusRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const line = lineRef.current;
    const plus = plusRef.current;
    if (!root || !line || !plus) return;

    gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(plus, { autoAlpha: 0, scale: 0.8 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          gsap.to(line, {
            scaleX: 1,
            duration: 0.8,
            ease: "power3.out",
          });

          gsap.to(plus, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: "power3.out",
            delay: 0.1,
          });
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={`line-plus-block ${customClass}`.trim()}>
      <span ref={lineRef} className={`line ${lineClass}`.trim()} />
      <svg
        ref={plusRef}
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className={`plus ${plusClass}`.trim()}
        aria-hidden="true"
      >
        <line x1="6" y1="0" x2="6" y2="12" stroke={iconColor} />
        <line x1="12" y1="6" x2="0" y2="6" stroke={iconColor} />
      </svg>
    </div>
  );
}
