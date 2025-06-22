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

