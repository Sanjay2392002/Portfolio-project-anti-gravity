import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

export const User = mongoose.model('User', UserSchema);

const ProjectSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String },
    year: { type: String },
    duration: { type: String },
    tools: { type: String },
    client: { type: String },
    focus: { type: String },
    output: { type: String },
    concept: { type: String },
    img: { type: String },
    swatches: [{ type: String }],
    typography: [{
        name: String,
        font: String,
        size: String
    }],
    order: { type: Number, default: 0 }
});

export const Project = mongoose.model('Project', ProjectSchema);

const ProfileSchema = new mongoose.Schema({
    hero: { type: mongoose.Schema.Types.Mixed },
    about: { type: mongoose.Schema.Types.Mixed },
    contact: { type: mongoose.Schema.Types.Mixed }
});

export const Profile = mongoose.model('Profile', ProfileSchema);

const SiteContentSchema = new mongoose.Schema({
    logo: { type: String },
    navCta: { type: String },
    nav: [{
        label: String,
        href: String
    }],
    projects: { type: mongoose.Schema.Types.Mixed },
    footer: { type: mongoose.Schema.Types.Mixed },
    contactForm: { type: mongoose.Schema.Types.Mixed }
});

export const SiteContent = mongoose.model('SiteContent', SiteContentSchema);

const SectionSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "Hero", "About", "Projects", "Contact", "Custom1"
    type: { type: String, required: true }, // "hero", "about", "projects", "contact", "custom"
    order: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false },
    content: { type: mongoose.Schema.Types.Mixed } // For custom section HTML or structured data
});

export const Section = mongoose.model('Section', SectionSchema);
