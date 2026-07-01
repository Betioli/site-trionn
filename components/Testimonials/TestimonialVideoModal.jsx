export default function TestimonialVideoModal({ videoURL, onClose }) {
  if (!videoURL) return null;

  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="video-modal__close" onClick={onClose}>
          Close ✕
        </button>

        <iframe
          src={videoURL}
          className="video-modal__iframe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Testimonial video"
        />
      </div>
    </div>
  );
}
