const buttons = document.querySelectorAll('button[data-filter]');
const restaurants = document.querySelectorAll('.restu');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedCategory = button.getAttribute('data-filter');

    restaurants.forEach(restu => {
      const categories = restu.getAttribute('data-category').split(" ");

      if (selectedCategory === 'all' || categories.includes(selectedCategory)) {
        restu.style.display = 'block';
      } else {
        restu.style.display = 'none';
      }
    });
  });
});

document.querySelectorAll('.addtocart').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.add('clicked');
  });
});

 // Function to add an item to the cart via the backend
        async function addToCart(itemName, itemPrice) {
            const userId = 'user123'; // Replace with a dynamic user ID later

            console.log('Adding to cart:');
            console.log('userId:', userId);
            console.log('itemName:', itemName);
            console.log('itemPrice:', itemPrice); // Check this value

            try {
                const response = await fetch('http://localhost:3000/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        item: {
                            name: itemName,
                            price: itemPrice, // This should now be a number
                            quantity: 1 // Add 1 item at a time
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

            const userId = 'user123'; // Replace with a dynamic user ID later

            try {
                const response = await fetch(`http://localhost:3000/cart/${userId}`);
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

        // Add event listeners to "Add to cart" buttons
        document.querySelectorAll('.addtocart').forEach(button => {
            button.addEventListener('click', () => {
                // Extract item name and price from data attributes
                const itemName = button.dataset.name;
                const itemPrice = parseFloat(button.dataset.price); // Parse to number

                // Add console logs here to verify extraction
                console.log('Extracted itemName:', itemName);
                console.log('Extracted itemPrice:', itemPrice);

                // Check if extracted values are valid before adding to cart
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

        // Call updateCartCount on page load to display the initial count
        updateCartCount();

