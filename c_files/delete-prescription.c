#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_LINE 1024
#define FILE_NAME "prescriptions.txt"
#define TEMP_FILE "temp_prescriptions.txt"

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <patient_name> <date>\n", argv[0]);
        return 1;
    }

    FILE *fp = fopen(FILE_NAME, "r");
    if (!fp) {
        fprintf(stderr, "Cannot open %s for reading\n", FILE_NAME);
        return 1;
    }

    FILE *temp = fopen(TEMP_FILE, "w");
    if (!temp) {
        fclose(fp);
        fprintf(stderr, "Cannot open %s for writing\n", TEMP_FILE);
        return 1;
    }

    char line[MAX_LINE];
    int deleted = 0;

    while (fgets(line, sizeof(line), fp)) {
        // Check if both name and date appear in the line
        if (strstr(line, argv[1]) && strstr(line, argv[2])) {
            deleted = 1;
            continue; // Skip this line (don't write to temp file)
        }
        fputs(line, temp);
    }

    fclose(fp);
    fclose(temp);

    if (deleted) {
        remove(FILE_NAME);
        rename(TEMP_FILE, FILE_NAME);
    } else {
        remove(TEMP_FILE);
    }

    return 0;
}
