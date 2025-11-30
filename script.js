const form = document.getElementById('form');
const searchInput = document.getElementById('search-input');
const imageContainer = document.querySelector('.image-container');
const imageDetail = document.querySelector('.image-details');
const searchResult = document.querySelector('.search-result');
const paginationContainer = document.querySelector('.pagination');
const header = document.querySelector('header')

const API_KEY = 'OtKk2CGPUHOKam9tIAsNDTNVScS0hUz5XCvwQRt6nv38Y1XqjEJqTY9L';
let keyword = '';
let page = 1;
let per_page = 10;
let total_page = 1;
let selectedImages = [];

searchInput.focus();
fillerImages();

form.addEventListener('submit', e => {
    e.preventDefault();
    searchImages();
});

// SEARCH FUNCTION
async function searchImages() {
    keyword = searchInput.value.trim();
    if (!keyword) return;

    imageDetail.classList.add('hidden');
    page = 1;
    searchResult.classList.remove('hidden')
    searchResult.style.display = 'block';
    searchResult.textContent = `Searching images for "${keyword}"...`;

    await lookupImages();
    searchInput.value = ''
}

// FETCH IMAGES
async function lookupImages() {
    try {
        const url = `https://api.pexels.com/v1/search?query=${keyword}&per_page=${per_page}&page=${page}`;
        const response = await fetch(url, { headers: { Authorization: API_KEY } });
        const data = await response.json();

        total_page = Math.ceil(data.total_results / per_page);
        searchResult.textContent = `Search results for "${keyword}" (${data.total_results} images found)`;

        renderImages(data.photos);
    } catch (err) {
        searchResult.textContent = `Error fetching images. Try again!`;
        console.error(err);
    }
}

// RENDER IMAGES
function renderImages(images) {
    imageContainer.innerHTML = '';
    selectedImages = images;
    renderPagination();

    images.forEach(imgData => {
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img');

        const img = document.createElement('img');
        img.src = imgData.src.medium;
        img.alt = imgData.alt;
        img.id = imgData.id;

        const link = document.createElement('button');
        link.classList.add('desc-btn');
        link.textContent = 'Download';
        link.addEventListener('click', () => downloadImage(imgData.src.original, `${imgData.alt || 'image'}.jpg`));


        imgDiv.appendChild(img);
        imgDiv.appendChild(link);
        imageContainer.appendChild(imgDiv);
    });
}

// IMAGE DETAIL VIEW
imageContainer.addEventListener('click', e => {
    const imgId = e.target.id;
    const imgData = selectedImages.find(img => img.id == imgId);
    if (imgData) renderImageDetail(imgData);
});
function renderImageDetail(img) {
    imageDetail.innerHTML = '';
    imageDetail.classList.remove('hidden');

    const imgEl = document.createElement('img');
    imgEl.src = img.src.large;
    imgEl.alt = img.alt;

    const details = document.createElement('div');
    details.classList.add('details');

    details.innerHTML = `
        <h1>Image Details</h1>
        <p><span>Description</span>: ${img.alt || 'N/A'}</p>
        <p><span>Creator</span>: ${img.photographer}</p>
        <p><span>Portfolio</span>: <a href="${img.photographer_url}" target="_blank">${img.photographer}</a></p>
    `;

    // Create download button
    const downloadBtn = document.createElement('button');
    downloadBtn.classList.add('desc-btn', 'detail-desc');
    downloadBtn.innerHTML = 'Download <i class="fa fa-download"></i>';
    downloadBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(img.src.original);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${img.alt || 'image'}.jpg`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed', err);
        }
    });

    imageDetail.appendChild(imgEl);
    imageDetail.appendChild(details);
    details.appendChild(downloadBtn);
    imageDetail.scrollIntoView({ behavior: 'smooth' });
}


// RANDOM FILLER IMAGES
async function fillerImages() {
    keyword = 'nature';
    searchResult.style.display = 'block';
    searchResult.textContent = 'Loading images...';
    await lookupImages();
}

// PAGINATION
function renderPagination() {
    imageDetail.classList.add('hidden')
    paginationContainer.innerHTML = '';
    if (total_page <= 1) return;

    const maxButtons = 5;
    const createButton = (num, active = false) => {
        const btn = document.createElement('button');
        btn.textContent = num;
        btn.classList.add('pag-btn');
        if (active) btn.classList.add('active');
        btn.addEventListener('click', () => {
            page = num;
            lookupImages();
            scrollToTop();
        });
        return btn;
    };

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Prev';
    prevBtn.classList.add('pag-btn');
    prevBtn.disabled = page === 1;
    prevBtn.addEventListener('click', () => { if (page > 1) { page--; lookupImages(); scrollToTop(); } });
    paginationContainer.appendChild(prevBtn);

    // First page
    paginationContainer.appendChild(createButton(1, page === 1));

    // Left dots
    if (page > maxButtons) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        paginationContainer.appendChild(dots);
    }

    // Pages around current
    const start = Math.max(2, page - 1);
    const end = Math.min(total_page - 1, page + 1);
    for (let i = start; i <= end; i++) paginationContainer.appendChild(createButton(i, page === i));

    // Right dots
    if (page < total_page - maxButtons + 1) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        paginationContainer.appendChild(dots);
    }

    // Last page
    if (total_page > 1) paginationContainer.appendChild(createButton(total_page, page === total_page));

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.classList.add('pag-btn');
    nextBtn.disabled = page === total_page;
    nextBtn.addEventListener('click', () => { if (page < total_page) { page++; lookupImages(); scrollToTop(); } });
    paginationContainer.appendChild(nextBtn);
}

// Utility
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function downloadImage(url, filename) {
    try {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        alert('Download failed');
    }
}
