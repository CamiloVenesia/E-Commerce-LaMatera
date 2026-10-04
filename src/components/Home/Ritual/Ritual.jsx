import { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaQuoteLeft, FaStar } from "react-icons/fa";

import "./Ritual.css";


// TEXTO DE DEMO: reemplazar por reseñas reales antes de publicar como testimonios.
const reviews = [
    {
        name: "Sofía M.",
        date: "Hace 2 semanas",
        text: "Compré un mate para regalar y la verdad que superó mis expectativas. La presentación está muy linda y llegó rapidísimo. Se nota que cuidan bastante los detalles.",
    },
    {
        name: "Martín R.",
        date: "Hace 3 semanas",
        text: "Muy buena experiencia de compra. El mate es tal cual se ve en las fotos, incluso más lindo en persona. La bombilla calzó perfecto y llegó todo muy bien embalado.",
    },
    {
        name: "Camila P.",
        date: "Hace 1 mes",
        text: "Era para hacer un regalo y quedé muy conforme. Me ayudaron a elegir el modelo y llegó antes de lo que esperaba. La persona que lo recibió quedó feliz.",
    },
    {
        name: "Nicolás G.",
        date: "Hace 1 mes",
        text: "El mate está buenísimo. Buscaba algo lindo pero que también fuera para usar todos los días y este cumplió perfecto. Muy buena terminación.",
    },
    {
        name: "Valentina S.",
        date: "Hace 1 mes",
        text: "Me encantó la compra. El paquete llegó impecable y el mate tiene una terminación hermosa. Además, la atención fue rápida y muy amable.",
    },
    {
        name: "Lucas A.",
        date: "Hace 2 meses",
        text: "Compré el combo con termo y mate y estoy muy conforme. Todo se siente de buena calidad y la estética de los productos es exactamente lo que estaba buscando.",
    },
    {
        name: "Agustina F.",
        date: "Hace 2 meses",
        text: "Muy recomendable si buscan un regalo distinto. Pedí que me lo prepararan para regalo y quedó precioso. Llegó rápido y sin ningún detalle.",
    },
    {
        name: "Tomás B.",
        date: "Hace 2 meses",
        text: "El proceso de compra fue simple y el envío llegó en el tiempo indicado. El mate tiene muy buenos detalles y después de varios usos sigue impecable.",
    },
    {
        name: "Julieta C.",
        date: "Hace 3 meses",
        text: "Hace tiempo quería un mate de calabaza y este me encantó. La forma es muy linda, la bombilla queda firme y se nota que fue elegido con cuidado.",
    },
    {
        name: "Federico L.",
        date: "Hace 3 meses",
        text: "Excelente compra. Lo pedí para un cumpleaños y llegó a tiempo. Muy buena presentación y el mate era incluso más lindo de lo que esperaba.",
    },
];


const AUTO_PLAY_MS = 6500;


