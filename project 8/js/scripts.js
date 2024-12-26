// Constants for fallback images
const FALLBACK_CARD_IMG = '../images/card_placeholder_bg.webp';
const FALLBACK_SPOTLIGHT_IMG = '../images/spotlight_placeholder_bg.webp';

// Scroll Arrows Logic
let scrollInterval;
let isScrolling = false;

// Helper function to fetch JSON data
const fetchJSON = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Function to update the About Me section UI
const updateAboutMeUI = (data) => {
    if (!data) return;
    const aboutMe = document.getElementById('aboutMe');
    aboutMe.innerHTML = `
        <p>${data.aboutMe}</p>
        <div class="headshotContainer">
            <img src="${data.headshot}" alt="Headshot">
        </div>
    `;
};

// Function to update the Portfolio UI
const updatePortfolioUI = (projects) => {
    if (!projects || projects.length === 0) return;

    const projectList = document.getElementById('projectList');
    projects.forEach((project) => {
        const projectCard = createProjectCard(project);
        projectList.appendChild(projectCard);
    });

    updateSpotlightUI(projects[0]); // Set initial spotlight
    setupNavigationArrows(); // Enable navigation
};

// Function to create a project card element
const createProjectCard = (project) => {
    const projectCard = document.createElement('div');
    projectCard.classList.add('projectCard');
    projectCard.id = project.project_id;
    projectCard.style.backgroundImage = `url('${project.card_image ?? FALLBACK_CARD_IMG}')`;
    projectCard.innerHTML = `
        <h3>${project.project_name || ''}</h3>
        <p>${project.short_description || ''}</p>
    `;

    projectCard.addEventListener('click', () => updateSpotlightUI(project));
    return projectCard;
};

// Function to update the spotlight UI
const updateSpotlightUI = (project) => {
    if (!project) return;

    const spotlightTitles = document.getElementById('spotlightTitles');
    const projectSpotlight = document.getElementById('projectSpotlight');
    projectSpotlight.style.backgroundImage = `url('${project.spotlight_image ?? FALLBACK_SPOTLIGHT_IMG}')`;
    spotlightTitles.innerHTML = `
        <h3>${project.project_name || ''}</h3>
        <p>${project.long_description || ''}</p>
        <a href="${project.url || '#'}" target="_blank">Learn more</a>
    `;
};

// Function to set up scroll navigation arrows
const setupNavigationArrows = () => {
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');

    arrowLeft.addEventListener('click', () => scrollProjects('left'));
    arrowRight.addEventListener('click', () => scrollProjects('right'));
};

// Function to scroll project list (horizontal/vertical)
const scrollProjects = (direction) => {
    const projectList = document.getElementById('projectList');
    const scrollAmount = projectList.clientWidth / 2;

    if (window.innerWidth < 768) { // Horizontal scroll for mobile
        projectList.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    } else { // Vertical scroll for desktop
        projectList.scrollBy({
            top: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }
};

// Scroll Arrows Continuous Scroll Logic
const startScrolling = (direction) => {
    if (!isScrolling) {
        isScrolling = true;
        scrollInterval = setInterval(() => scrollProjectsContinuously(direction), 50); // Adjust 50ms for continuous scrolling speed
    }
};

const stopScrolling = () => {
    isScrolling = false;
    clearInterval(scrollInterval);
};

// Scroll Projects Continuously
const scrollProjectsContinuously = (direction) => {
    const projectList = document.getElementById('projectList');
    const scrollAmount = projectList.clientWidth / 2;

    if (window.innerWidth < 768) { // Mobile horizontal scroll
        projectList.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    } else { // Desktop vertical scroll
        projectList.scrollBy({
            top: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }
};

// Form Validation
const setupFormValidation = () => {
    const contactForm = document.getElementById('formSection');
    contactForm.addEventListener('submit', handleFormSubmission);

    const messageInput = document.getElementById('contactMessage');
    messageInput.addEventListener('input', updateCharacterCount);
};

const handleFormSubmission = (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');

    const isEmailValid = validateEmail(emailInput, emailError);
    const isMessageValid = validateMessage(messageInput, messageError);

    if (isEmailValid && isMessageValid) {
        alert('Form submitted successfully!');
        resetForm(emailInput, messageInput);
    }
};

const validateEmail = (input, errorElement) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidCharRegex = /[^a-zA-Z0-9@._-]/;

    if (!emailRegex.test(input.value)) {
        errorElement.textContent = 'Please enter a valid email address.';
        input.classList.add('invalid');
        return false;
    } else if (invalidCharRegex.test(input.value)) {
        errorElement.textContent = 'Email contains invalid characters.';
        input.classList.add('invalid');
        return false;
    } else {
        errorElement.textContent = '';
        input.classList.remove('invalid');
        return true;
    }
};

const validateMessage = (input, errorElement) => {
    const maxLength = 300;
    const invalidCharRegex = /[^a-zA-Z0-9@._-\s]/;

    if (input.value.length > maxLength) {
        errorElement.textContent = 'Message exceeds 300 characters.';
        input.classList.add('invalid');
        return false;
    } else if (invalidCharRegex.test(input.value)) {
        errorElement.textContent = 'Message contains invalid characters.';
        input.classList.add('invalid');
        return false;
    } else {
        errorElement.textContent = '';
        input.classList.remove('invalid');
        return true;
    }
};

const updateCharacterCount = function () {
    const maxLength = 300;
    const charactersLeft = document.getElementById('charactersLeft');
    charactersLeft.textContent = `Characters: ${this.value.length}/${maxLength}`;
};

const resetForm = (emailInput, messageInput) => {
    emailInput.value = '';
    messageInput.value = '';
    document.getElementById('charactersLeft').textContent = 'Characters: 0/300';
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const aboutMeData = await fetchJSON('/data/aboutMeData.json');
        updateAboutMeUI(aboutMeData);

        const projectsData = await fetchJSON('/data/projectsData.json');
        updatePortfolioUI(projectsData);

        setupFormValidation();
    } catch (error) {
        console.error('Initialization failed:', error);
    }

    // Scroll Arrow Event Listeners
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');

    arrowLeft.addEventListener('mousedown', () => startScrolling('left'));
    arrowLeft.addEventListener('mouseup', stopScrolling);
    arrowLeft.addEventListener('mouseleave', stopScrolling);

    arrowRight.addEventListener('mousedown', () => startScrolling('right'));
    arrowRight.addEventListener('mouseup', stopScrolling);
    arrowRight.addEventListener('mouseleave', stopScrolling);
});
