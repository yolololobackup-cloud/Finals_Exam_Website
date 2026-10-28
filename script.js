
const hobbies = [
    {
        name: "Gaming",
        icon: "images/hobbies/gaming.png",
        description: "Enjoy strategy, RPG, and multiplayer games that challenge my creativity and problem solving."
    },
    {
        name: "Coding",
        icon: "images/hobbies/coding.png",
        description: "Build websites and programs while continuously learning new technologies and improving my skills."
    },
    {
        name: "Art",
        icon: "images/hobbies/art.png",
        description: "Create digital designs and illustrations to express creativity and bring ideas to life."
    },
    {
        name: "Jogging",
        icon: "images/hobbies/jogging.png",
        description: "Stay active, build endurance, and challenge myself to improve with every run."
    },
    {
        name: "Language Learning",
        icon: "images/hobbies/language-learning.png",
        description: "Explore new languages and cultures while expanding the way I communicate."
    },
    {
        name: "Literature",
        icon: "images/hobbies/literature.png",
        description: "Discover new perspectives through stories, poems, and meaningful ideas."
    },
    {
        name: "Swimming",
        icon: "images/hobbies/swimming.png",
        description: "Build stamina and confidence while enjoying the water and improving my technique."
    }
];

const galleryItems = [
    {
        src: "images/gallery/gallery-1.png",
        alt: "Gallery artwork one",
        title: "Artwork One"
    },
    {
        src: "images/gallery/gallery-2.png",
        alt: "Gallery artwork two",
        title: "Artwork Two"
    },
    {
        src: "images/gallery/gallery-3.png",
        alt: "Gallery photograph",
        title: "Photography"
    }
];

const hobbyCards = document.getElementById("hobby-cards");
const previousHobbyButton = document.getElementById("prev-hobby");
const nextHobbyButton = document.getElementById("next-hobby");

const factsGrid = document.getElementById("facts-grid");
const factsScrollbar = document.getElementById("facts-scrollbar");
const factsThumb = document.getElementById("facts-scrollbar-thumb");

const galleryStage = document.getElementById("gallery-artworks");
const previousGalleryButton = document.getElementById("gallery-prev");
const nextGalleryButton = document.getElementById("gallery-next");

let currentHobbyIndex = 0;
let currentGalleryIndex = 0;
let dragState = null;
let resizeTimeout;

function getVisibleHobbyCount() {
    return window.innerWidth <= 350 ? 2 : 3;
}

function renderHobbies() {
    if (!hobbyCards) return;

    const visibleCount = getVisibleHobbyCount();

    const visibleHobbies = Array.from(
        { length: visibleCount },
        (_, offset) => hobbies[
            (currentHobbyIndex + offset) % hobbies.length
        ]
    );

    hobbyCards.innerHTML = visibleHobbies.map(hobby => `
        <article class="hobby-card">
            <div class="hobby-card-inner">
                <div class="hobby-icon" aria-hidden="true">
                    <img
                        class="hobby-icon-image"
                        src="${hobby.icon}"
                        alt=""
                        loading="lazy"
                        style="display:block;width:clamp(30px,5.2vw,58px);height:clamp(30px,5.2vw,58px);object-fit:contain;"
                    >
                </div>
                <h3>${hobby.name}</h3>
                <p>${hobby.description}</p>
            </div>
        </article>
    `).join("");

    hobbyCards.querySelectorAll(".hobby-icon-image").forEach(image => {
        image.addEventListener("error", () => {
            image.remove();
        }, { once: true });
    });
}

function updateFactsScrollbar() {
    if (!factsGrid || !factsScrollbar || !factsThumb) return;

    const trackWidth = factsScrollbar.clientWidth;
    const viewportWidth = factsGrid.clientWidth;
    const contentWidth = factsGrid.scrollWidth;

    if (!trackWidth || !viewportWidth) return;

    const maxScroll = Math.max(0, contentWidth - viewportWidth);
    const thumbWidth = maxScroll === 0
        ? trackWidth
        : Math.min(
            trackWidth,
            Math.max(32, trackWidth * viewportWidth / contentWidth)
        );

    const availableTravel = Math.max(0, trackWidth - thumbWidth);
    const progress = maxScroll > 0
        ? Math.max(0, Math.min(1, factsGrid.scrollLeft / maxScroll))
        : 0;

    factsThumb.style.width = `${thumbWidth}px`;
    factsThumb.style.transform =
        `translateX(${availableTravel * progress}px)`;

    factsScrollbar.setAttribute(
        "aria-valuenow",
        String(Math.round(progress * 100))
    );

    factsScrollbar.setAttribute(
        "aria-valuetext",
        `${Math.round(progress * 100)}% scrolled`
    );
}

function scrollFactsTo(clientX) {
    if (!factsGrid || !factsScrollbar || !factsThumb) return;

    const rect = factsScrollbar.getBoundingClientRect();
    const thumbWidth = factsThumb.getBoundingClientRect().width;
    const availableTravel = rect.width - thumbWidth;
    const maxScroll = factsGrid.scrollWidth - factsGrid.clientWidth;

    if (availableTravel <= 0 || maxScroll <= 0) return;

    const thumbPosition = Math.max(
        0,
        Math.min(
            availableTravel,
            clientX - rect.left - thumbWidth / 2
        )
    );

    factsGrid.scrollLeft = thumbPosition / availableTravel * maxScroll;
}

