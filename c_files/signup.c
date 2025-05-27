#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>

#define MAX_LEN 100

int main(int argc, char *argv[]) {
    if (argc != 4) {
        fprintf(stderr, "Usage: %s <cred_file> <user> <pass>\n", argv[0]);
        return 1;
    }

    const char *cred_file = argv[1];
    const char *user = argv[2];
    const char *pass = argv[3];

    // Input validation
    if (strlen(user) >= MAX_LEN || strlen(pass) >= MAX_LEN) {
        fprintf(stderr, "Credentials too long (max 99 chars)\n");
        return 1;
    }

    // Check if user exists
    FILE *fp = fopen(cred_file, "r");
    if (fp) {
        char existing_user[MAX_LEN];
        while (fscanf(fp, "%99s", existing_user) == 1) {
            if (strcmp(user, existing_user) == 0) {
                fclose(fp);
                fprintf(stderr, "Username already exists\n");
                return 1;
            }
            fscanf(fp, "%*s"); // Skip password
        }
        fclose(fp);
    }

    // Append new user
    fp = fopen(cred_file, "a");
    if (!fp) {
        perror("Error opening credentials file");
        return 1;
    }

    fprintf(fp, "%s %s\n", user, pass);
    fclose(fp);

    // Set secure permissions
    chmod(cred_file, S_IRUSR | S_IWUSR);
    return 0;
}
