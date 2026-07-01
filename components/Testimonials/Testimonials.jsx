import { useCallback, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";

import BlurTextReveal from "../ui/BlurTextReveal";
import FadeInOnScroll from "../ui/FadeInOnScroll";
import HoverBlur from "../ui/HoverBlur";
import WordShiftButton from "../ui/WordShiftButton";
import DividerPlus from "../ui/DividerPlus";
import TestimonialCard from "./TestimonialCard";
import { TestimonialsData } from "../../data/TestimonialsData";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "./Testimonials.css";
import "../ui/testimonials-ui.css";

export default function Testimonials({
  customClass = "",
  swiperOptions = {},
  showBottomLine = false,
}) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const closeVideo = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("trionn-modal:close"));
    }
  }, []);

  const handleSlideChange = useCallback((swiper) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  const handleCompanyClick = useCallback((index) => {
    swiperRef.current?.slideToLoop(index);
  }, []);

  return (
    <section
      id="testimonials"
      className={`testimonials-section ${customClass}`.trim()}
    >
      <div className="testimonials-section__container">
        <div className="testimonials-section__header">
          <BlurTextReveal
            as="h2"
            text="Client stories"
            animationType="chars"
            stagger={0.05}
            className="testimonials-section__title"
          />

          <div className="testimonials-section__introWrap">
            <FadeInOnScroll delay={0.3}>
              <p className="testimonials-section__intro">
                Great work is built through <br />
                partnership. Here&apos;s what <br />
                our clients say.
              </p>
            </FadeInOnScroll>
          </div>
        </div>

        <div className="testimonials-section__divider">
          <DividerPlus
            customClass="testimonials-section__dividerInner"
            lineClass="testimonials-section__dividerLine"
            plusClass="testimonials-section__dividerPlus"
            iconColor="#272727"
          />
        </div>

        <div className="testimonials-section__main">
          <div className="testimonials-section__left">
            <div className="testimonial-company-list">
              {TestimonialsData.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={activeIndex === index ? "true" : undefined}
                  aria-label={`Show testimonial from ${item.companyName}`}
                  className={`testimonial-company-button ${
                    activeIndex === index ? "is-active" : ""
                  }`}
                  onClick={() => handleCompanyClick(index)}
                >
                  <span className="title">{item.companyName}</span>
                  <span
                    className={`icon ${activeIndex === index ? "is-visible" : ""}`}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              ))}
            </div>

            <div className="testimonial-nav">
              <button
                type="button"
                className="custom-arrow left js-testimonials-prev"
                aria-label="Previous testimonial"
              >
                  <span className="arrow-icon">←</span>
                </button>
                <button
                  type="button"
                  className="custom-arrow right js-testimonials-next"
                  aria-label="Next testimonial"
                >
                  <span className="arrow-icon">→</span>
                </button>
              </div>
            </div>

          <div className="testimonials-section__swiperWrap">
            <Swiper
              modules={[Autoplay, EffectFade, Navigation]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              speed={600}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop
              navigation={{
                prevEl: ".js-testimonials-prev",
                nextEl: ".js-testimonials-next",
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={handleSlideChange}
              className="testimonials-swiper swiper-row"
              {...swiperOptions}
            >
              {TestimonialsData.map((item) => (
                <SwiperSlide key={item.id} className="testimonial-slide">
                  <TestimonialCard item={item} />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="testimonials-section__cta">
              <WordShiftButton text="become a client" href="/contact" />
            </div>
          </div>
        </div>
      </div>

      {showBottomLine ? (
        <div className="testimonials-section__bottomLine">
          <DividerPlus
            customClass="testimonials-section__dividerInner"
            lineClass="testimonials-section__dividerLine"
            plusClass="testimonials-section__dividerPlus"
            iconColor="#272727"
          />
        </div>
      ) : null}
    </section>
  );
}