const Ritual = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const viewportRef = useRef(null);
    const touchStartX = useRef(null);


    const scrollToReview = (index) => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const target = viewport.children[0]?.children[index];
        if (!target) return;

        viewport.scrollTo({
            left: target.offsetLeft,
            behavior: "smooth",
        });

        setActiveIndex(index);
    };


    const nextReview = () => {
        const nextIndex = (activeIndex + 1) % reviews.length;
        scrollToReview(nextIndex);
    };


    const previousReview = () => {
        const previousIndex = (activeIndex - 1 + reviews.length) % reviews.length;
        scrollToReview(previousIndex);
    };


    useEffect(() => {
        if (isPaused) return undefined;

        const interval = window.setInterval(() => {
            setActiveIndex((current) => {
                const nextIndex = (current + 1) % reviews.length;
                const viewport = viewportRef.current;
                const target = viewport?.children[0]?.children[nextIndex];

                if (target) {
                    viewport.scrollTo({
                        left: target.offsetLeft,
                        behavior: "smooth",
                    });
                }

                return nextIndex;
            });
        }, AUTO_PLAY_MS);

        return () => window.clearInterval(interval);
    }, [isPaused]);


    const handleScroll = () => {
        const viewport = viewportRef.current;
        const track = viewport?.children[0];

        if (!viewport || !track) return;

        const cards = Array.from(track.children);
        if (!cards.length) return;

        let closestIndex = 0;
        let closestDistance = Infinity;

        cards.forEach((card, index) => {
            const distance = Math.abs(card.offsetLeft - viewport.scrollLeft);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        setActiveIndex(closestIndex);
    };


    const handleTouchStart = (event) => {
        touchStartX.current = event.touches[0].clientX;
    };


    const handleTouchEnd = (event) => {
        if (touchStartX.current === null) return;

        const touchEndX = event.changedTouches[0].clientX;
        const distance = touchStartX.current - touchEndX;

        if (Math.abs(distance) > 45) {
            if (distance > 0) {
                nextReview();
            } else {
                previousReview();
            }
        }

        touchStartX.current = null;
    };


    return (
        <section className="ritual">

            <div className="ritual-inner">

                <header className="ritual-header">

                    <span className="ritual-eyebrow">
                        EXPERIENCIAS DE CLIENTES
                    </span>

                    <h2>
                        Lo que dicen quienes nos eligen.
                    </h2>

                    <p>
                        Cada compra tiene una historia. Estas son algunas de las experiencias
                        que queremos transmitir con La Matera.
                    </p>

                </header>


                <div
                    className="ritual-slider"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >

                    <button
                        type="button"
                        className="ritual-arrow ritual-arrow-left"
                        onClick={previousReview}
                        aria-label="Ver opinión anterior"
                    >
                        <FaArrowLeft />
                    </button>


                    <div
                        className="ritual-viewport"
                        ref={viewportRef}
                        onScroll={handleScroll}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >

                        <div className="ritual-track">

                            {reviews.map((review, index) => (

                                <article
                                    className={`ritual-review ${index === activeIndex ? "is-active" : ""}`}
                                    key={`${review.name}-${index}`}
                                >

                                    <div className="ritual-review-top">

                                        <div className="ritual-source">
                                            <span className="ritual-source-mark">L</span>
                                            <span>La Matera</span>
                                        </div>

                                        <span className="ritual-review-date">
                                            {review.date}
                                        </span>

                                    </div>


                                    <div className="ritual-stars" aria-label="5 de 5 estrellas">
                                        {Array.from({ length: 5 }).map((_, starIndex) => (
                                            <FaStar key={starIndex} />
                                        ))}
                                    </div>


                                    <FaQuoteLeft className="ritual-quote" aria-hidden="true" />


                                    <p className="ritual-review-text">
                                        {review.text}
                                    </p>


                                    <div className="ritual-review-author">
                                        <span className="ritual-author-avatar">
                                            {review.name.charAt(0)}
                                        </span>

                                        <div>
                                            <h3>{review.name}</h3>
                                            <span>Cliente</span>
                                        </div>
                                    </div>

                                </article>

                            ))}

                        </div>

                    </div>


                    <button
                        type="button"
                        className="ritual-arrow ritual-arrow-right"
                        onClick={nextReview}
                        aria-label="Ver opinión siguiente"
                    >
                        <FaArrowRight />
                    </button>

                </div>


                <div className="ritual-controls">

                    <div className="ritual-dots" aria-label="Navegación de opiniones">
                        {reviews.map((review, index) => (
                            <button
                                type="button"
                                key={`${review.name}-dot`}
                                className={`ritual-dot ${index === activeIndex ? "is-active" : ""}`}
                                onClick={() => scrollToReview(index)}
                                aria-label={`Ver opinión ${index + 1}`}
                                aria-current={index === activeIndex ? "true" : undefined}
                            />
                        ))}
                    </div>

                </div>

            </div>

        </section>
    );
};


export default Ritual;
