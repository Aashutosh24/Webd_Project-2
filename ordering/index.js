const buttons = document.querySelectorAll('button[data-filter]');
const restaurants = Array.from(document.querySelectorAll('.restu'));
const searchInput = document.querySelector('.searchInput');
const searchButton = document.querySelector('.searchButton');

let currentCategory = 'all';
const searchIndex = new Map();

function categoryAllows(restu) {
  if (currentCategory === 'all') return true;
  const categories = (restu.getAttribute('data-category') || '').split(' ');
  return categories.includes(currentCategory);
}

function matchesSearch(restu, query) {
  if (!query) return true;
  const items = searchIndex.get(restu) || [];
  const restName = restu.textContent.toLowerCase();
  return restName.includes(query) || items.some(item => item.includes(query));
}

function applyFilters() {
  const query = (searchInput?.value || '').trim().toLowerCase();
  restaurants.forEach(restu => {
    const show = categoryAllows(restu) && matchesSearch(restu, query);
    restu.style.display = show ? 'block' : 'none';
  });
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedCategory = button.getAttribute('data-filter');
    currentCategory = selectedCategory || 'all';
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    applyFilters();
  });
});

async function buildSearchIndex() {
  const tasks = restaurants.map(async (restu) => {
    const link = restu.querySelector('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    const url = new URL(href, window.location.href);
    try {
      const response = await fetch(url.toString(), { cache: 'no-cache' });
      if (!response.ok) return;
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const names = new Set();
      doc.querySelectorAll('[data-name]').forEach(btn => {
        const name = btn.getAttribute('data-name');
        if (name) names.add(name.trim().toLowerCase());
      });
      doc.querySelectorAll('.food-item h2').forEach(h2 => {
        const name = h2.textContent.trim();
        if (name) names.add(name.toLowerCase());
      });
      searchIndex.set(restu, Array.from(names));
    } catch (error) {
      console.warn('Search index fetch failed for', url.toString(), error);
    }
  });
  await Promise.all(tasks);
}

const searchIndexReady = buildSearchIndex();

if (searchInput) {
  searchInput.addEventListener('input', async () => {
    await searchIndexReady;
    applyFilters();
  });
}

if (searchButton) {
  searchButton.addEventListener('click', async (event) => {
    event.preventDefault();
    await searchIndexReady;
    applyFilters();
  });
}

document.querySelectorAll('.addtocart').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.add('clicked');
  });
});

 // Function to add an item to the cart via the backend
        async function addToCart(itemName, itemPrice) {
            const userId = 'user123'; 

            console.log('Adding to cart:');
            console.log('userId:', userId);
            console.log('itemName:', itemName);
            console.log('itemPrice:', itemPrice); // Check this value

            try {
                const response = await fetch('https://food4all-1m72.onrender.com/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        item: {
                            name: itemName,
                            price: itemPrice,
                            quantity: 1
                        }
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`${itemName} added to cart!`);
                    updateCartCount();
                } else {
                    alert(`Error adding item to cart: ${data.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while adding the item to the cart.');
            }
        }

        // Function to update the cart count in the header
        async function updateCartCount() {
            const cartCountElement = document.getElementById('cart-count');
            if (!cartCountElement) {
                console.warn("Cart count element with ID 'cart-count' not found.");
                return;
            }

            const userId = 'user123';

            try {
                const response = await fetch(`https://food4all-1m72.onrender.com/cart/${userId}`);
                const data = await response.json();

                if (response.ok && data.cart) {
                    const totalItems = data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
                    cartCountElement.textContent = totalItems;
                } else {
                    cartCountElement.textContent = '0';
                }
            } catch (error) {
                console.error('Error fetching cart count:', error);
                cartCountElement.textContent = '0';
            }
        }

        document.querySelectorAll('.addtocart').forEach(button => {
            button.addEventListener('click', () => {
                const itemName = button.dataset.name;
                const itemPrice = parseFloat(button.dataset.price);

                console.log('Extracted itemName:', itemName);
                console.log('Extracted itemPrice:', itemPrice);

                if (itemName && !isNaN(itemPrice)) {
                    addToCart(itemName, itemPrice); // Call the function to add to cart
                } else {
                    console.error("Could not extract valid item data from button.");
                    alert("Could not add item to cart. Please try again.");
                }
            });
        });

        // Add event listener for the cart button
        const cartButton = document.getElementById('cart-button');
        if (cartButton) {
            cartButton.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.href = 'cart.html';
            });
        }
        updateCartCount();

