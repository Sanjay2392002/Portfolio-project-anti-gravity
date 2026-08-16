/* =============================================================
   ABOUT SECTION CONTROLLER
   ============================================================= */
export const applyAboutProfile = (aboutData) => {
    if (!aboutData) return;

    const badge = document.getElementById('about-badge');
    if (badge && aboutData.sectionBadge) badge.textContent = aboutData.sectionBadge;

    const titleEl = document.getElementById('about-section-title');
    if (titleEl) {
        const main   = aboutData.title   || 'About';
        const italic = aboutData.titleItalic || '';
        titleEl.innerHTML = `${main} <br><span class="serif-italic">${italic}</span>`;
    }

    const bioEl = document.getElementById('about-bio');
    if (bioEl && aboutData.bio) bioEl.textContent = aboutData.bio;

    const aboutImg = document.getElementById('about-portrait-img');
    if (aboutImg && aboutData.portrait) aboutImg.src = aboutData.portrait;

    const resumeBtn = document.getElementById('btn-download-resume');
    if (resumeBtn) {
        if (aboutData.resumeUrl) {
            resumeBtn.href = aboutData.resumeUrl;
            resumeBtn.removeAttribute('tabindex');
            resumeBtn.style.opacity = '1';
            resumeBtn.style.pointerEvents = '';
        } else {
            resumeBtn.style.opacity = '0.4';
            resumeBtn.style.pointerEvents = 'none';
        }
        if (aboutData.resumeLabel) {
            // Keep the icon SVG
            const svgMarkup = resumeBtn.querySelector('svg')?.outerHTML || '';
            resumeBtn.innerHTML = `${aboutData.resumeLabel} ${svgMarkup}`;
        }
    }

    /* Timeline: Experience */
    const expEl = document.getElementById('about-experience-list');
    if (expEl && aboutData.experience?.length) {
        expEl.innerHTML = aboutData.experience.map(i => `
            <li>
                <span class="timeline-date">${i.date}</span>
                <span class="timeline-role">${i.role}</span>
                <span class="timeline-company">${i.company}</span>
            </li>`).join('');
    }

    /* Timeline: Education */
    const eduEl = document.getElementById('about-education-list');
    if (eduEl && aboutData.education?.length) {
        eduEl.innerHTML = aboutData.education.map(i => `
            <li>
                <span class="timeline-date">${i.date}</span>
                <span class="timeline-role">${i.role}</span>
                <span class="timeline-company">${i.company}</span>
            </li>`).join('');
    }

    /* Capabilities list */
    const capEl = document.getElementById('about-capabilities-list');
    if (capEl && aboutData.capabilities?.length) {
        capEl.innerHTML = aboutData.capabilities.map(c =>
            `<span class="skill-tag">${c}</span>`).join('');
    }

    /* Software list */
    const softEl = document.getElementById('about-software-list');
    if (softEl && aboutData.software?.length) {
        softEl.innerHTML = aboutData.software.map(s =>
            `<div class="software-item" title="${s.name}">
                <span class="soft-icon">${s.key}</span>
                <span class="soft-name">${s.name}</span>
            </div>`).join('');
    }
};
