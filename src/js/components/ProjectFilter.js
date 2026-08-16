/* =============================================================
   PROJECT FILTERING SYSTEM
   ============================================================= */
export const renderProjectFilters = (allProjects, activeCategory, onFilterChange) => {
    const filterContainer = document.getElementById('project-filter-bar');
    if (!filterContainer) return;

    /* Get unique categories that actually have projects */
    const categoriesWithProjects = {};
    allProjects.forEach(p => {
        const cat = p.category || 'Personal Projects';
        categoriesWithProjects[cat] = (categoriesWithProjects[cat] || 0) + 1;
    });

    const activeCategories = Object.keys(categoriesWithProjects);

    if (activeCategories.length <= 1) {
        filterContainer.innerHTML = '';
        return; // No need to filter if there's only one category
    }

    let html = `
        <button class="filter-btn ${activeCategory === 'all' ? 'active' : ''}" data-filter="all">
            All <span class="filter-count">${allProjects.length}</span>
        </button>
    `;

    Object.entries(categoriesWithProjects).forEach(([cat, count]) => {
        const safeFilterName = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        html += `
            <button class="filter-btn ${activeCategory === safeFilterName ? 'active' : ''}" data-filter="${safeFilterName}">
                ${cat} <span class="filter-count">${count}</span>
            </button>
        `;
    });

    filterContainer.innerHTML = html;

    /* Click handlers */
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');
            
            // Toggle active styling
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (typeof onFilterChange === 'function') {
                onFilterChange(filterValue);
            }
        });
    });
};

/* Filter grid blocks with smooth GSAP animations */
export const applyCategoryFilter = (filterValue) => {
    const sections = document.querySelectorAll('.category-showcase-section');
    if (!sections.length) return;

    if (typeof gsap === 'undefined') {
        sections.forEach(sec => {
            const match = filterValue === 'all' || sec.id === `cat-${filterValue}`;
            sec.style.display = match ? '' : 'none';
        });
        return;
    }

    sections.forEach(sec => {
        const match = filterValue === 'all' || sec.id === `cat-${filterValue}`;
        if (match) {
            // Fade in matching sections
            sec.style.display = '';
            gsap.fromTo(sec, 
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
        } else {
            // Fade out other sections
            gsap.to(sec, {
                opacity: 0,
                y: -10,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    sec.style.display = 'none';
                }
            });
        }
    });
};
