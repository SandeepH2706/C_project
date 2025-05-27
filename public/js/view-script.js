let allPatients = {};

function renderPatients(filter = '') {
    const container = document.getElementById('patients-container');
    container.innerHTML = '';
    
    for (const [patientName, dates] of Object.entries(allPatients)) {
        if (filter && !patientName.toLowerCase().includes(filter.toLowerCase())) {
            continue;
        }
        
        const patientCard = document.createElement('div');
        patientCard.className = 'patient-card';
        
        let prescriptionsHTML = '';
        for (const [date, medications] of Object.entries(dates)) {
            prescriptionsHTML += `
                <div class="prescription-group">
                    <div class="prescription-date">${date}</div>
                    <table class="medication-table">
                        <thead>
                            <tr>
                                <th>Medicine</th>
                                <th>Dosage</th>
                                <th>Schedule</th>
                                <th>Expiry</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${medications.map(med => `
                                <tr>
                                    <td>${med.name}</td>
                                    <td>${med.dosage}</td>
                                    <td>${med.schedule}</td>
                                    <td>
                                        ${med.expiry}
                                        <span class="status-indicator ${new Date(med.expiry) < new Date() ? 'status-expired' : ''}">
                                            ${new Date(med.expiry) < new Date() ? 'Expired' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        patientCard.innerHTML = `
            <div class="patient-header">
                <h2>${patientName}</h2>
            </div>
            ${prescriptionsHTML}
        `;
        container.appendChild(patientCard);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Fetch prescriptions (server will filter based on user role)
    fetch('/prescriptions.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch prescriptions');
            }
            return response.text();
        })
        .then(data => {
            if (!data.trim()) {
                document.getElementById('patients-container').innerHTML = 
                    '<p style="text-align: center; color: #666;">No prescriptions found.</p>';
                return;
            }
            
            const prescriptions = data.trim().split('\n');
            
            // Group by patient name first, then by date
            allPatients = prescriptions.reduce((acc, line) => {
                const [name, date, ...meds] = line.split('|');
                const patientName = name.trim();
                
                if (!acc[patientName]) {
                    acc[patientName] = {};
                }
                
                const prescriptionDate = date.trim();
                if (!acc[patientName][prescriptionDate]) {
                    acc[patientName][prescriptionDate] = [];
                }
                
                meds.forEach(m => {
                    const [medName, dosage, schedule, expiry] = m.split(';');
                    acc[patientName][prescriptionDate].push({
                        name: medName?.trim(),
                        dosage: dosage?.trim(),
                        schedule: schedule?.trim(),
                        expiry: expiry?.trim()
                    });
                });
                
                return acc;
            }, {});

            renderPatients();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('patients-container').innerHTML = 
                '<p style="text-align: center; color: red;">Error loading prescriptions. Please try again.</p>';
        });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            renderPatients(e.target.value);
        });
    }
});
