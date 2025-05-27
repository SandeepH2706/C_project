document.getElementById('deleteForm').addEventListener('submit', async (e) => {
    e.preventDefault();                                           //reloading the page or navigating.
    const messageEl = document.getElementById('message');
    messageEl.style.display = 'none';

//This object data now has two properties: name and date.
    const data = {
        name: document.getElementById('patientName').value.trim(),
        date: document.getElementById('prescriptionDate').value
    };

    try {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        const result = await response.json();             //Converts the response from JSON format into a JavaScript object result.
        if (response.ok) {                                //status 200-299  responded with success
            showMessage(result.message || 'Prescription deleted successfully!', 'success');
        } else {
            showMessage(result.error || 'Deletion failed', 'error');  //If success, show a success message (either from the server or default
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, 'error');
    }
});

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.style.color = type === 'error' ? 'var(--error)' : 'green';
    messageEl.style.display = 'block';
}







// It waits for you to submit a form with ID deleteForm.

// When you submit, it stops the form from doing the normal page reload.

// It collects two pieces of information from the form:

// Patient name (patientName input)

// Prescription date (prescriptionDate input)

// It sends this data to a server at the /delete URL using a POST request.

// It waits for the server to respond.

// If the server says success, it shows a success message.

// If there’s an error, it shows an error message.

// If there’s a network problem (like no internet), it shows a network error message.

