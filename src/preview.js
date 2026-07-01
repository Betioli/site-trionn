import { TestimonialsData } from "../data/TestimonialsData.js";

const root = document.getElementById("root");

const state = {
  activeIndex: 0,
  videoURL: null,
};

function render() {
  const item = TestimonialsData[state.activeIndex];
  root.innerHTML = `
    <section id="testimonials" class="testimonials-section">
      <div class="testimonials-section__container">
        <div class="testimonials-section__header">
          <h2 class="testimonials-section__title">
            <span class="title-line">
              <span class="title-word" style="--d:0ms">Client</span>
            </span>
            <span class="title-line">
              <span class="title-word" style="--d:120ms">stories</span>
            </span>
          </h2>
          <div class="testimonials-section__introWrap">
            <p class="testimonials-section__intro">
              Great work is built through <br />
              partnership. Here's what <br />
              our clients say.
            </p>
          </div>
        </div>

        <div class="testimonials-section__divider">
          <div class="line-plus-block testimonials-section__dividerInner">
            <span class="line testimonials-section__dividerLine"></span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="plus testimonials-section__dividerPlus" aria-hidden="true">
              <line x1="6" y1="0" x2="6" y2="12" stroke="#272727"></line>
              <line x1="12" y1="6" x2="0" y2="6" stroke="#272727"></line>
            </svg>
          </div>
        </div>

        <div class="testimonials-section__main">
          <div class="testimonials-section__left">
            <div class="testimonial-company-list">
              ${TestimonialsData.map(
                (entry, index) => `
                <button
                  type="button"
                  class="testimonial-company-button ${state.activeIndex === index ? "is-active" : ""}"
                  data-index="${index}"
                >
                  <span class="title">${entry.companyName}</span>
                  <span class="icon ${state.activeIndex === index ? "is-visible" : ""}" aria-hidden="true">→</span>
                </button>
                `
              ).join("")}
            </div>

            <div class="testimonial-nav">
              <button type="button" class="custom-arrow left" data-nav="prev" aria-label="Previous testimonial">
                <span class="arrow-icon">←</span>
              </button>
              <button type="button" class="custom-arrow right" data-nav="next" aria-label="Next testimonial">
                <span class="arrow-icon">→</span>
              </button>
            </div>
          </div>

          <div class="testimonials-section__swiperWrap">
            <article class="testimonial-item">
              <span class="testimonial-item__company mobile-only">${item.companyName}</span>
              <div class="testimonial-item__body">
                <h3 class="testimonial-item__quote">${item.quoteMessage}</h3>
                <div class="testimonial-item__footer">
                  <div class="testimonial-item__client">
                    <div class="testimonial-item__avatar">
                      <img src="${item.clientImage}" alt="${item.companyName}" class="testimonial-item__avatarImg" />
                    </div>
                    <div class="testimonial-item__meta">
                      <p class="testimonial-item__name">${item.clientName}</p>
                      <p class="testimonial-item__deg">${item.clientDeg}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <div class="testimonials-section__cta">
              <a class="button_wrapper" href="/contact">
                <span class="text"><span class="word">become</span><span class="word">a</span><span class="word">client</span></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  bindEvents();
}

function bindEvents() {
  root.querySelectorAll("[data-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeIndex = Number(button.dataset.index);
      render();
    });
  });

  root.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const dir = button.dataset.nav;
      state.activeIndex =
        dir === "prev"
          ? (state.activeIndex - 1 + TestimonialsData.length) % TestimonialsData.length
          : (state.activeIndex + 1) % TestimonialsData.length;
      render();
    });
  });

}

render();
