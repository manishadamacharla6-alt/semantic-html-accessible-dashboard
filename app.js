
const API_URL = "https://fakestoreapi.com/products";
const CACHE_KEY = "dashboard_products";
const CACHE_TIME_KEY = "dashboard_products_time";
const CACHE_DURATION = 10 * 60 * 1000;

const searchInput = document.getElementById("project-search");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-projects");
const tableBody = document.getElementById("project-table-body");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");

let products = [];

async function loadProducts() {
    showLoading();

    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

        if (
            cachedData &&
            cachedTime &&
            Date.now() - Number(cachedTime) < CACHE_DURATION
        ) {
            products = JSON.parse(cachedData);
        } else {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to fetch API data.");
            }

            products = await response.json();

            localStorage.setItem(CACHE_KEY, JSON.stringify(products));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        }

        createCategoryOptions();
        renderProducts();

        loadingState.hidden = true;
    } catch (error) {
        loadingState.hidden = true;
        errorState.hidden = false;
        errorState.textContent =
            "Unable to load data. Please try again later.";
        console.error(error);
    }
}

function createCategoryOptions() {
    const categories = [
        ...new Set(products.map(product => product.category))
    ];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function renderProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortValue = sortSelect.value;

    let filteredProducts = products.filter(product => {
        const matchesSearch =
            product.title.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    filteredProducts.sort((a, b) => {
        if (sortValue === "title-asc") {
            return a.title.localeCompare(b.title);
        }

        if (sortValue === "title-desc") {
            return b.title.localeCompare(a.title);
        }

        if (sortValue === "price-asc") {
            return a.price - b.price;
        }

        if (sortValue === "price-desc") {
            return b.price - a.price;
        }
    });

    tableBody.innerHTML = "";

    filteredProducts.forEach(product => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(product.title)}</td>
            <td>${escapeHTML(product.category)}</td>
            <td>$${product.price.toFixed(2)}</td>
        `;

        tableBody.appendChild(row);
    });
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function showLoading() {
    loadingState.hidden = false;
    errorState.hidden = true;
}

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

loadProducts();