function handleFactsPointerDown(event) {
    if (!factsGrid || !factsScrollbar || !factsThumb) return;
    if (factsGrid.scrollWidth <= factsGrid.clientWidth) return;

    event.preventDefault();

    if (event.target !== factsThumb) {
        scrollFactsTo(event.clientX);
    }

    dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startScroll: factsGrid.scrollLeft
    };

    factsScrollbar.setPointerCapture(event.pointerId);
}

function handleFactsPointerMove(event) {
    if (!dragState || !factsGrid || !factsScrollbar || !factsThumb) return;
    if (dragState.pointerId !== event.pointerId) return;

    const trackWidth = factsScrollbar.clientWidth;
    const thumbWidth = factsThumb.getBoundingClientRect().width;
    const availableTravel = trackWidth - thumbWidth;
    const maxScroll = factsGrid.scrollWidth - factsGrid.clientWidth;

    if (availableTravel <= 0 || maxScroll <= 0) return;

    const distance = event.clientX - dragState.startX;

    factsGrid.scrollLeft = Math.max(
        0,
        Math.min(
            maxScroll,
            dragState.startScroll + distance / availableTravel * maxScroll
        )
    );
}

function stopFactsDragging(event) {
    if (!dragState) return;

    if (
        event &&
        event.pointerId !== undefined &&
        event.pointerId !== dragState.pointerId
    ) {
        return;
    }

    dragState = null;
}

function handleFactsScrollbarKeydown(event) {
    if (!factsGrid) return;

    const maxScroll = factsGrid.scrollWidth - factsGrid.clientWidth;

    switch (event.key) {
        case "ArrowRight":
            event.preventDefault();
            factsGrid.scrollBy({ left: 100, behavior: "smooth" });
            break;
        case "ArrowLeft":
            event.preventDefault();
            factsGrid.scrollBy({ left: -100, behavior: "smooth" });
            break;
        case "Home":
            event.preventDefault();
            factsGrid.scrollTo({ left: 0, behavior: "smooth" });
            break;
        case "End":
            event.preventDefault();
            factsGrid.scrollTo({ left: maxScroll, behavior: "smooth" });
            break;
    }
}

function renderGallery() {
    if (!galleryStage) return;

    const positions = ["one", "two", "three"];

    const visibleItems = galleryItems.map(
        (_, offset) => galleryItems[
            (currentGalleryIndex + offset) % galleryItems.length
        ]
    );

    galleryStage.innerHTML = visibleItems.map((item, index) => `
        <figure class="gallery-item gallery-item-${positions[index]}">
            <img src="${item.src}" alt="${item.alt}" loading="lazy">
            <figcaption>${item.title}</figcaption>
        </figure>
    `).join("");

    galleryStage.querySelectorAll(".gallery-item img").forEach(image => {
        image.addEventListener("error", () => {
            const figure = image.closest(".gallery-item");

            image.remove();
            figure.classList.add("is-placeholder");
        }, { once: true });
    });
}

function moveGallery(direction) {
    currentGalleryIndex = (
        currentGalleryIndex + direction + galleryItems.length
    ) % galleryItems.length;

    renderGallery();
}

function initializeStarButtons() {
    document.querySelectorAll(
        ".press-star, .skills-decor-star"
    ).forEach(star => {
        star.addEventListener("click", () => {
            const isPressed =
                star.getAttribute("aria-pressed") === "true";

            star.setAttribute("aria-pressed", String(!isPressed));
        });
    });
}

if (hobbyCards && previousHobbyButton && nextHobbyButton) {
    previousHobbyButton.addEventListener("click", () => {
        currentHobbyIndex = (
            currentHobbyIndex - 1 + hobbies.length
        ) % hobbies.length;

        renderHobbies();
    });

    nextHobbyButton.addEventListener("click", () => {
        currentHobbyIndex = (
            currentHobbyIndex + 1
        ) % hobbies.length;

        renderHobbies();
    });

    renderHobbies();
}

if (factsGrid && factsScrollbar && factsThumb) {
    factsScrollbar.addEventListener("pointerdown", handleFactsPointerDown);
    factsScrollbar.addEventListener("pointermove", handleFactsPointerMove);
    factsScrollbar.addEventListener("pointerup", stopFactsDragging);
    factsScrollbar.addEventListener("pointercancel", stopFactsDragging);
    factsScrollbar.addEventListener("lostpointercapture", stopFactsDragging);
    factsScrollbar.addEventListener("keydown", handleFactsScrollbarKeydown);

    factsGrid.addEventListener("scroll", updateFactsScrollbar, {
        passive: true
    });

    if ("ResizeObserver" in window) {
        const factsObserver = new ResizeObserver(updateFactsScrollbar);
        factsObserver.observe(factsGrid);
        factsObserver.observe(factsScrollbar);
    }

    requestAnimationFrame(() => {
        updateFactsScrollbar();
        requestAnimationFrame(updateFactsScrollbar);
    });
}

initializeStarButtons();

if (galleryStage && previousGalleryButton && nextGalleryButton) {
    previousGalleryButton.addEventListener("click", () => moveGallery(-1));
    nextGalleryButton.addEventListener("click", () => moveGallery(1));
    renderGallery();
}

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        renderHobbies();
        updateFactsScrollbar();
    }, 100);
});
