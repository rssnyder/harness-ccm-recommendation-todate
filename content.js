// This script runs on the page and calculates total savings.

function displayErrorOnPage(message) {
  const errorElement = document.createElement('div');
  errorElement.textContent = `Savings Tracker Error: ${message}`;
  errorElement.style.backgroundColor = 'red';
  errorElement.style.color = 'white';
  errorElement.style.padding = '10px';
  errorElement.style.position = 'fixed';
  errorElement.style.top = '0';
  errorElement.style.left = '0';
  errorElement.style.right = '0';
  errorElement.style.zIndex = '9999';
  errorElement.style.textAlign = 'center';
  document.body.appendChild(errorElement);
  setTimeout(() => errorElement.remove(), 5000); // Remove after 5 seconds
}

function calculateAndDisplayTotalSavings() {
  try {
    // Check if the key element with the text "Savings Realized" exists.
    const savingsRealizedElement = Array.from(document.querySelectorAll('p')).find(p => p.textContent.trim() === 'Savings Realized');
    if (!savingsRealizedElement) {
      return; // If it doesn't exist, this isn't the right page. Stop.
    }

    const recommendationElements = document.querySelectorAll('.TableV2--row');
    if (recommendationElements.length === 0) {
      return; // No recommendations found, do nothing.
    }

    let grandTotalSavings = 0;

    recommendationElements.forEach((element, index) => {
      const cells = element.querySelectorAll('div[role="cell"]');

      const savingsCell = cells.length > 1 ? cells[1] : null;
      const monthlySavingsElement = savingsCell ? savingsCell.querySelector('.StyledProps--font-variation-h5') : null;

      const dateCell = cells.length > 3 ? cells[3] : null;
      const appliedDateElement = dateCell ? dateCell.querySelector('p') : null;

      if (!monthlySavingsElement || !appliedDateElement) {
        return; // Skip if we can't find the required elements
      }

      const monthlySavingsText = monthlySavingsElement.textContent;
      const appliedDateText = appliedDateElement.textContent;

      const monthlySavings = parseFloat(monthlySavingsText.replace(/[^0-9.]/g, ''));
      const appliedDate = new Date(appliedDateText);

      if (isNaN(monthlySavings) || isNaN(appliedDate.getTime())) {
        return; // Skip if data is not valid
      }

      const today = new Date();
      const timeDifference = today.getTime() - appliedDate.getTime();
      const daysPassed = Math.floor(timeDifference / (1000 * 3600 * 24));
      const dailySavings = monthlySavings / 30;
      const totalSavings = dailySavings * daysPassed;

      grandTotalSavings += totalSavings;

      // Update individual row display
      let totalSavingsElement = savingsCell.querySelector('.total-savings-display');
      if (!totalSavingsElement) {
        totalSavingsElement = document.createElement('div');
        totalSavingsElement.className = 'total-savings-display';
        totalSavingsElement.style.color = 'green';
        totalSavingsElement.style.fontWeight = 'bold';
        savingsCell.appendChild(totalSavingsElement);
      }
      totalSavingsElement.textContent = `Total Savings To Date: $${totalSavings.toFixed(2)}`;
    });

    // Update the grand total in the impact card
    const impactCardContainer = document.querySelector('.ccmui_RecommendationCards-module_cardCtn_ptkiGu .Layout--vertical');
    if (impactCardContainer) {
      let grandTotalElement = impactCardContainer.querySelector('.custom-grand-total');
      if (!grandTotalElement) {
        grandTotalElement = document.createElement('p');
        grandTotalElement.className = 'custom-grand-total';
        grandTotalElement.style.marginTop = '10px';
        grandTotalElement.style.fontWeight = 'bold';
        impactCardContainer.appendChild(grandTotalElement);
      }
      grandTotalElement.textContent = `Computed Total Savings: $${grandTotalSavings.toFixed(2)}`;
    }

  } catch (error) {
    console.error('Harness Recommendations Tracker: An unexpected error occurred.', error);
    displayErrorOnPage(error.message);
  }
}

// Debounce function to limit how often the calculation runs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Create a debounced version of our calculation function
const debouncedCalculate = debounce(calculateAndDisplayTotalSavings, 500);

// Run the debounced function when the page loads and when the DOM changes.
window.addEventListener('load', debouncedCalculate);
const observer = new MutationObserver(debouncedCalculate);
observer.observe(document.body, { childList: true, subtree: true });
