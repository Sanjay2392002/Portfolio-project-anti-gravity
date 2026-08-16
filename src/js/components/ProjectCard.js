/* =============================================================
   PROJECT CARD COMPONENT
   ============================================================= */
export const renderProjectCard = (proj, idx) => {
    const img = proj.img || '';
    const desc = proj.concept
        ? proj.concept.substring(0, 220) + (proj.concept.length > 220 ? '...' : '')
        : 'No concept narrative.';
    const year = proj.year || '2026';

    /* Alternating layout grid columns */
    let layout = 'project-card-standard';
    if (idx % 3 === 0)      layout = 'project-card-wide';
    else if (idx % 3 === 1) layout = 'project-card-portrait';
    else                    layout = 'project-card-square';

    const swatchHtml = (proj.swatches?.length)
        ? `<div class="project-card-swatches">
            ${proj.swatches.map(c => `<span class="card-swatch-dot" style="background:${c};" title="${c}"></span>`).join('')}
           </div>`
        : '';

    const featuredTag = proj.isFeatured ? `<span class="project-featured-tag">★ Featured</span>` : '';

    return `
        <div class="project-editorial-card ${layout}${proj.isFeatured ? ' featured-card' : ''}" data-proj-category="${proj.category || ''}">
            <div class="project-card-inner">
                <div class="project-img-wrapper" data-project-id="${proj.id}">
                    <img src="${img}" alt="${proj.title}" loading="lazy" class="optimized-project-img">
                    <div class="project-img-overlay">
                        ${featuredTag}
                        <span class="project-view-badge">View Case</span>
                    </div>
                </div>
                <div class="project-card-info">
                    <div class="project-card-meta">
                        <span class="proj-meta-tag">${proj.category || 'Personal Studio'}</span>
                        <span class="proj-meta-year">${year}</span>
                    </div>
                    <h4 class="proj-title">${proj.title}</h4>
                    <p class="proj-desc">${desc}</p>
                    <div class="proj-card-specs">
                        <span><strong>Tools:</strong> ${proj.tools || '—'}</span>
                        <span><strong>Focus:</strong> ${proj.focus || '—'}</span>
                    </div>
                    ${swatchHtml}
                    <div class="project-card-actions">
                        <button class="btn btn-sm btn-outline view-case-btn"
                                data-project-id="${proj.id}">
                            Case Study
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};
