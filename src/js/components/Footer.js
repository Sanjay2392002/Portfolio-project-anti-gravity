/* =============================================================
   FOOTER COMPONENT
   ============================================================= */
export const applyFooter = (footerData) => {
    if (!footerData) return;
    
    const cp = document.getElementById('footer-copyright');
    if (cp && footerData.copyright) {
        cp.innerHTML = footerData.copyright;
    }
    
    const ty = document.getElementById('footer-thank-you');
    if (ty && footerData.thankYouText) {
        ty.textContent = footerData.thankYouText;
    }
};
