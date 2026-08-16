/* =============================================================
   CUSTOM CURSOR COMPONENT
   ============================================================= */
export const initCursor = () => {
    const cursor    = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    if (!cursor || !cursorDot) return;

    let mX = 0, mY = 0, cX = 0, cY = 0, dX = 0, dY = 0;

    window.addEventListener('mousemove', e => {
        mX = e.clientX; mY = e.clientY;
        document.body.classList.add('cursor-active');
    });

    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));

    const tick = () => {
        cX += (mX - cX) * 0.12; cY += (mY - cY) * 0.12;
        dX += (mX - dX) * 0.25; dY += (mY - dY) * 0.25;
        cursor.style.transform    = `translate3d(${cX}px,${cY}px,0) translate(-50%,-50%)`;
        cursorDot.style.transform = `translate3d(${dX}px,${dY}px,0) translate(-50%,-50%)`;
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const targets = 'a,button,input,select,textarea,.project-img-wrapper,.dot-link';
    document.body.addEventListener('mouseenter', e => {
        if (!e.target.matches) return;
        const txt = cursor.querySelector('.cursor-text');
        if (e.target.closest('.project-img-wrapper') || e.target.matches('.project-img-wrapper')) {
            cursor.classList.add('view-hover');
            if (txt) txt.textContent = 'VIEW';
        } else if (e.target.closest('.modal-close') || e.target.matches('.modal-backdrop')) {
            cursor.classList.add('close-hover');
            if (txt) txt.textContent = 'CLOSE';
        } else if (e.target.matches(targets)) {
            cursor.classList.add('hovered');
        }
    }, true);

    document.body.addEventListener('mouseleave', e => {
        if (!e.target.matches) return;
        cursor.classList.remove('hovered', 'view-hover', 'close-hover');
        const txt = cursor.querySelector('.cursor-text');
        if (txt) txt.textContent = '';
    }, true);
};
