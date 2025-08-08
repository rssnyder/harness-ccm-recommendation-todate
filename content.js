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
    const recommendationElements = document.querySelectorAll('.TableV2--row');
    if (recommendationElements.length === 0) {
      console.error('Savings Tracker: No recommendation elements found with selector ".TableV2--body".');
      return;
    }

    recommendationElements.forEach((element, index) => {
      const cells = element.querySelectorAll('div[role="cell"]');

      // The savings amount is in the 2nd cell of the row.
      const savingsCell = cells.length > 1 ? cells[1] : null;
      const monthlySavingsElement = savingsCell ? savingsCell.querySelector('.StyledProps--font-variation-h5') : null;

      // Find the cell with the recommendation type image, then get the next cell, which has the date.
      const recommendationTypeCell = element.querySelector('img[src*="data:image/svg+xml"]')?.closest('div[role="cell"]');
      const dateCell = recommendationTypeCell ? recommendationTypeCell.nextElementSibling : null;
      const appliedDateElement = dateCell ? dateCell.querySelector('p') : null;

      if (!monthlySavingsElement) {
        console.error(`Savings Tracker (item ${index}): Could not find monthly savings element.`);
        return;
      }
      if (!appliedDateElement) {
        console.error(`Savings Tracker (item ${index}): Could not find applied date element.`);
        return;
      }

      const monthlySavingsText = monthlySavingsElement.textContent;
      const appliedDateText = appliedDateElement.textContent;

      const monthlySavings = parseFloat(monthlySavingsText.replace(/[^0-9.]/g, ''));
      if (isNaN(monthlySavings)) {
        console.error(`Savings Tracker (item ${index}): Could not parse monthly savings from "${monthlySavingsText}".`);
        return;
      }

      const appliedDate = new Date(appliedDateText);
      if (isNaN(appliedDate.getTime())) {
        console.error(`Savings Tracker (item ${index}): Could not parse date from "${appliedDateText}".`);
        return;
      }

      const today = new Date();
      const timeDifference = today.getTime() - appliedDate.getTime();
      const daysPassed = Math.floor(timeDifference / (1000 * 3600 * 24));
      const dailySavings = monthlySavings / 30;
      const totalSavings = dailySavings * daysPassed;

      // Avoid adding duplicate displays
      if (element.querySelector('.total-savings-display')) return;

      const totalSavingsElement = document.createElement('div');
      totalSavingsElement.className = 'total-savings-display';
      totalSavingsElement.style.color = 'green';
      totalSavingsElement.style.fontWeight = 'bold';
      totalSavingsElement.textContent = `Total Savings To Date: $${totalSavings.toFixed(2)}`;

      // Append the new element to the savings cell to place it below the monthly savings.
      if (savingsCell) {
        savingsCell.appendChild(totalSavingsElement);
      }
    });
  } catch (error) {
    console.error('Savings Tracker: An unexpected error occurred.', error);
    displayErrorOnPage(error.message);
  }
}

// Run the function when the page is loaded.
window.addEventListener('load', calculateAndDisplayTotalSavings);

// Also run it when the content of the page might change dynamically.
const observer = new MutationObserver(calculateAndDisplayTotalSavings);
observer.observe(document.body, { childList: true, subtree: true });
