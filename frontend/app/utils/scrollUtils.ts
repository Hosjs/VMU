/**
 * Smooth scroll to element with offset for sticky header
 */
export function smoothScrollToElement(elementId: string, offset: number = 80) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Smooth scroll to top
 */
export function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Handle anchor link click with smooth scroll
 */
export function handleAnchorClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    offset: number = 80
) {
    // Check if it's an anchor link (starts with #)
    if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);

        if (targetId) {
            smoothScrollToElement(targetId, offset);

            // Update URL without scrolling
            window.history.pushState(null, '', href);
        } else {
            // If just #, scroll to top
            smoothScrollToTop();
        }
    }
}

/**
 * Scroll with animation and easing
 */
export function animatedScrollTo(targetPosition: number, duration: number = 800) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    function animation(currentTime: number) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function easeInOutQuad(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

/**
 * Check if element is in viewport
 */
export function isElementInViewport(elementId: string): boolean {
    const element = document.getElementById(elementId);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Get active section based on scroll position
 */
export function getActiveSection(sectionIds: string[], offset: number = 100): string | null {
    const scrollPosition = window.pageYOffset + offset;

    for (let i = sectionIds.length - 1; i >= 0; i--) {
        const element = document.getElementById(sectionIds[i]);
        if (element && element.offsetTop <= scrollPosition) {
            return sectionIds[i];
        }
    }

    return null;
}

