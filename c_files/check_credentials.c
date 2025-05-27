#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_LEN 100

int main(int argc, char *argv[]) {
    if (argc != 4) {
        fprintf(stderr, "Usage: %s <cred_file> <user> <pass>\n", argv[0]);
        return 1;
    }

    const char *cred_file = argv[1];
    const char *user = argv[2];
    const char *pass = argv[3];

    // Debug print inputs
    printf("Checking credentials in: %s\n", cred_file);
    printf("Username: '%s'\nPassword: '%s'\n", user, pass);

    if (strlen(user) >= MAX_LEN || strlen(pass) >= MAX_LEN) {
        fprintf(stderr, "Error: Credentials exceed maximum length (100 chars)\n");
        return 1;    //General error
    } 

    FILE *fp = fopen(cred_file, "r");
    if (!fp) {
        perror("Error opening credentials file");
        return 2;       //	File not found or file I/O error
    }

    char file_user[MAX_LEN];
    char file_pass[MAX_LEN];

    int user_exists = 0;
    int authenticated = 0;

    while (fscanf(fp, "%99s %99s", file_user, file_pass) == 2) {
        printf("Comparing with: %s/%s\n", file_user, file_pass);
        
        if (strcmp(user, file_user) == 0) {
            user_exists = 1;
            if (strcmp(pass, file_pass) == 0) {
                authenticated = 1;
            }
            break;
        }
    }

    fclose(fp);

    if (!user_exists) {
        fprintf(stderr, "User '%s' not found in credentials file\n", user);
        return 2;
    }

    return authenticated ? 0 : 1;
}






// ┌───────────────────────┐
// │        START          │
// └──────────┬────────────┘
//            ↓
// ┌───────────────────────┐
// │   Check argc == 4?    │
// └──────────┬────────────┘
//            ├── No → Print "Usage error" → Return error ❌
//            ↓
// ┌───────────────────────┐
// │ Assign cred_file,     │
// │ user, pass from argv  │
// └──────────┬────────────┘
//            ↓
// ┌───────────────────────┐
// │ Check user/pass       │
// │ length < 100?         │
// └──────────┬────────────┘
//            ├── No → Print "Length error" → Return error ❌
//            ↓
// ┌───────────────────────┐
// │ Open cred_file (read) │
// └──────────┬────────────┘
//            ├── Fail → Print "File error" → Return 2 ❌
//            ↓
// ┌───────────────────────┐
// │ Initialize flags:     │
// │ user_exists=0         │
// │ authenticated=0       │
// └──────────┬────────────┘
//            ↓
// ┌───────────────────────┐
// │ Loop: Read user/pass  │
// │ from file (fscanf)    │
// └──────────┬────────────┘
//            ├── Failed → End loop ⤸
//            ↓
// ┌───────────────────────┐
// │ Compare input_user    │
// │ vs file_user          │
// └──────────┬────────────┘
//            ├── No match → Continue loop ↺
//            ↓
//       User found! ✔️
//            ↓
// ┌───────────────────────┐
// │ Set user_exists=1     │
// │ Compare input_pass    │
// │ vs file_pass          │
// └──────────┬────────────┘
//            ├── Match → authenticated=1 → Break loop ✔️
//            ↓
//        Password mismatch ❌
//            ↓
// ┌───────────────────────┐
// │ Close cred_file       │
// └──────────┬────────────┘
//            ↓
// ┌───────────────────────┐
// │ user_exists == 0?     │
// └──────────┬────────────┘
//            ├── Yes → Print "User not found" → Return 2 ❌
//            ↓
// ┌───────────────────────┐
// │ authenticated == 1?   │
// └──────────┬────────────┘
//            ├── No → Return 1 ❌
//            ↓
//        Success! ✔️
//            ↓
//        Return 0 ✅
