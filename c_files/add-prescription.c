#include <stdio.h>
#include <string.h>
#include <time.h>
#include <ctype.h>     //useful for character checking like isdigit, isalpha

#define MAX_PATIENT_LEN 100
#define MAX_MED_LEN 50
#define MAX_DOSAGE_LEN 20
#define MAX_SCHEDULE_LEN 50
#define MAX_EXPIRY_LEN 20
#define MAX_MEDS 10
#define PRESCRIPTION_FILE "prescriptions.txt"

typedef struct {
    char patient[MAX_PATIENT_LEN];
    char timestamp[20];
    int count;
    char medicines[MAX_MEDS][MAX_MED_LEN];
    char dosages[MAX_MEDS][MAX_DOSAGE_LEN];
    char schedules[MAX_MEDS][MAX_SCHEDULE_LEN];
    char expiries[MAX_MEDS][MAX_EXPIRY_LEN];
} Prescription;

//This removes the newline \n from strings read using fgets() (Because fgets keeps \n)
void trimNewline(char *str) {
    int len = strlen(str);
    if (len > 0 && str[len-1] == '\n') str[len-1] = '\0';
}

int getMedicineDetails(const char *medName, char *expiry) {
    // In a real app, you would look up the medicine in your database.
    // For this demo, we'll just set a default expiry.
    sprintf(expiry, "2025-12-31");
    return 1; // Return 1 for success (found)
}

void listAllMedicines() {
    // In a real app, list available medicines.
    printf("(Demo: Any medicine name is accepted)\n");
}

void addPrescription() {
    FILE *fp = fopen(PRESCRIPTION_FILE, "a");
    if (!fp) {
        printf("Error opening prescriptions file!\n");
        return;
    }
    Prescription p;
    time_t now = time(NULL);
    struct tm *tm = localtime(&now);
    
    if (!fgets(p.patient, sizeof(p.patient), stdin)) return;
    trimNewline(p.patient);
    
    // Generate timestamp
    strftime(p.timestamp, sizeof(p.timestamp), "%Y-%m-%d %H:%M", tm);

    // Read number of medicines
    char countStr[10];
    if (!fgets(countStr, sizeof(countStr), stdin)) return; // pointer
    sscanf(countStr, "%d", &p.count);

    // Read medicine details
    for (int i = 0; i < p.count; i++) {
        if (!fgets(p.medicines[i], sizeof(p.medicines[i]), stdin)) return;
        trimNewline(p.medicines[i]);
        getMedicineDetails(p.medicines[i], p.expiries[i]);
        if (!fgets(p.dosages[i], sizeof(p.dosages[i]), stdin)) return;
        trimNewline(p.dosages[i]);
        if (!fgets(p.schedules[i], sizeof(p.schedules[i]), stdin)) return;
        trimNewline(p.schedules[i]);
    }
    // Save to file
    fprintf(fp, "%s|%s", p.patient, p.timestamp);
    for (int i = 0; i < p.count; i++) {
        fprintf(fp, "|%s;%s;%s;%s",
                p.medicines[i], p.dosages[i], p.schedules[i], p.expiries[i]);
    }
    fprintf(fp, "\n");
    fclose(fp);
    printf("Prescription added successfully for %s with %d medicines!\n", p.patient, p.count);
}

int main() {
    addPrescription();
    return 0;
}
