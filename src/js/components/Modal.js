/* =============================================================
   CASE STUDY MODAL COMPONENT
   ============================================================= */
let localProjects = [];
let activeModalId = null;

export const initModal = (projects) => {
    localProjects = projects;

    const closeBtn = document.querySelector('.modal-close');
    const modal    = document.getElementById('project-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal)    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
        if (modal?.classList.contains('open')) {
            if (e.key === 'ArrowLeft')  document.getElementById('modal-prev-project')?.click();
            if (e.key === 'ArrowRight') document.getElementById('modal-next-project')?.click();
        }
    });
};

export const openModal = (id) => {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    loadModalData(id);
    history.pushState(null, '', `?project=${encodeURIComponent(id)}`);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.lenis?.stop();

    const wrapper = modal.querySelector('.modal-wrapper');
    if (typeof gsap !== 'undefined' && wrapper) {
        gsap.fromTo(wrapper,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
    }
};

export const closeModal = () => {
    const modal = document.getElementById('project-modal');
    if (!modal?.classList.contains('open')) return;

    const wrapper = modal.querySelector('.modal-wrapper');
    const done = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        history.pushState(null, '', window.location.pathname);
        activeModalId = null;
        window.lenis?.start();
    };

    if (typeof gsap !== 'undefined' && wrapper) {
        gsap.to(wrapper, { opacity: 0, y: 15, duration: 0.35, ease: 'power2.in', onComplete: done });
    } else {
        done();
    }
};

const loadModalData = (id) => {
    const proj = localProjects.find(p => p.id === id);
    if (!proj) return;
    activeModalId = id;

    const $ = (elId) => document.getElementById(elId);

    if ($('modal-img'))      { $('modal-img').src = proj.img || ''; $('modal-img').alt = proj.title; }
    if ($('modal-cat'))        $('modal-cat').textContent = proj.category || 'Project';
    if ($('modal-title'))      $('modal-title').textContent = proj.title;
    if ($('modal-client'))     $('modal-client').textContent = proj.client || 'Personal Concept';
    if ($('modal-year'))       $('modal-year').textContent = proj.year || '—';
    if ($('modal-duration'))   $('modal-duration').textContent = proj.duration || '—';
    if ($('modal-focus'))      $('modal-focus').textContent = proj.focus || '—';
    if ($('modal-tools'))      $('modal-tools').textContent = proj.tools || '—';
    if ($('modal-output'))     $('modal-output').textContent = proj.output || '—';
    if ($('modal-concept-text')) $('modal-concept-text').textContent = proj.concept || 'No concept narrative.';

    /* Swatches */
    const swatchesEl = $('modal-swatches');
    if (swatchesEl) {
        swatchesEl.innerHTML = '';
        (proj.swatches || ['#0044FF','#C85A32','#FAF9F5','#141518']).forEach(color => {
            swatchesEl.insertAdjacentHTML('beforeend', `
                <div class="swatch-group">
                    <div class="swatch" style="background:${color};"></div>
                    <span class="swatch-label">${color}</span>
                </div>`);
        });
    }

    /* Typography */
    const typoEl = $('modal-typo');
    if (typoEl) {
        typoEl.innerHTML = '';
        (proj.typography || []).forEach(t => {
            typoEl.insertAdjacentHTML('beforeend', `
                <div class="typo-row">
                    <span class="typo-font">${t.name}: ${t.font}</span>
                    <span class="typo-sample">AaBbCc (${t.size})</span>
                </div>`);
        });
    }

    /* Modal pagination buttons */
    updateModalNav(id);

    /* Share button */
    const shareBtn = $('modal-share-btn');
    if (shareBtn) {
        const clone = shareBtn.cloneNode(true);
        shareBtn.parentNode.replaceChild(clone, shareBtn);
        clone.addEventListener('click', () => {
            const url = `${location.origin}${location.pathname}?project=${encodeURIComponent(id)}`;
            navigator.clipboard.writeText(url).then(() => {
                clone.textContent = 'Link Copied ✓';
                setTimeout(() => { clone.textContent = 'Share Project'; }, 2000);
            }).catch(() => {});
        });
    }

    /* Scroll modal content back to top */
    const modal = document.getElementById('project-modal');
    if (modal) modal.scrollTop = 0;
};

const updateModalNav = (currentId) => {
    if (localProjects.length <= 1) {
        const footer = document.querySelector('.modal-navigation-footer');
        if (footer) footer.style.display = 'none';
        return;
    }
    const footer = document.querySelector('.modal-navigation-footer');
    if (footer) footer.style.display = 'grid';

    const idx  = localProjects.findIndex(p => p.id === currentId);
    const prev = localProjects[(idx - 1 + localProjects.length) % localProjects.length];
    const next = localProjects[(idx + 1) % localProjects.length];

    const prevTitle = document.getElementById('modal-prev-title');
    const nextTitle = document.getElementById('modal-next-title');
    if (prevTitle) prevTitle.textContent = prev.title;
    if (nextTitle) nextTitle.textContent = next.title;

    const prevBtn = document.getElementById('modal-prev-project');
    const nextBtn = document.getElementById('modal-next-project');

    const replaceBtn = (btn, targetId) => {
        if (!btn) return;
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', () => transitionModal(targetId));
    };
    replaceBtn(prevBtn, prev.id);
    replaceBtn(nextBtn, next.id);
};

const transitionModal = (targetId) => {
    const study = document.querySelector('.modal-case-study');
    if (!study) return;
    if (typeof gsap !== 'undefined') {
        gsap.to(study, {
            opacity: 0, y: -12, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
                loadModalData(targetId);
                history.pushState(null, '', `?project=${encodeURIComponent(targetId)}`);
                gsap.to(study, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
            }
        });
    } else {
        loadModalData(targetId);
    }
};
