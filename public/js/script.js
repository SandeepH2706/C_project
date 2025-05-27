let medicineCount = 1;

function addMedicineField() {
    const container = document.getElementById("medicineContainer");
    const div = document.createElement("div");
    div.className = "medicine-entry";
    medicineCount++;
    div.innerHTML = `
        <h3>Medicine ${medicineCount}</h3>
        <div class="grid">
            <div>
                <input type="text" placeholder="Medicine Name" required class="medName">
            </div>
            <div>
                <input type="text" placeholder="Dosage (e.g., 500mg)" required class="dosage">
            </div>
            <div>
                <input type="text" placeholder="Schedule (e.g., 3x daily)" required class="schedule">
            </div>
        </div>
    `;
    container.appendChild(div);
}

document.getElementById("prescriptionForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const patientName = document.getElementById("patientName").value.trim();
    
    if (!patientName) {
        showError("Patient name is required");
        return;
    }
    
    const medicines = [];
    document.querySelectorAll(".medName").forEach((med, i) => {
        const dosage = document.querySelectorAll(".dosage")[i].value.trim();
        const schedule = document.querySelectorAll(".schedule")[i].value.trim();
        
        if (med.value.trim() && dosage && schedule) {
            medicines.push({
                name: med.value.trim(),
                dosage: dosage,
                schedule: schedule
            });
        }
    });
    
    if (medicines.length === 0) {
        showError("At least one medicine is required");
        return;
    }
    
    try {
        const response = await fetch("/add-prescription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patient: patientName,
                medicines: medicines
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessModal(patientName, medicines);
            document.getElementById("prescriptionForm").reset();
            medicineCount = 1;
            document.getElementById("medicineContainer").innerHTML = `
                <div class="medicine-entry">
                    <h3>Medicine 1</h3>
                    <div class="grid">
                        <div>
                            <input type="text" placeholder="Medicine Name" required class="medName">
                        </div>
                        <div>
                            <input type="text" placeholder="Dosage (e.g., 500mg)" required class="dosage">
                        </div>
                        <div>
                            <input type="text" placeholder="Schedule (e.g., 3x daily)" required class="schedule">
                        </div>
                    </div>
                </div>
            `;
        } else {
            showError(result.error || "Failed to save prescription");
        }
    } catch (error) {
        showError("Network error: " + error.message);
    }
});

function showSuccessModal(patientName, medicines) {
    const modal = document.getElementById("prescriptionModal");
    const overlay = document.getElementById("modalOverlay");
    const modalContent = document.getElementById("modalContent");
    
    let medicineList = '<div class="prescription-details">';
    medicineList += `<h3>Patient: ${patientName}</h3>`;
    medicineList += '<h4>Medications:</h4>';
    medicines.forEach((med, index) => {
        medicineList += `
            <div class="medicine-detail">
                <p><strong>Medicine ${index + 1}:</strong> ${med.name}</p>
                <p><strong>Dosage:</strong> ${med.dosage}</p>
                <p><strong>Schedule:</strong> ${med.schedule}</p>
            </div>
        `;
    });
    medicineList += '</div>';
    
    modalContent.innerHTML = medicineList;
    modal.style.display = "block";
    overlay.style.display = "block";
}

function closeModal() {
    document.getElementById("prescriptionModal").style.display = "none";
    document.getElementById("modalOverlay").style.display = "none";
}

function showError(message) {
    const errorDiv = document.getElementById("nameError");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
        errorDiv.style.display = "none";
    }, 5000);
}

// Close modal when clicking outside
document.getElementById("modalOverlay").addEventListener("click", closeModal);
